# CreditVana Frontend

Consumer credit monitoring dashboard built with React, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- npm 9+
- CreditVana backend running at `http://localhost:8000`

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The app starts on `http://localhost:3000`. API requests proxy to `localhost:8000` in development.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `VITE_APP_NAME` | Application display name | `CreditVana` |
| `VITE_APP_ENV` | Environment identifier | `development` |

## Project Structure

```
src/
  api/client.ts              Centralized API client (token, errors, all endpoints)
  components/
    auth/ProtectedRoute.tsx   Route guard with KBA gate
    common/                   Button, Input, Card, Alert, Modal, LoadingSpinner,
                              EmptyState, StatusBadge, ErrorBoundary
    credit/                   CreditScoreGauge, CreditFactorCard, TradelineItem,
                              InquiryItem, PublicRecordItem
    layout/                   AppLayout, AuthLayout, Header
  contexts/AuthContext.tsx     Auth state (token, KBA, upgrade status)
  hooks/useAuth.ts            Auth context consumer hook
  pages/                      Login, Register, OTPLogin, ForgotPassword,
                              KBAVerification, Dashboard, CreditReport,
                              Settings, NotFound
  types/index.ts              TypeScript interfaces for all API contracts
  utils/
    errorLogger.ts            Client-side error logging to backend
    formatters.ts             Score rating, currency, dates, masking
    validators.ts             Form validation (SSN, email, DOB, registration)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

## API Integration

All API calls go through `src/api/client.ts`. The client handles:

- Bearer token injection from localStorage
- Automatic 401 detection and session sign-out
- Network error wrapping with user-friendly messages
- Client-side error logging to `POST /log-client-error`

The frontend never calls IDIQ directly. All credit data flows through the CreditVana backend.

## User Flows

1. **Register** -> KBA Verification -> Dashboard
2. **Login** (password or OTP) -> Dashboard (or KBA if not yet verified)
3. **Dashboard** -> Credit Report, Settings
4. **Settings** -> Profile edit, password change, subscription, account deletion
