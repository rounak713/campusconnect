import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { PaymentService } from '../services/paymentService.js';

export class PaymentController {
  /**
   * Generates a ₹10 UPI payment order.
   */
  static async createOrder(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const orderData = PaymentService.createOrder(userId);
    const idempotencyKey = `idem_${orderData.orderId}_${crypto.randomBytes(4).toString('hex')}`;

    const order = await prisma.paymentOrder.create({
      data: {
        userId,
        orderId: orderData.orderId,
        amountPaise: orderData.amountPaise,
        currency: orderData.currency,
        status: 'INITIATED',
        slotsGranted: 1,
        idempotencyKey
      }
    });

    return res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        amountPaise: order.amountPaise,
        currency: order.currency,
        keyId: orderData.keyId
      }
    });
  }

  /**
   * Secure Razorpay / Cashfree Webhook Listener.
   */
  static async razorpayWebhook(req: Request, res: Response) {
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'MISSING_SIGNATURE', message: 'Webhook signature header missing' });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);

    // 1. Verify HMAC-SHA256 signature using constant-time comparison
    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Security Alert] Invalid Razorpay webhook signature detected!');
      return res.status(401).json({ error: 'INVALID_SIGNATURE', message: 'Signature verification failed' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // 2. Handle successful payment capture event
    if (event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity || event.payment;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id || `pay_${Date.now()}`;
      const amount = paymentEntity?.amount; // in paise

      if (amount !== 1000) {
        console.warn(`[Payment Warning] Unexpected micro-transaction amount: ${amount}`);
        return res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Expected ₹10.00' });
      }

      try {
        // 3. Idempotent fulfillment transaction
        const result = await prisma.$transaction(async (tx) => {
          const order = await tx.paymentOrder.findUnique({
            where: { orderId }
          });

          if (!order) {
            throw new Error('ORDER_NOT_FOUND');
          }

          // Idempotency check: Ignore duplicate webhook deliveries
          if (order.status === 'SUCCESS') {
            return { alreadyProcessed: true, userId: order.userId };
          }

          // Mark order as paid
          await tx.paymentOrder.update({
            where: { orderId },
            data: {
              paymentId,
              status: 'SUCCESS',
              confirmedAt: new Date()
            }
          });

          // Credit +1 crush slot to user
          const updatedUser = await tx.user.update({
            where: { id: order.userId },
            data: {
              crushSlotsTotal: { increment: order.slotsGranted }
            }
          });

          return { 
            alreadyProcessed: false, 
            userId: order.userId, 
            newTotalSlots: updatedUser.crushSlotsTotal 
          };
        });

        console.log(`[Payment Captured] ₹10 confirmed for user ${result.userId}. Total slots: ${result.newTotalSlots ?? 'unchanged'}`);
        return res.status(200).json({ status: 'PROCESSED', result });

      } catch (err: any) {
        console.error('Error processing webhook:', err.message);
        if (err.message === 'ORDER_NOT_FOUND') {
          return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
        }
        return res.status(500).json({ error: 'TRANSACTION_ERROR' });
      }
    }

    return res.status(200).json({ status: 'IGNORED' });
  }
}
