/**
 * End-to-end checks for the student verification system.
 * Run with: npm run test:verification
 */
import type { AddressInfo } from 'net';
import { app } from '../index.js';
import { prisma } from '../db.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';
import { CampusCryptoService } from '../services/cryptoService.js';
import { CollegeDomainService } from '../services/collegeDomainService.js';
import { EmailService } from '../services/emailService.js';
import { VerificationService } from '../services/verificationService.js';

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

const sentMails: Array<{ to: string; subject: string; text: string }> = [];
const realSend = EmailService.send.bind(EmailService);
EmailService.send = async payload => {
  sentMails.push({ to: payload.to, subject: payload.subject, text: payload.text });
  return { delivered: true, provider: 'TEST' };
};

async function createStudent(phone: string, collegeId: string, isAdmin = false) {
  const identityHash = CampusCryptoService.generateIdentityHash(phone);
  const user = await prisma.user.upsert({
    where: { identityHash },
    update: { isAdmin, verificationStatus: 'PENDING_VERIFICATION', verificationMethod: null },
    create: {
      identityHash,
      collegeId,
      maskedPhone: CampusCryptoService.createMaskedHint(phone, 'phone'),
      isAdmin
    }
  });
  const token = AuthMiddleware.generateToken({
    id: user.id,
    identityHash: user.identityHash,
    collegeId: user.collegeId
  });
  return { user, token };
}

