import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../config/firebase';
import { ENV } from '../config/env';
import { PaymentRecord } from '../types/payment';

export class PaymentService {
  private razorpayInstance: Razorpay | null = null;
  private paymentsCollection = db.collection('payments');
  private ordersCollection = db.collection('orders');

  constructor() {
    if (ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET) {
      try {
        this.razorpayInstance = new Razorpay({
          key_id: ENV.RAZORPAY_KEY_ID,
          key_secret: ENV.RAZORPAY_KEY_SECRET,
        });
        console.log('[Razorpay] Initialized with test API credentials.');
      } catch (err) {
        console.warn('[Razorpay] Initialization skipped:', err);
      }
    }
  }

  isRazorpayAvailable(): boolean {
    return this.razorpayInstance !== null;
  }

  async createRazorpayOrder(orderId: string, amountInRupees: number): Promise<{
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }> {
    if (!this.razorpayInstance) {
      throw new Error('Razorpay integration is not configured with API credentials.');
    }

    const amountInPaise = Math.round(amountInRupees * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId.slice(0, 40),
      notes: { orderId },
    };

    const razorpayOrder = await this.razorpayInstance.orders.create(options);

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInRupees,
      currency: 'INR',
      keyId: ENV.RAZORPAY_KEY_ID,
    };
  }

  async verifyRazorpaySignature(params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    signature: string;
    studentId: string;
  }): Promise<boolean> {
    if (!ENV.RAZORPAY_KEY_SECRET) {
      throw new Error('Server Razorpay secret is missing.');
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, signature, studentId } = params;

    // HMAC-SHA256 signature verification: generated_signature = hmac_sha256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid Razorpay signature verification.');
    }

    // Persist payment document
    const paymentDoc = this.paymentsCollection.doc();
    const now = new Date().toISOString();
    const paymentRecord: PaymentRecord = {
      paymentId: paymentDoc.id,
      orderId,
      studentId,
      amount: 0, // updated from order
      provider: 'razorpay',
      providerReference: razorpayPaymentId,
      status: 'captured',
      createdAt: now,
      updatedAt: now,
    };

    await paymentDoc.set(paymentRecord);

    // Update order payment status
    await this.ordersCollection.doc(orderId).update({
      paymentStatus: 'paid',
      updatedAt: now,
    });

    return true;
  }

  async processTestModePayment(orderId: string, studentId: string, amount: number): Promise<PaymentRecord> {
    const paymentDoc = this.paymentsCollection.doc();
    const now = new Date().toISOString();
    const testReference = `TEST-PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const paymentRecord: PaymentRecord = {
      paymentId: paymentDoc.id,
      orderId,
      studentId,
      amount,
      provider: 'test',
      providerReference: testReference,
      status: 'captured',
      createdAt: now,
      updatedAt: now,
    };

    await paymentDoc.set(paymentRecord);

    await this.ordersCollection.doc(orderId).update({
      paymentStatus: 'paid',
      updatedAt: now,
    });

    return paymentRecord;
  }
}

export const paymentService = new PaymentService();
