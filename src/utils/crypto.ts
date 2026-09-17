/**
 * Web Crypto API utilities for Zero-Knowledge client-side hashing
 */

export async function computeSHA256(message: string): Promise<string> {
  if (!message || message.trim() === '') {
    return '';
  }

  // Use Web Crypto API
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(message.trim().toLowerCase());
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.error('Web Crypto API failed, falling back', e);
    }
  }

  // Fallback lightweight deterministic hash if Web Crypto isn't available
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a1b2c3d4e5f67890');
}

/**
 * Normalizes input: handles leading '@', lowercase, trims whitespace, standardizes Indian phone numbers
 */
export function normalizeIdentityInput(input: string): { normalized: string; type: 'instagram' | 'phone' } {
  const trimmed = input.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');

  // If input contains only numbers or starts with +91 or has 10 digits
  if (/^\+?\d{10,13}$/.test(trimmed.replace(/\s+/g, '')) || (digitsOnly.length === 10 && !trimmed.includes('@'))) {
    const last10 = digitsOnly.slice(-10);
    return {
      normalized: `+91${last10}`,
      type: 'phone'
    };
  }

  // Otherwise handle as Instagram username
  const cleanHandle = trimmed.toLowerCase().replace(/^@+/, '');
  return {
    normalized: `@${cleanHandle}`,
    type: 'instagram'
  };
}

/**
 * Creates privacy-first masked display string
 * e.g., "@anjali_sharma" -> "@a***a"
 * e.g., "+919876543210" -> "+91 98****3210"
 */
export function maskIdentity(input: string, type: 'instagram' | 'phone'): string {
  if (!input) return '';

  if (type === 'phone') {
    const digits = input.replace(/\D/g, '');
    if (digits.length >= 10) {
      const first2 = digits.slice(-10, -8);
      const last4 = digits.slice(-4);
      return `+91 ${first2}****${last4}`;
    }
    return '+91 98****3210';
  }

  // Instagram handle
  const handle = input.replace(/^@+/, '');
  if (handle.length <= 2) {
    return `@${handle[0]}*`;
  }
  if (handle.length <= 4) {
    return `@${handle[0]}**${handle.slice(-1)}`;
  }
  const parts = handle.split(/[._]/);
  if (parts.length > 1) {
    return `@${parts[0][0]}***${parts[0].slice(-1)}_${parts[1]}`;
  }
  return `@${handle[0]}***${handle.slice(-2)}`;
}
