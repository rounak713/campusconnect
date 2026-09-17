import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { CrushController } from '../controllers/crushController.js';
import { PaymentController } from '../controllers/paymentController.js';
import { ChatController } from '../controllers/chatController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

export const apiRouter = Router();

// Rate limiters
const authLimiter = AuthMiddleware.createRateLimiter(5, 60 * 1000); // 5 requests / min
const crushLimiter = AuthMiddleware.createRateLimiter(10, 60 * 1000); // 10 submissions / min

// 1. Authentication & Colleges
apiRouter.post('/auth/otp/request', authLimiter, AuthController.requestOtp);
apiRouter.post('/auth/otp/verify', authLimiter, AuthController.verifyOtp);
apiRouter.get('/auth/me', AuthMiddleware.requireAuth, AuthController.getCurrentUser);
apiRouter.get('/colleges', AuthController.getColleges);

// 2. Secret Crush Matching
apiRouter.post('/crush/submit', AuthMiddleware.requireAuth, crushLimiter, CrushController.submitCrush);
apiRouter.get('/crush/list', AuthMiddleware.requireAuth, CrushController.listCrushes);
apiRouter.delete('/crush/:id', AuthMiddleware.requireAuth, CrushController.revokeCrush);

// 3. Micro-Payments (₹10 UPI)
apiRouter.post('/payment/create-order', AuthMiddleware.requireAuth, PaymentController.createOrder);
apiRouter.post('/payment/webhook', PaymentController.razorpayWebhook); // Authenticated via HMAC-SHA256 signature

// 4. Ephemeral Mutual Chat
apiRouter.post('/chat/message', AuthMiddleware.requireAuth, ChatController.sendMessage);
apiRouter.get('/chat/:commitmentId', AuthMiddleware.requireAuth, ChatController.getMessages);
apiRouter.delete('/chat/:commitmentId/unmatch', AuthMiddleware.requireAuth, ChatController.clearChatAndUnmatch);
