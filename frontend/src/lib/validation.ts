/**
 * Real-Time Field Validation System for Bamas Collection
 * Standardized across all forms, checkout, user portals, and admin dashboards.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;
export const UPI_REGEX = /^[\w.-]+@[\w.-]+$/;

export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validateName(name: string, fieldLabel = 'Full Name'): ValidationResult {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, error: `${fieldLabel} is required.` };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldLabel} must be at least 2 characters.` };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { valid: false, error: `${fieldLabel} can only contain letters and spaces.` };
  }
  return { valid: true, error: '' };
}

export function validateEmail(email: string, required = true): ValidationResult {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return required ? { valid: false, error: 'Email address is required.' } : { valid: true, error: '' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }
  return { valid: true, error: '' };
}

export function validatePhone(phone: string, required = true): ValidationResult {
  const clean = (phone || '').replace(/[\s\-+]/g, '').slice(-10);
  if (!clean) {
    return required ? { valid: false, error: 'Mobile number is required.' } : { valid: true, error: '' };
  }
  if (!PHONE_REGEX.test(clean)) {
    return { valid: false, error: 'Enter a valid 10-digit Indian mobile number (starts with 6-9).' };
  }
  return { valid: true, error: '' };
}

export function validateIdentifier(identifier: string): { valid: boolean; isEmail: boolean; error: string } {
  const trimmed = (identifier || '').trim();
  if (!trimmed) {
    return { valid: false, isEmail: false, error: 'Email or mobile number is required.' };
  }
  if (trimmed.includes('@')) {
    const res = validateEmail(trimmed, true);
    return { valid: res.valid, isEmail: true, error: res.error };
  }
  const cleanPhone = trimmed.replace(/[\s\-+]/g, '').slice(-10);
  const res = validatePhone(cleanPhone, true);
  return { valid: res.valid, isEmail: false, error: res.valid ? '' : 'Enter a valid email or 10-digit mobile number.' };
}

export function validatePassword(password: string): { valid: boolean; error: string; strength: 'weak' | 'fair' | 'strong' } {
  const val = password || '';
  if (!val) {
    return { valid: false, error: 'Password is required.', strength: 'weak' };
  }
  if (val.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters.', strength: 'weak' };
  }
  const hasNumbers = /\d/.test(val);
  const hasSpecial = /[^A-Za-z0-9]/.test(val);
  if (val.length >= 8 && hasNumbers && hasSpecial) {
    return { valid: true, error: '', strength: 'strong' };
  }
  if (val.length >= 6) {
    return { valid: true, error: '', strength: 'fair' };
  }
  return { valid: true, error: '', strength: 'weak' };
}

export function validateConfirmPassword(password: string, confirm: string): ValidationResult {
  if (!confirm) {
    return { valid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirm) {
    return { valid: false, error: 'Passwords do not match.' };
  }
  return { valid: true, error: '' };
}

export function validatePincode(pincode: string): ValidationResult {
  const clean = (pincode || '').replace(/\D/g, '');
  if (!clean) {
    return { valid: false, error: 'PIN Code is required.' };
  }
  if (!PINCODE_REGEX.test(clean)) {
    return { valid: false, error: 'PIN Code must be exactly 6 digits.' };
  }
  return { valid: true, error: '' };
}

export function validateAddress(address: string, label = 'Street address'): ValidationResult {
  const trimmed = (address || '').trim();
  if (!trimmed) {
    return { valid: false, error: `${label} is required.` };
  }
  if (trimmed.length < 6) {
    return { valid: false, error: `${label} must be at least 6 characters (House/Flat No., Street).` };
  }
  return { valid: true, error: '' };
}

export function validateCity(city: string): ValidationResult {
  const trimmed = (city || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'City is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, error: 'Please enter a valid city name.' };
  }
  return { valid: true, error: '' };
}

export function validateState(state: string): ValidationResult {
  const trimmed = (state || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'State is required.' };
  }
  return { valid: true, error: '' };
}

export function validatePrice(price: any): ValidationResult {
  const num = Number(price);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Please enter a valid price greater than ₹0.' };
  }
  return { valid: true, error: '' };
}

export function validateRequired(val: string, fieldLabel: string, minLength = 2): ValidationResult {
  const trimmed = (val || '').trim();
  if (!trimmed) {
    return { valid: false, error: `${fieldLabel} is required.` };
  }
  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldLabel} must be at least ${minLength} characters.` };
  }
  return { valid: true, error: '' };
}

export function validateUpi(upi: string): ValidationResult {
  const trimmed = (upi || '').trim();
  if (!trimmed) {
    return { valid: false, error: 'UPI ID is required.' };
  }
  if (!UPI_REGEX.test(trimmed)) {
    return { valid: false, error: 'Enter a valid UPI ID (e.g. mobile@upi or username@bank).' };
  }
  return { valid: true, error: '' };
}
