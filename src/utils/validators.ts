/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password meets minimum requirements.
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validate SSN format (XXX-XX-XXXX).
 */
export function isValidSSN(ssn: string): boolean {
  return /^\d{3}-\d{2}-\d{4}$/.test(ssn);
}

/**
 * Validate date of birth (YYYY-MM-DD) and ensure age is 18+.
 */
export function isValidDOB(dob: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const date = new Date(dob);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const isOldEnough =
    age > 18 || (age === 18 && monthDiff >= 0 && today.getDate() >= date.getDate());
  return isOldEnough;
}

/**
 * Validate US ZIP code.
 */
export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Validate US phone number.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Format SSN as user types: XXX-XX-XXXX
 */
export function formatSSNInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

/**
 * Format phone number as user types: (XXX) XXX-XXXX
 */
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6)
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Collect validation errors for the registration form.
 */
export interface RegistrationErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  dob?: string;
  ssn?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export function validateRegistration(data: { [K in keyof RegistrationErrors]-?: string }): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (!data.first_name?.trim()) errors.first_name = 'First name is required';
  if (!data.last_name?.trim()) errors.last_name = 'Last name is required';

  if (!data.email?.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(data.email)) errors.email = 'Please enter a valid email';

  if (!data.password) errors.password = 'Password is required';
  else if (!isValidPassword(data.password))
    errors.password = 'Password must be at least 8 characters';

  if (data.password !== data.password_confirmation)
    errors.password_confirmation = 'Passwords do not match';

  if (!data.dob) errors.dob = 'Date of birth is required';
  else if (!isValidDOB(data.dob)) errors.dob = 'You must be at least 18 years old';

  if (!data.ssn) errors.ssn = 'SSN is required';
  else if (!isValidSSN(data.ssn)) errors.ssn = 'Enter SSN as XXX-XX-XXXX';

  if (!data.phone) errors.phone = 'Phone number is required';
  else if (!isValidPhone(data.phone)) errors.phone = 'Please enter a valid phone number';

  if (!data.street?.trim()) errors.street = 'Street address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.state?.trim()) errors.state = 'State is required';

  if (!data.zip?.trim()) errors.zip = 'ZIP code is required';
  else if (!isValidZip(data.zip)) errors.zip = 'Please enter a valid ZIP code';

  return errors;
}
