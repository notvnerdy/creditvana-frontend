# CreditVana Backend API - Postman Collection Guide

## 📦 What You Got

A complete Postman collection for **CreditVana Backend API v3** with:
- ✅ **20 endpoints** organized in 6 categories
- ✅ Auto-save authentication tokens
- ✅ Sample request bodies
- ✅ Frontend integration ready
- ✅ Test scripts included

---

## 🎯 Collection Structure

### 1. Authentication (6 endpoints)
- `POST /login` - Login with email/password
- `POST /register` - Register new user + IDIQ enrollment
- `POST /login-via-email` - Request OTP
- `POST /verify-login-via-email-otp` - Verify OTP
- `POST /forgot-password` - Password reset
- `POST /logout` - Logout

### 2. User Profile (4 endpoints)
- `GET /settings` - Get user profile
- `PUT /settings` - Update profile
- `POST /password/change` - Change password
- `DELETE /account/delete` - Delete account

### 3. Identity Verification / KBA (2 endpoints)
- `GET /idiq/verification-questions` - Get KBA questions
- `POST /idiq/verification-answers` - Submit answers

### 4. Credit Data & Dashboard (3 endpoints)
- `GET /credit-score` - Get score + quick view
- `POST /idiq/credit-score/order` - Order new score
- `GET /idiq/credit-report` - Get full credit report

### 5. Subscription & Billing (2 endpoints)
- `POST /upgrade` - Upgrade to premium
- `POST /downgrade` - Downgrade/cancel

### 6. Utilities & Geo (3 endpoints)
- `GET /states` - Get US states list
- `GET /cities?q=search` - Search cities
- `POST /log-client-error` - Log frontend errors

---

## 🚀 Quick Start (3 Steps)

### Step 1: Import Collection
1. Open Postman
2. Click **Import**
3. Drag `CreditVana_Backend_API_Postman_Collection.json`
4. Click **Import**

### Step 2: Set Base URL
**Default:** `http://localhost:8000/api/v1`

**To change:**
1. Click collection name
2. Go to **Variables** tab
3. Update `baseUrl` value
4. Click **Save**

**Common URLs:**
```
Local:   http://localhost:8000/api/v1
Staging: https://staging.creditvana.com/api/v1
Prod:    https://creditvana.com/api/v1
```

### Step 3: Test Authentication
1. Go to `1. Authentication` folder
2. Click `Login`
3. Update email/password in body
4. Click **Send**
5. ✅ Token auto-saved!

---

## 🔐 Authentication Flow

### For Frontend Integration:

**1. User Registration**
```javascript
// POST /register
const response = await fetch('http://localhost:8000/api/v1/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    password: "password123",
    password_confirmation: "password123",
    dob: "1990-05-20",
    ssn: "666-12-1234",
    phone: "555-555-5555",
    street: "123 Beverly Dr",
    city: "Beverly Hills",
    state: "CA",
    zip: "90210"
  })
});

const data = await response.json();

// Save token
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('kba_passed', data.kba_passed);

// Redirect based on KBA status
if (data.kba_passed === 0) {
  // Redirect to KBA verification
  router.push('/verify');
} else {
  // Redirect to dashboard
  router.push('/dashboard');
}
```

**2. User Login**
```javascript
// POST /login
const response = await fetch('http://localhost:8000/api/v1/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: "john@example.com",
    password: "password123"
  })
});

const data = await response.json();

// Save token
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('kba_passed', data.kba_passed);

// Check verification status
if (data.kba_passed === 0) {
  router.push('/verify');
} else {
  router.push('/dashboard');
}
```

**3. Authenticated Requests**
```javascript
// All subsequent requests
const response = await fetch('http://localhost:8000/api/v1/credit-score', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

## 📱 Frontend Integration Guide

### React Example:

**Create API Client (`src/services/api.js`):**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      }
    };

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.request('/logout', { method: 'POST' });
  }

  // User Profile
  async getProfile() {
    return this.request('/settings');
  }

  async updateProfile(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // KBA Verification
  async getVerificationQuestions() {
    return this.request('/idiq/verification-questions');
  }

  async submitVerificationAnswers(answers) {
    return this.request('/idiq/verification-answers', {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  // Credit Data
  async getCreditScore() {
    return this.request('/credit-score');
  }

  async orderCreditScore() {
    return this.request('/idiq/credit-score/order', { method: 'POST' });
  }

  async getCreditReport() {
    return this.request('/idiq/credit-report');
  }

  // Billing
  async upgrade() {
    return this.request('/upgrade', { method: 'POST' });
  }

  async downgrade() {
    return this.request('/downgrade', { method: 'POST' });
  }

  // Utilities
  async getStates() {
    return this.request('/states');
  }

  async getCities(query) {
    return this.request(`/cities?q=${query}`);
  }
}

export default new ApiClient();
```

