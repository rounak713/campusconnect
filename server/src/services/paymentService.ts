import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_secure_key_101112';

export class PaymentService {
  /**
   * Creates an Indian micro-payment order (₹10.00 = 1000 paise).
   */
  static createOrder(userId: string): {
    orderId: string;
    amountPaise: number;
    currency: string;
    keyId: string;
  } {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const orderId = `order_${timestamp}_${randomSuffix}`;

    return {
      orderId,
      amountPaise: 1000, // ₹10.00
      currency: 'INR',
      keyId: 'rzp_live_campusconnect_demo'
    };
  }

  /**
   * Verifies Razorpay HMAC-SHA256 signature using constant-time comparison.
   */
  static verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  /**
   * Generates a valid HMAC-SHA256 signature for automated tests.
   */
  static signPayloadForTesting(payloadString: string): string {
    return crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(payloadString)
      .digest('hex');
  }
}
