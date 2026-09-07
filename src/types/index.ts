// ──────────────────────────────────────────────
// Authentication
// ──────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  dob: string;
  ssn: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface AuthResponse {
  access_token: string;
  kba_passed: number;
  is_upgraded?: number;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

// ──────────────────────────────────────────────
// User Profile
// ──────────────────────────────────────────────

export interface UserProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  ssn?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  kba_passed?: number;
  is_upgraded?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// ──────────────────────────────────────────────
// KBA Verification
// ──────────────────────────────────────────────

export interface KBAQuestion {
  questionId: string;
  text: string;
  choices: string[];
}

export interface KBAAnswer {
  questionId: string;
  answer: string;
}

export interface KBASubmitRequest {
  answers: KBAAnswer[];
}

export type KBAStatus =
  | 'Correct'
  | 'Incorrect'
  | 'MoreQuestions'
  | 'accountCodeMissing';

export interface KBAResponse {
  status: KBAStatus;
  kba_passed?: boolean;
  message?: string;
}

// ──────────────────────────────────────────────
// Credit Data
// ──────────────────────────────────────────────

export interface QuickView {
  bureau?: string;
  inquiries?: number;
  public_records?: number;
  utilization?: string;
}

export interface CreditScoreResponse {
  credit_score?: number | null;
  date?: string | null;
  quick_view?: QuickView | null;
}

export interface Tradeline {
  creditor_name?: string;
  account_number?: string;
  account_type?: string;
  balance?: number | string | null;
  credit_limit?: number | string | null;
  monthly_payment?: number | string | null;
  date_opened?: string;
  date_reported?: string;
  payment_status?: string;
  status?: string;
  bureau?: string;
  high_balance?: number | string | null;
  past_due?: number | string | null;
  remarks?: string;
}

export interface Inquiry {
  creditor_name?: string;
  date?: string;
  bureau?: string;
  type?: string;
}

export interface PublicRecord {
  court_name?: string;
  type?: string;
  status?: string;
  date_filed?: string;
  date_resolved?: string;
  amount?: number | string | null;
  bureau?: string;
}

export interface CreditAlert {
  type?: string;
  message?: string;
  date?: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface CreditReportResponse {
  tradelines?: Tradeline[];
  inquiries?: Inquiry[];
  public_records?: PublicRecord[];
  alerts?: CreditAlert[];
  personal_info?: Record<string, unknown>;
  summary?: Record<string, unknown>;
  [key: string]: unknown;
}

// ──────────────────────────────────────────────
// Subscription
// ──────────────────────────────────────────────

export interface SubscriptionResponse {
  status?: string;
  plan?: string;
  message?: string;
}

// ──────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────

export interface USState {
  code: string;
  name: string;
}

export interface City {
  name: string;
  state?: string;
}

// ──────────────────────────────────────────────
// API Error
// ──────────────────────────────────────────────

export interface APIError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ──────────────────────────────────────────────
// Score Rating Helpers
// ──────────────────────────────────────────────

export type ScoreRating = 'excellent' | 'very-good' | 'good' | 'fair' | 'poor' | 'unknown';
