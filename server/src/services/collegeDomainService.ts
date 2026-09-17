/**
 * College email domain whitelist (Method A — zero cost verification).
 *
 * An address passes when its domain is either:
 *   - listed as an active row in the CollegeDomain table, or
 *   - a subdomain of an approved Indian academic suffix (.ac.in, .edu.in, ...).
 */
import { prisma } from '../db.js';

const ACADEMIC_SUFFIXES = ['.ac.in', '.edu.in', '.res.in', '.edu'];
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export interface DomainCheck {
  valid: boolean;
  email: string;
  domain: string;
  collegeId: string | null;
  reason?: 'INVALID_EMAIL_FORMAT' | 'DOMAIN_NOT_WHITELISTED';
}

export class CollegeDomainService {
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static extractDomain(email: string): string {
    return this.normalizeEmail(email).split('@')[1] || '';
  }

  static isAcademicSuffix(domain: string): boolean {
    return ACADEMIC_SUFFIXES.some(suffix => domain.endsWith(suffix));
  }

  static async check(rawEmail: string): Promise<DomainCheck> {
    const email = this.normalizeEmail(rawEmail || '');
    const domain = this.extractDomain(email);

    if (!EMAIL_PATTERN.test(email)) {
      return { valid: false, email, domain, collegeId: null, reason: 'INVALID_EMAIL_FORMAT' };
    }

    const whitelisted = await prisma.collegeDomain.findFirst({
      where: { domain, active: true }
    });
    if (whitelisted) {
      return { valid: true, email, domain, collegeId: whitelisted.collegeId };
    }

    // Parent-domain match, e.g. "student.du.ac.in" inherits an approved "du.ac.in".
    const parents = domain
      .split('.')
      .map((_, index, parts) => parts.slice(index).join('.'))
      .filter(candidate => candidate.includes('.'));
    const parentMatch = await prisma.collegeDomain.findFirst({
      where: { domain: { in: parents }, active: true }
    });
    if (parentMatch) {
      return { valid: true, email, domain, collegeId: parentMatch.collegeId };
    }

    if (this.isAcademicSuffix(domain)) {
      return { valid: true, email, domain, collegeId: null };
    }

    return { valid: false, email, domain, collegeId: null, reason: 'DOMAIN_NOT_WHITELISTED' };
  }

  static listApprovedSuffixes(): string[] {
    return [...ACADEMIC_SUFFIXES];
  }
}
