import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  OTPRequest,
  OTPVerifyRequest,
  ForgotPasswordRequest,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  KBAQuestion,
  KBASubmitRequest,
  KBAResponse,
  CreditScoreResponse,
  CreditReportResponse,
  SubscriptionResponse,
  APIError,
} from '../types/index.ts';
import { logClientError } from '../utils/errorLogger.ts';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'cv_access_token';

// ──────────────────────────────────────────────
// Token helpers
// ──────────────────────────────────────────────

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable – silently ignore
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // noop
  }
}

export function hasToken(): boolean {
  return !!getToken();
}

// ──────────────────────────────────────────────
// Core request helper
// ──────────────────────────────────────────────

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    const message =
      networkError instanceof Error
        ? networkError.message
        : 'Network request failed';
    logClientError('network_error', message, { endpoint });
    throw {
      message:
        'Unable to connect to the server. Please check your internet connection and try again.',
      status: 0,
    } as APIError;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (response.ok) return undefined as unknown as T;
    throw {
      message: 'An unexpected error occurred. Please try again.',
      status: response.status,
    } as APIError;
  }

  if (!response.ok) {
    const errorData = data as Record<string, unknown>;

    // 401 – session expired
    if (response.status === 401) {
      clearToken();
      onUnauthorized?.();
    }

    const apiError: APIError = {
      message:
        (errorData?.message as string) ||
        (errorData?.error as string) ||
        'Something went wrong. Please try again.',
      errors: errorData?.errors as Record<string, string[]> | undefined,
      status: response.status,
    };

    logClientError('api_error', apiError.message, {
      endpoint,
      status: response.status,
      errors: apiError.errors,
    });

    throw apiError;
  }

  return data as T;
}

// ──────────────────────────────────────────────
// Auth endpoints
// ──────────────────────────────────────────────

export async function login(body: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function requestOTP(body: OTPRequest): Promise<{ message?: string }> {
  return request('/login-via-email', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function verifyOTP(body: OTPVerifyRequest): Promise<AuthResponse> {
  return request<AuthResponse>('/verify-login-via-email-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function forgotPassword(
  body: ForgotPasswordRequest,
): Promise<{ message?: string }> {
  return request('/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function logout(): Promise<void> {
  return request('/logout', { method: 'POST' });
}

// ──────────────────────────────────────────────
// User Profile endpoints
// ──────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  return request<UserProfile>('/settings');
}

export async function updateProfile(
  body: UpdateProfileRequest,
): Promise<UserProfile> {
  return request<UserProfile>('/settings', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function changePassword(
  body: ChangePasswordRequest,
): Promise<{ message?: string }> {
  return request('/password/change', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function deleteAccount(): Promise<void> {
  return request('/account/delete', { method: 'DELETE' });
}

// ──────────────────────────────────────────────
// KBA Verification endpoints
// ──────────────────────────────────────────────

export async function getVerificationQuestions(): Promise<KBAQuestion[]> {
  return request<KBAQuestion[]>('/idiq/verification-questions');
}

export async function submitVerificationAnswers(
  body: KBASubmitRequest,
): Promise<KBAResponse> {
  return request<KBAResponse>('/idiq/verification-answers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ──────────────────────────────────────────────
// Credit Data endpoints
// ──────────────────────────────────────────────

export async function getCreditScore(): Promise<CreditScoreResponse> {
  return request<CreditScoreResponse>('/credit-score');
}

export async function orderCreditScore(): Promise<CreditScoreResponse> {
  return request<CreditScoreResponse>('/idiq/credit-score/order', {
    method: 'POST',
  });
}

export async function getCreditReport(): Promise<CreditReportResponse> {
  return request<CreditReportResponse>('/idiq/credit-report');
}

// ──────────────────────────────────────────────
// Subscription endpoints
// ──────────────────────────────────────────────

export async function upgradePlan(): Promise<SubscriptionResponse> {
  return request<SubscriptionResponse>('/upgrade', { method: 'POST' });
}

export async function downgradePlan(): Promise<SubscriptionResponse> {
  return request<SubscriptionResponse>('/downgrade', { method: 'POST' });
}

// ──────────────────────────────────────────────
// Utility endpoints
// ──────────────────────────────────────────────

export async function getStates(): Promise<unknown[]> {
  return request<unknown[]>('/states');
}

export async function getCities(query: string): Promise<unknown[]> {
  return request<unknown[]>(`/cities?q=${encodeURIComponent(query)}`);
}
