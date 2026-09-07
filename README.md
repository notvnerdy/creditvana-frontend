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
| `VITE_BASE_PATH` | Public base path for the build | `/` |

## Project Structure

```
src/
  api/client.ts              Centralized API client (token, errors, all endpoints)
  components/
    auth/ProtectedRoute.tsx   Route guard with KBA gate
    common/                   Button, Input, Select, Card, Alert, Modal,
                              LoadingSpinner, EmptyState, StatusBadge,
                              ErrorBoundary
    credit/                   CreditScoreGauge, CreditFactorCard, TradelineItem,
                              InquiryItem, PublicRecordItem
    layout/                   AppLayout, AuthLayout, Header
  contexts/
    auth-context.ts           Auth context object and value type
    AuthContext.tsx           AuthProvider (token, KBA, upgrade status)
  hooks/
    useAuth.ts                Auth context consumer hook
    useStates.ts              US states from GET /states (bundled fallback)
    useCitySuggestions.ts     Debounced city type-ahead from GET /cities
  pages/                      Login, Register, OTPLogin, ForgotPassword,
                              KBAVerification, Dashboard, CreditReport,
                              Settings, NotFound
  types/index.ts              TypeScript interfaces for all API contracts
  utils/
    errorLogger.ts            Client-side error logging to backend
    formatters.ts             Score rating, currency, dates, masking
    usStates.ts               Bundled US state list and code validation
    validators.ts             Form validation (SSN, email, DOB, registration)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run lint` | Run ESLint across the project |
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

## Deployment

The app is published to GitHub Pages by `.github/workflows/deploy.yml` on every
push to `frontend`. `.github/workflows/ci.yml` runs lint and build on pull
requests.

Two repository settings must be in place for a deploy to succeed:

1. **Settings -> Pages -> Source** must be **GitHub Actions**. With the default
   "Deploy from a branch" source, Pages serves the unbuilt sources and the site
   renders a blank page.
2. **Settings -> Variables -> Actions** should define `VITE_API_BASE_URL` (and
   optionally `VITE_APP_NAME`) for the deployed environment. Without it the
   build falls back to `http://localhost:8000/api/v1`, which no browser outside
   a developer machine can reach.

The site is served from the custom domain in `CNAME` (`secure.creditvana.com`),
so the Vite `base` is `/`. `public/CNAME` is copied into `dist/` so the domain
survives each deploy. To publish to a GitHub project page
(`<user>.github.io/creditvana-frontend/`) instead, build with
`VITE_BASE_PATH=/creditvana-frontend/`.

GitHub Pages has no SPA rewrite, so `vite.config.ts` emits a `404.html` that
bounces deep links back to `index.html` with the path preserved. The number of
path segments it keeps is derived from `base`, so the two cannot drift apart.
