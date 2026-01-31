const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Send a client-side error to the backend logging endpoint.
 * Fires and forgets – never throws.
 */
export function logClientError(
  type: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  if (import.meta.env.DEV) {
    console.error(`[CreditVana ${type}]`, message, context);
  }

  try {
    const token = localStorage.getItem('cv_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/log-client-error`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type,
        message,
        context,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // Silently ignore logging failures
    });
  } catch {
    // Silently ignore
  }
}