**Usage in Components:**
```javascript
import api from './services/api';

// Login
const handleLogin = async (email, password) => {
  try {
    const data = await api.login(email, password);
    localStorage.setItem('access_token', data.access_token);
    
    if (data.kba_passed === 0) {
      navigate('/verify');
    } else {
      navigate('/dashboard');
    }
  } catch (error) {
    setError('Login failed');
  }
};

// Get Credit Score
const loadDashboard = async () => {
  try {
    const data = await api.getCreditScore();
    setCreditScore(data.credit_score);
    setQuickView(data.quick_view);
  } catch (error) {
    console.error('Failed to load dashboard');
  }
};
```

---

## 🎯 Key Endpoints for Frontend

### Dashboard Page:
```javascript
// Load dashboard data
GET /credit-score
→ Returns: credit_score, date, quick_view (bureau, inquiries, utilization)
```

### KBA Verification Flow:
```javascript
// Step 1: Get questions
GET /idiq/verification-questions
→ Returns: Array of questions with choices

// Step 2: Submit answers
POST /idiq/verification-answers
Body: { answers: [{ questionId, answer }] }
→ Returns: { status: "Correct|Incorrect|MoreQuestions", kba_passed: true }

// Handle responses:
- "Correct" → Redirect to dashboard
- "Incorrect" → Show error, allow retry
- "MoreQuestions" → Fetch questions again immediately
- "accountCodeMissing" → Show "thin file" error
```

### Profile/Settings Page:
```javascript
// Get profile
GET /settings
→ Returns: User object with all fields

// Update profile
PUT /settings
Body: { first_name: "NewName", phone: "999-999-9999" }
→ Returns: Updated user object
```

### Credit Report Page:
```javascript
// Get full report
GET /idiq/credit-report
→ Returns: Comprehensive JSON with tradelines, inquiries, etc.
```

---

## 🔄 Testing Flow in Postman

### Complete User Journey:

**1. Register New User**
```
Folder: 1. Authentication
Request: Register
Update: email, password in body
Click: Send
✅ Token auto-saved
```

**2. Get Verification Questions**
```
Folder: 3. Identity Verification
Request: Fetch Verification Questions
Click: Send
✅ Copy question IDs
```

**3. Submit Answers**
```
Request: Submit Verification Answers
Update: answers array with question IDs
Click: Send
✅ Check status (Correct/Incorrect/MoreQuestions)
```

**4. Get Dashboard Data**
```
Folder: 4. Credit Data & Dashboard
Request: Get Credit Score (Dashboard)
Click: Send
✅ See credit score + quick view
```

**5. Get Full Report**
```
Request: Get Full Credit Report
Click: Send
✅ See detailed credit data
```

**6. Update Profile**
```
Folder: 2. User Profile
Request: Update User Profile
Update: first_name, phone, etc.
Click: Send
✅ Profile updated
```

**7. Logout**
```
Folder: 1. Authentication
Request: Logout
Click: Send
✅ Token cleared
```

---

## 🧪 Test Scenarios

### Scenario 1: New User Registration
```
1. POST /register → Returns access_token, kba_passed = 0
2. GET /idiq/verification-questions → Get KBA questions
3. POST /idiq/verification-answers → Submit correct answers
4. GET /credit-score → Access dashboard data
```

### Scenario 2: Returning User Login
```
1. POST /login → Returns access_token, kba_passed = 1
2. GET /credit-score → Immediate dashboard access
```

### Scenario 3: OTP Login
```
1. POST /login-via-email → Request OTP
2. Check email for code
3. POST /verify-login-via-email-otp → Login with code
4. GET /credit-score → Access dashboard
```

### Scenario 4: Failed KBA (Retry)
```
1. POST /register → kba_passed = 0
2. GET /idiq/verification-questions → Get questions
3. POST /idiq/verification-answers → Submit wrong answers
   → Response: { status: "Incorrect" }
4. GET /idiq/verification-questions → Get new questions
5. POST /idiq/verification-answers → Submit correct answers
   → Response: { status: "Correct", kba_passed: true }
```

### Scenario 5: More Questions Flow
```
1. POST /idiq/verification-answers → Submit answers
   → Response: { status: "MoreQuestions" }
2. GET /idiq/verification-questions → Fetch additional questions
3. POST /idiq/verification-answers → Submit more answers
   → Response: { status: "Correct", kba_passed: true }
```

