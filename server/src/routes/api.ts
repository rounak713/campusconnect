import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/authController.js';
import { VerificationController } from '../controllers/verificationController.js';
import { AdminVerificationController } from '../controllers/adminVerificationController.js';
import { MAX_UPLOAD_BYTES } from '../services/idStorageService.js';
import { CrushController } from '../controllers/crushController.js';
import { PaymentController } from '../controllers/paymentController.js';
import { ChatController } from '../controllers/chatController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';

export const apiRouter = Router();

// Rate limiters
const authLimiter = AuthMiddleware.createRateLimiter(5, 60 * 1000); // 5 requests / min
const crushLimiter = AuthMiddleware.createRateLimiter(10, 60 * 1000); // 10 submissions / min
const verifyLimiter = AuthMiddleware.createRateLimiter(5, 60 * 1000); // 5 verification calls / min
const uploadLimiter = AuthMiddleware.createRateLimiter(3, 60 * 60 * 1000); // 3 ID uploads / hour

// ID photos are buffered in memory only, then streamed to private object storage.
const idUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 }
});

// 1. Authentication & Colleges
apiRouter.post('/auth/otp/request', authLimiter, AuthController.requestOtp);
apiRouter.post('/auth/otp/verify', authLimiter, AuthController.verifyOtp);
apiRouter.get('/auth/me', AuthMiddleware.requireAuth, AuthController.getCurrentUser);
apiRouter.get('/colleges', AuthController.getColleges);

// 1b. Student Verification — Method A (college email OTP) & Method B (manual ID review)
apiRouter.get('/verification/domains', VerificationController.listDomains);
apiRouter.get('/verification/status', AuthMiddleware.requireAuth, VerificationController.getStatus);
apiRouter.post(
  '/verification/email/request-otp',
  AuthMiddleware.requireAuth,
  verifyLimiter,
  VerificationController.requestEmailOtp
);
apiRouter.post(
  '/verification/email/verify-otp',
  AuthMiddleware.requireAuth,
  verifyLimiter,
  VerificationController.verifyEmailOtp
);
apiRouter.post(
  '/verification/id-card',
  AuthMiddleware.requireAuth,
  uploadLimiter,
  idUpload.single('idCard'),
  VerificationController.submitIdCard
);

// 1c. Admin Review Dashboard
apiRouter.get(
  '/admin/verifications/pending',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireAdmin,
  AdminVerificationController.listPending
);
apiRouter.post(
  '/admin/verifications/action',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireAdmin,
  AdminVerificationController.actOnVerification
);
apiRouter.get(
  '/admin/verifications/user/:userId',
  AuthMiddleware.requireAuth,
  AuthMiddleware.requireAdmin,
  AdminVerificationController.getUserHistory
);

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
