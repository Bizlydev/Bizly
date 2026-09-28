export type ValidationResult = { valid: true } | { valid: false; message: string };

export function validateEmail(value: string): ValidationResult {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? { valid: true }
    : { valid: false, message: 'Enter a valid email address.' };
}

export function validatePassword(value: string): ValidationResult {
  return value.length >= 8
    ? { valid: true }
    : { valid: false, message: 'Password must contain at least 8 characters.' };
}

export function validateRequired(value: string, label: string): ValidationResult {
  return value.trim()
    ? { valid: true }
    : { valid: false, message: label + ' is required.' };
}