---

## ⚠️ Important Notes

### Authentication:
- ✅ Token expires after X hours (check with backend)
- ✅ Store token in localStorage or secure cookie
- ✅ Include `Authorization: Bearer {token}` in all authenticated requests
- ✅ Handle 401 errors → Redirect to login

### KBA Status:
- `kba_passed = 0` → User must complete verification
- `kba_passed = 1` → User can access dashboard
- Always check this after login/register

### Error Handling:
- `200 OK` → Success
- `201 Created` → Resource created (register)
- `422 Unprocessable Entity` → Validation errors
- `401 Unauthorized` → Token invalid/expired
- `404 Not Found` → Resource not found

### Registration:
- This is a **blocking operation** (calls IDIQ API)
- May take 3-10 seconds
- Show loading indicator in UI
- SSN format: `666-12-1234` (with dashes)
- DOB format: `YYYY-MM-DD` (e.g., `1990-05-20`)

---

## 📊 Response Examples

### Login Response:
```json
{
  "access_token": "1|laravel_sanctum_token_abc123...",
  "kba_passed": 1,
  "is_upgraded": 0
}
```

### Credit Score Response:
```json
{
  "credit_score": 720,
  "date": "2023-10-25",
  "quick_view": {
    "bureau": "Experian",
    "inquiries": 2,
    "public_records": 0,
    "utilization": "15%"
  }
}
```

### KBA Questions Response:
```json
[
  {
    "questionId": "q1",
    "text": "Which of the following streets have you lived on?",
    "choices": [
      "Maple St",
      "Oak St",
      "Sunset Blvd",
      "None of the above"
    ]
  },
  {
    "questionId": "q2",
    "text": "What is your previous employer?",
    "choices": [
      "Ford",
      "Tesla",
      "Amazon",
      "None of the above"
    ]
  }
]
```

### KBA Answers Response:
```json
{
  "status": "Correct",
  "kba_passed": true
}
```

---

## 🎨 Frontend Implementation Checklist

### Authentication Pages:
- [ ] Login page with email/password form
- [ ] Register page with full form (11 fields)
- [ ] Forgot password page
- [ ] OTP login page

### KBA Verification:
- [ ] KBA questions modal/page
- [ ] Display questions dynamically
- [ ] Radio buttons for choices
- [ ] Submit button
- [ ] Handle all status types (Correct, Incorrect, MoreQuestions, accountCodeMissing)
- [ ] Loading state during submission
- [ ] Error messages

### Dashboard:
- [ ] Credit score display (large number)
- [ ] Score date
- [ ] Quick view cards (inquiries, utilization, etc.)
- [ ] Refresh score button
- [ ] Navigation to full report

### Profile/Settings:
- [ ] Display user info from GET /settings
- [ ] Edit form for profile update
- [ ] Change password form
- [ ] Delete account button (with confirmation)

### Credit Report:
- [ ] Full credit report page
- [ ] Parse and display tradelines
- [ ] Show hard inquiries
- [ ] Display public records

### Billing:
- [ ] Upgrade button/page
- [ ] Cancel/downgrade button
- [ ] Show current plan status

---

## 🔧 Environment Variables

### For React (.env):
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
```

### For Next.js (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENV=development
```

### For Vue (.env):
```env
VUE_APP_API_URL=http://localhost:8000/api/v1
VUE_APP_ENV=development
```

---

## 📞 Support & Troubleshooting

### Common Issues:

**1. CORS Errors**
- Backend must enable CORS for frontend domain
- Check `Access-Control-Allow-Origin` header

**2. 401 Unauthorized**
- Token expired or invalid
- Check `Authorization` header format: `Bearer {token}`
- Verify token is saved correctly

**3. 422 Validation Error**
- Check request body format
- Verify all required fields present
- Check field formats (date, SSN, etc.)

**4. Registration Takes Long Time**
- This is normal (calls IDIQ API)
- Show loading indicator
- Consider adding timeout (30 seconds)

**5. KBA Status "accountCodeMissing"**
- User has no credit history ("thin file")
- Show appropriate error message
- Contact support for manual verification

---

## ✅ Summary

**You have:**
- ✅ Complete Postman collection (20 endpoints)
- ✅ Auto-saved authentication tokens
- ✅ Sample code for frontend integration
- ✅ Test scenarios for all user flows
- ✅ Error handling guide

**Next steps:**
1. Import collection to Postman
2. Test all endpoints
3. Integrate into your frontend
4. Handle all response statuses
5. Add error handling
6. Test complete user journeys

**Your backend API is ready to connect to the frontend!** 🚀
