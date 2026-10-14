export interface PaymentRecord {
  paymentId: string;
  orderId: string;
  studentId: string;
  amount: number;
  provider: 'cash' | 'test' | 'razorpay';
  providerReference: string;
  status: 'pending' | 'captured' | 'failed';
  createdAt: string;
  updatedAt: string;
}
