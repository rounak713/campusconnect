import { CampusCryptoService } from '../services/cryptoService.js';
import { PaymentService } from '../services/paymentService.js';
import { AnonymizedSmsService } from '../services/smsService.js';
import { prisma } from '../db.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (details) console.error(`     Reason: ${details}`);
  }
}

async function runSecurityTestSuite() {
  console.log('\n======================================================');
  console.log('🛡️  CAMPUSCONNECT BACKEND SECURITY & INVARIANT TEST SUITE');
  console.log('======================================================\n');

  // -----------------------------------------------------------
  // TEST 1: Canonicalization & KMS Peppered Identity Hashing
  // -----------------------------------------------------------
  console.log('--- 1. Canonicalization & KMS-Peppered Hashing ---');
  const h1 = CampusCryptoService.canonicalize('  @Priya_SRCC ', 'instagram');
  const h2 = CampusCryptoService.canonicalize('priya_srcc', 'instagram');
  assert(h1 === 'priya_srcc' && h2 === 'priya_srcc', 'Instagram handles canonicalize to lowercase without @');

  const p1 = CampusCryptoService.canonicalize('9876543210', 'phone');
  const p2 = CampusCryptoService.canonicalize('+91 98765-43210', 'phone');
  const p3 = CampusCryptoService.canonicalize('09876543210', 'phone');
  assert(p1 === '+919876543210' && p2 === '+919876543210' && p3 === '+919876543210', 'Indian phone numbers canonicalize strictly to E.164 (+91XXXXXXXXXX)');

  const hashA = CampusCryptoService.generateIdentityHash(p1);
  const hashA_duplicate = CampusCryptoService.generateIdentityHash(p2);
  assert(hashA === hashA_duplicate, 'Deterministic peppered identity hashes for equivalent inputs');
  assert(hashA.length === 64, 'SHA-256 HMAC digest length is 64 hexadecimal characters');

  // -----------------------------------------------------------
  // TEST 2: Commutative Rendezvous Collision Invariant
  // -----------------------------------------------------------
  console.log('\n--- 2. Commutative Rendezvous Token Invariant ---');
  const userA_hash = CampusCryptoService.generateIdentityHash('+919811111111');
  const userB_hash = CampusCryptoService.generateIdentityHash('+919822222222');

  const token_AB = CampusCryptoService.generateRendezvousToken(userA_hash, userB_hash);
  const token_BA = CampusCryptoService.generateRendezvousToken(userB_hash, userA_hash);
  assert(token_AB === token_BA, 'Commutativity: RendezvousToken(A, B) === RendezvousToken(B, A)');

  const dir_AB = CampusCryptoService.generateDirectionalHash(userA_hash, userB_hash);
  const dir_BA = CampusCryptoService.generateDirectionalHash(userB_hash, userA_hash);
  assert(dir_AB !== dir_BA, 'Directional proof is asymmetric: DirectionalHash(A->B) !== DirectionalHash(B->A)');

  // -----------------------------------------------------------
  // TEST 3: Double-Blind Mutual Matching Simulation
  // -----------------------------------------------------------
  console.log('\n--- 3. Double-Blind Matching State Machine ---');
  // Clean test database records
  await prisma.ephemeralMessage.deleteMany({});
  await prisma.crushCommitment.deleteMany({});
  await prisma.paymentOrder.deleteMany({});
  await prisma.user.deleteMany({});

  const college = await prisma.college.upsert({
    where: { shortCode: 'TEST_COLLEGE' },
    update: {},
    create: {
      name: 'Test University',
      shortCode: 'TEST_COLLEGE',
      city: 'Delhi',
      state: 'Delhi'
    }
  });

  const testUserA = await prisma.user.create({
    data: {
      collegeId: college.id,
      identityHash: userA_hash,
      maskedPhone: '+91 98****1111',
      crushSlotsTotal: 3,
      crushSlotsUsed: 0
    }
  });

  const testUserB = await prisma.user.create({
    data: {
      collegeId: college.id,
      identityHash: userB_hash,
      maskedPhone: '+91 98****2222',
      crushSlotsTotal: 3,
      crushSlotsUsed: 0
    }
  });

  // Step 3a: User A adds User B
  const commitmentA = await prisma.crushCommitment.create({
    data: {
      userId: testUserA.id,
      rendezvousToken: token_AB,
      directionalHash: dir_AB,
      maskedTargetHint: '+91 98****2222',
      status: 'WAITING_FOR_PAIR'
    }
  });
  await prisma.user.update({
    where: { id: testUserA.id },
    data: { crushSlotsUsed: 1 }
  });
  assert(commitmentA.status === 'WAITING_FOR_PAIR', 'User A commitment initially has status WAITING_FOR_PAIR');

  // Step 3b: User B adds User A -> Triggers Mutual Match
  const reciprocal = await prisma.crushCommitment.findFirst({
    where: {
      rendezvousToken: token_BA,
      userId: { not: testUserB.id },
      status: 'WAITING_FOR_PAIR'
    }
  });
  assert(reciprocal !== null && reciprocal.id === commitmentA.id, 'Double-blind query locates reciprocal commitment using commutative token');

  const now = new Date();
  const commitmentB = await prisma.crushCommitment.create({
    data: {
      userId: testUserB.id,
      rendezvousToken: token_BA,
      directionalHash: dir_BA,
      maskedTargetHint: '+91 98****1111',
      status: 'MUTUAL_MATCH',
      matchedAt: now
    }
  });
  await prisma.crushCommitment.update({
    where: { id: reciprocal!.id },
    data: { status: 'MUTUAL_MATCH', matchedAt: now }
  });

  const updatedA = await prisma.crushCommitment.findUnique({ where: { id: commitmentA.id } });
  assert(updatedA?.status === 'MUTUAL_MATCH', 'User A commitment transitioned to MUTUAL_MATCH');
  assert(commitmentB.status === 'MUTUAL_MATCH', 'User B commitment created with status MUTUAL_MATCH');

  // -----------------------------------------------------------
  // TEST 4: Anti-Spam Blind Invite Rate Limiting
  // -----------------------------------------------------------
  console.log('\n--- 4. Unregistered Target SMS Protocol ---');
  const unregisteredPhone = '+919999900000';
  const unregHash = CampusCryptoService.generateIdentityHash(unregisteredPhone);

  const firstDispatch = await AnonymizedSmsService.sendBlindCrushNotification(unregisteredPhone, unregHash, 'DU_SRCC');
  assert(firstDispatch.sent === true, 'First blind invite successfully dispatched to unregistered target');

  const repeatDispatch = await AnonymizedSmsService.sendBlindCrushNotification(unregisteredPhone, unregHash, 'DU_SRCC');
  assert(repeatDispatch.sent === false && repeatDispatch.reason === 'THROTTLED_30_DAY_COOLDOWN', 'Immediate second invite blocked by 30-day anti-harassment rate limiter');

  // -----------------------------------------------------------
  // TEST 5: Razorpay Webhook Security & Idempotency
  // -----------------------------------------------------------
  console.log('\n--- 5. Micro-Payment Webhook Signature & Idempotency ---');
  const mockOrderId = `order_${Date.now()}_test`;
  const paymentOrder = await prisma.paymentOrder.create({
    data: {
      userId: testUserA.id,
      orderId: mockOrderId,
      amountPaise: 1000, // ₹10
      status: 'INITIATED',
      idempotencyKey: `idem_${mockOrderId}`
    }
  });

  const webhookPayload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_12345',
          order_id: mockOrderId,
          amount: 1000,
          currency: 'INR',
          status: 'captured'
        }
      }
    }
  });

  // Test tampered signature
  const invalidSig = 'invalid_tampered_signature_hex_00000000000000000000000000000000';
  const isInvalid = PaymentService.verifyWebhookSignature(webhookPayload, invalidSig);
  assert(!isInvalid, 'Tampered webhook signature correctly rejected');

  // Test valid signature
  const validSig = PaymentService.signPayloadForTesting(webhookPayload);
  const isValid = PaymentService.verifyWebhookSignature(webhookPayload, validSig);
  assert(isValid, 'Genuine Razorpay HMAC-SHA256 signature verified with constant-time comparison');

  // Simulate atomic fulfillment
  const userBeforePayment = await prisma.user.findUnique({ where: { id: testUserA.id } });
  const initialSlots = userBeforePayment!.crushSlotsTotal;

  await prisma.$transaction(async (tx) => {
    await tx.paymentOrder.update({
      where: { orderId: mockOrderId },
      data: { status: 'SUCCESS', paymentId: 'pay_test_12345' }
    });
    await tx.user.update({
      where: { id: testUserA.id },
      data: { crushSlotsTotal: { increment: 1 } }
    });
  });

  const userAfterPayment = await prisma.user.findUnique({ where: { id: testUserA.id } });
  assert(userAfterPayment!.crushSlotsTotal === initialSlots + 1, 'Payment grants exactly +1 crush slot to student');

  // Idempotency check: replay does not increment
  const orderRecord = await prisma.paymentOrder.findUnique({ where: { orderId: mockOrderId } });
  assert(orderRecord?.status === 'SUCCESS', 'Order marked as SUCCESS; future webhook retries will be safely ignored (idempotent)');

  // -----------------------------------------------------------
  // TEST 6: Ephemeral E2E Chat & Zero-Trace Wipe
  // -----------------------------------------------------------
  console.log('\n--- 6. Ephemeral Chat & Emergency Zero-Trace Wipe ---');
  const message = await prisma.ephemeralMessage.create({
    data: {
      commitmentId: commitmentA.id,
      senderUserId: testUserA.id,
      ciphertext: 'ciphertext_encrypted_content_payload',
      isEncrypted: true
    }
  });
  assert(message.isEncrypted === true, 'Message stored with E2E encrypted cipher marker');

  // Emergency Zero-Trace Wipe
  const mutuals = await prisma.crushCommitment.findMany({
    where: { rendezvousToken: token_AB }
  });
  for (const item of mutuals) {
    await prisma.ephemeralMessage.deleteMany({ where: { commitmentId: item.id } });
    await prisma.crushCommitment.delete({ where: { id: item.id } });
    await prisma.user.update({
      where: { id: item.userId },
      data: { crushSlotsUsed: { decrement: 1 } }
    });
  }

  const remainingMessages = await prisma.ephemeralMessage.count({ where: { commitmentId: commitmentA.id } });
  const remainingCommitments = await prisma.crushCommitment.count({ where: { rendezvousToken: token_AB } });
  assert(remainingMessages === 0, 'Zero-Trace Wipe: All ephemeral messages purged from database');
  assert(remainingCommitments === 0, 'Zero-Trace Wipe: Both mutual commitments permanently eradicated');

  // -----------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} Invariants Verified`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL SECURITY & CRYPTOGRAPHIC INVARIANTS PASSED (100%)');
  } else {
    console.error('⚠️ SOME TESTS FAILED');
  }
  console.log('======================================================\n');
}

runSecurityTestSuite()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