async function main() {
  console.log('\n===============================================');
  console.log('🎓 STUDENT VERIFICATION TEST SUITE');
  console.log('===============================================\n');

  const college = await prisma.college.findFirst();
  if (!college) throw new Error('Seed the database first: npm run seed');

  // ---------------------------------------------------------
  console.log('--- 1. College Email Domain Whitelist ---');
  const whitelisted = await CollegeDomainService.check('rohan@iitd.ac.in');
  assert(whitelisted.valid && whitelisted.collegeId !== null, 'Whitelisted table domain resolves to a college');

  const subdomain = await CollegeDomainService.check('Neha.Sharma@student.du.ac.in');
  assert(subdomain.valid && subdomain.email === 'neha.sharma@student.du.ac.in', 'Subdomain accepted and email normalized');

  const suffixOnly = await CollegeDomainService.check('arjun@cse.unknowncollege.ac.in');
  assert(suffixOnly.valid && suffixOnly.collegeId === null, 'Unknown .ac.in domain passes on academic suffix');

  const consumer = await CollegeDomainService.check('someone@gmail.com');
  assert(!consumer.valid && consumer.reason === 'DOMAIN_NOT_WHITELISTED', 'Consumer domain rejected');

  const malformed = await CollegeDomainService.check('not-an-email');
  assert(!malformed.valid && malformed.reason === 'INVALID_EMAIL_FORMAT', 'Malformed address rejected');

  // ---------------------------------------------------------
  console.log('\n--- 2. Method A: Email OTP ---');
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;

  const student = await createStudent('+919811100011', college.id);
  const eduEmail = 'student.a@iitd.ac.in';

  const otpRequest = await fetch(`${baseUrl}/verification/email/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student.token}` },
    body: JSON.stringify({ email: eduEmail })
  });
  const otpBody = await otpRequest.json();
  assert(otpRequest.status === 200 && otpBody.success, 'OTP request accepted for college email');

  const otpMail = sentMails.at(-1);
  const code = otpMail?.text.match(/\b(\d{6})\b/)?.[1] ?? '';
  assert(otpMail?.to === eduEmail && code.length === 6, 'Six-digit OTP emailed to the college address');

  const stored = await prisma.emailOtp.findFirst({
    where: { userId: student.user.id, consumedAt: null },
    orderBy: { createdAt: 'desc' }
  });
  assert(!!stored && stored.codeHash !== code, 'OTP persisted only as an HMAC hash');
  const ttlMs = stored ? stored.expiresAt.getTime() - stored.createdAt.getTime() : 0;
  assert(
    Math.abs(ttlMs - 10 * 60 * 1000) < 5000,
    'OTP expires 10 minutes after issue',
    `TTL was ${ttlMs}ms`
  );

  const wrongCode = await fetch(`${baseUrl}/verification/email/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student.token}` },
    body: JSON.stringify({ email: eduEmail, otp: code === '000000' ? '111111' : '000000' })
  });
  assert((await wrongCode.json()).error === 'INVALID_OTP' && wrongCode.status === 400, 'Wrong OTP rejected');

  const verify = await fetch(`${baseUrl}/verification/email/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student.token}` },
    body: JSON.stringify({ email: eduEmail, otp: code })
  });
  const verifyBody = await verify.json();
  assert(
    verify.status === 200 && verifyBody.verificationStatus === 'VERIFIED' && verifyBody.verificationMethod === 'EMAIL_DOMAIN',
    'Correct OTP auto-grants VERIFIED status'
  );

  const replay = await fetch(`${baseUrl}/verification/email/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${student.token}` },
    body: JSON.stringify({ email: eduEmail, otp: code })
  });
  assert((await replay.json()).error === 'OTP_NOT_FOUND', 'Consumed OTP cannot be replayed');

  const expiredStudent = await createStudent('+919811100012', college.id);
  await VerificationService.issueEmailOtp(expiredStudent.user.id, 'expired@dtu.ac.in', 'dtu.ac.in');
  await prisma.emailOtp.updateMany({
    where: { userId: expiredStudent.user.id, consumedAt: null },
    data: { expiresAt: new Date(Date.now() - 1000) }
  });
  const expiredResult = await VerificationService.redeemEmailOtp(
    expiredStudent.user.id,
    'expired@dtu.ac.in',
    '123456'
  );
  assert(!expiredResult.ok && expiredResult.error === 'OTP_EXPIRED', 'Expired OTP is rejected');

  const rejectedDomain = await fetch(`${baseUrl}/verification/email/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${expiredStudent.token}` },
    body: JSON.stringify({ email: 'me@gmail.com' })
  });
  assert(rejectedDomain.status === 400, 'Non-college domain cannot request an OTP');

  // ---------------------------------------------------------
  console.log('\n--- 3. Method B: Manual ID Review ---');
  const manualStudent = await createStudent('+919811100013', college.id);
  await prisma.verificationRequest.deleteMany({ where: { userId: manualStudent.user.id } });

  const form = new FormData();
  form.append('idCard', new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xdb])], { type: 'image/jpeg' }), 'id.jpg');
  form.append('contactEmail', 'manual.student@gmail.com');

  const upload = await fetch(`${baseUrl}/verification/id-card`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${manualStudent.token}` },
    body: form
  });
  const uploadBody = await upload.json();
  assert(upload.status === 202 && uploadBody.status === 'PENDING_REVIEW', 'ID upload queues a PENDING_REVIEW request');

  const afterUpload = await prisma.user.findUnique({ where: { id: manualStudent.user.id } });
  assert(afterUpload?.verificationStatus === 'PENDING_REVIEW', 'User moves to PENDING_REVIEW');

  const duplicate = await fetch(`${baseUrl}/verification/id-card`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${manualStudent.token}` },
    body: (() => {
      const secondForm = new FormData();
      secondForm.append('idCard', new Blob([new Uint8Array([0xff, 0xd8])], { type: 'image/jpeg' }), 'id.jpg');
      return secondForm;
    })()
  });
  assert(duplicate.status === 409, 'Second upload blocked while a review is pending');

  const badType = new FormData();
  badType.append('idCard', new Blob([new Uint8Array([0x25, 0x50])], { type: 'application/pdf' }), 'id.pdf');
  const rejectedType = await fetch(`${baseUrl}/verification/id-card`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${(await createStudent('+919811100014', college.id)).token}` },
    body: badType
  });
  assert(rejectedType.status === 415, 'Non-image uploads are rejected');

  // ---------------------------------------------------------
  console.log('\n--- 4. Admin Review Dashboard ---');
  const admin = await createStudent('+919811100099', college.id, true);
  const nonAdmin = await createStudent('+919811100015', college.id);

  const forbidden = await fetch(`${baseUrl}/admin/verifications/pending`, {
    headers: { Authorization: `Bearer ${nonAdmin.token}` }
  });
  assert(forbidden.status === 403, 'Non-admin cannot read the review queue');

  const pending = await fetch(`${baseUrl}/admin/verifications/pending`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const pendingBody = await pending.json();
  const queued = pendingBody.pending.find((item: any) => item.user.id === manualStudent.user.id);
  assert(pending.status === 200 && !!queued, 'Pending queue lists the submission');
  assert(typeof queued?.imageUrl === 'string' && queued.imageUrl.length > 0, 'Queue entries expose a signed image URL');

  sentMails.length = 0;
  const approve = await fetch(`${baseUrl}/admin/verifications/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.token}` },
    body: JSON.stringify({ userId: manualStudent.user.id, status: 'APPROVED' })
  });
  const approveBody = await approve.json();
  assert(
    approve.status === 200 && approveBody.verificationStatus === 'VERIFIED' && approveBody.requestStatus === 'APPROVED',
    'Approval promotes the student to VERIFIED'
  );
  assert(sentMails.at(-1)?.to === 'manual.student@gmail.com', 'Approval notification emailed to the student');

  const missingReason = await fetch(`${baseUrl}/admin/verifications/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.token}` },
    body: JSON.stringify({ userId: manualStudent.user.id, status: 'REJECTED' })
  });
  assert((await missingReason.json()).error === 'MISSING_REASON', 'Rejection requires a reason');

  const noPending = await fetch(`${baseUrl}/admin/verifications/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.token}` },
    body: JSON.stringify({ userId: manualStudent.user.id, status: 'REJECTED', reason: 'Blurry photo' })
  });
  assert(noPending.status === 404, 'Already-reviewed requests cannot be actioned twice');

  server.close();
  EmailService.send = realSend;

  console.log('\n===============================================');
  console.log(`RESULT: ${passedTests}/${totalTests} checks passed`);
  console.log('===============================================\n');

  if (passedTests !== totalTests) process.exitCode = 1;
}

main()
  .catch(err => {
    console.error('Verification test suite error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
