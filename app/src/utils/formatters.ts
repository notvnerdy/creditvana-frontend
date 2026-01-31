import type { ScoreRating } from '../types/index.ts';

/**
 * Classify a credit score into a human-readable rating.
 */
export function getScoreRating(score: number | null | undefined): ScoreRating {
  if (score == null || score < 300) return 'unknown';
  if (score >= 800) return 'excellent';
  if (score >= 740) return 'very-good';
  if (score >= 670) return 'good';
  if (score >= 580) return 'fair';
  return 'poor';
}

/**
 * Human-friendly label for a score rating.
 */
export function ratingLabel(rating: ScoreRating): string {
  const labels: Record<ScoreRating, string> = {
    excellent: 'Excellent',
    'very-good': 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    unknown: 'N/A',
  };
  return labels[rating];
}

/**
 * Tailwind color classes for each score rating.
 */
export function ratingColor(rating: ScoreRating): string {
  const colors: Record<ScoreRating, string> = {
    excellent: 'text-emerald-600',
    'very-good': 'text-green-600',
    good: 'text-yellow-600',
    fair: 'text-orange-500',
    poor: 'text-red-600',
    unknown: 'text-slate-400',
  };
  return colors[rating];
}

/**
 * Background color classes for score badges.
 */
export function ratingBgColor(rating: ScoreRating): string {
  const colors: Record<ScoreRating, string> = {
    excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'very-good': 'bg-green-50 text-green-700 border-green-200',
    good: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    fair: 'bg-orange-50 text-orange-700 border-orange-200',
    poor: 'bg-red-50 text-red-700 border-red-200',
    unknown: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return colors[rating];
}

/**
 * SVG stroke color for the score gauge ring.
 */
export function ratingStrokeColor(rating: ScoreRating): string {
  const colors: Record<ScoreRating, string> = {
    excellent: '#059669',
    'very-good': '#16a34a',
    good: '#ca8a04',
    fair: '#ea580c',
    poor: '#dc2626',
    unknown: '#94a3b8',
  };
  return colors[rating];
}

/**
 * Format a date string into a user-friendly format.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Format a currency value.
 */
export function formatCurrency(
  value: number | string | null | undefined,
): string {
  if (value == null || value === '') return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Safely display a value or a fallback.
 */
export function safeDisplay(
  value: string | number | null | undefined,
  fallback = 'N/A',
): string {
  if (value == null || value === '') return fallback;
  return String(value);
}

/**
 * Mask an SSN for display: ***-**-1234
 */
export function maskSSN(ssn: string | null | undefined): string {
  if (!ssn) return '***-**-****';
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) return '***-**-****';
  return `***-**-${digits.slice(-4)}`;
}

/**
 * Mask an account number for display.
 */
export function maskAccountNumber(
  account: string | null | undefined,
): string {
  if (!account) return '****';
  const clean = account.replace(/\s/g, '');
  if (clean.length <= 4) return clean;
  return `****${clean.slice(-4)}`;
}

/**
 * Parse utilization string (e.g. "15%") to a number, or return null.
 */
export function parseUtilization(
  value: string | number | null | undefined,
): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value.replace('%', ''));
  return isNaN(parsed) ? null : parsed;
}
