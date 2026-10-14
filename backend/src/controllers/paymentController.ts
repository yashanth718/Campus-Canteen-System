import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';

export async function createPaymentOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { orderId, amount } = req.body;

    if (paymentService.isRazorpayAvailable()) {
      const razorpayOrder = await paymentService.createRazorpayOrder(orderId, amount);
      res.json({
        success: true,
        mode: 'razorpay',
        data: razorpayOrder,
      });
      return;
    }

    // Default: Test payment mode
    res.json({
      success: true,
      mode: 'test_mode',
      data: {
        orderId,
        amount,
        currency: 'INR',
        instructions: 'Test payment mode enabled. Submit verification to simulate instant capture.',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { orderId, paymentId, providerReference, signature, amount } = req.body;

    if (signature && paymentService.isRazorpayAvailable()) {
      await paymentService.verifyRazorpaySignature({
        orderId,
        razorpayOrderId: providerReference,
        razorpayPaymentId: paymentId,
        signature,
        studentId: req.user.uid,
      });

      res.json({ success: true, message: 'Razorpay payment verified and captured successfully.' });
      return;
    }

    // Test mode verification
    const record = await paymentService.processTestModePayment(orderId, req.user.uid, amount || 0);
    res.json({
      success: true,
      message: 'Test payment processed successfully.',
      data: record,
    });
  } catch (err) {
    next(err);
  }
}
