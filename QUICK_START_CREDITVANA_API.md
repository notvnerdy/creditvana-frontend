# CreditVana Backend API - Quick Start Guide

## 🎉 You Got 2 Files

### 1. **CreditVana_Backend_API_Postman_Collection.json** 
Complete Postman collection with **20 endpoints** ready for frontend integration

### 2. **CREDITVANA_BACKEND_API_GUIDE.md**
Comprehensive guide with code examples and integration instructions

---

## 📦 Collection Contains

### **20 Endpoints Across 6 Categories:**

#### 1. Authentication (6 endpoints)
- `POST /login` - Email/password login
- `POST /register` - User registration + IDIQ enrollment
- `POST /login-via-email` - Request OTP
- `POST /verify-login-via-email-otp` - Verify OTP login
- `POST /forgot-password` - Password reset
- `POST /logout` - Logout

#### 2. User Profile (4 endpoints)
- `GET /settings` - Get user profile
- `PUT /settings` - Update profile
- `POST /password/change` - Change password
- `DELETE /account/delete` - Delete account

#### 3. Identity Verification / KBA (2 endpoints)
- `GET /idiq/verification-questions` - Get KBA questions
- `POST /idiq/verification-answers` - Submit answers

#### 4. Credit Data & Dashboard (3 endpoints)
- `GET /credit-score` - Dashboard score + quick view
- `POST /idiq/credit-score/order` - Force refresh score
- `GET /idiq/credit-report` - Full credit report

#### 5. Subscription & Billing (2 endpoints)
- `POST /upgrade` - Upgrade to premium
- `POST /downgrade` - Cancel/downgrade

#### 6. Utilities (3 endpoints)
- `GET /states` - Get US states
- `GET /cities?q=search` - Search cities
- `POST /log-client-error` - Log errors

---

## 🚀 Quick Start (3 Steps)

### Step 1: Import to Postman
1. Open Postman
2. Click **Import**
3. Drag `CreditVana_Backend_API_Postman_Collection.json`
4. ✅ Done!

### Step 2: Configure Base URL
**Default:** `http://localhost:8000/api/v1`

**Change if needed:**
- Click collection → **Variables** tab
- Update `baseUrl`
- Save

### Step 3: Test It
1. Go to `1. Authentication` → `Login`
2. Update email/password in body
3. Click **Send**
4. ✅ Token auto-saved!

---

## 💻 Frontend Integration Example

### React/Next.js:

```javascript
// API Client (src/services/api.js)
const API_URL = 'http://localhost:8000/api/v1';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Save token
  localStorage.setItem('access_token', data.access_token);
  
  // Check KBA status
  if (data.kba_passed === 0) {
    router.push('/verify'); // Need KBA verification
  } else {
    router.push('/dashboard'); // Ready to go
  }
  
  return data;
};

// Get Credit Score (with auth)
const getCreditScore = async () => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/credit-score`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Register User
const register = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password,
      dob: '1990-05-20', // YYYY-MM-DD
      ssn: '666-12-1234',
      phone: '555-555-5555',
      street: userData.street,
      city: userData.city,
      state: userData.state,
      zip: userData.zip
    })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  
  return data;
};
```

---

## 🔐 Authentication Flow

### 1. Registration → KBA → Dashboard
```
User fills registration form
    ↓
POST /register (with 11 fields)
    ↓
Backend enrolls in IDIQ (blocking, 3-10 sec)
    ↓
Returns: { access_token, kba_passed: 0 }
    ↓
Save token, redirect to KBA verification
    ↓
GET /idiq/verification-questions
    ↓
Show questions to user
    ↓
POST /idiq/verification-answers
    ↓
If status = "Correct" → kba_passed = 1
    ↓
Redirect to Dashboard
```

### 2. Login Flow
```
User enters email/password
    ↓
POST /login
    ↓
Returns: { access_token, kba_passed: 1 or 0 }
    ↓
If kba_passed = 0 → Redirect to KBA
If kba_passed = 1 → Redirect to Dashboard
```

---

## 📱 Frontend Pages & Endpoints

### Login Page
```javascript
// POST /login
{
  email: "user@example.com",
  password: "password123"
}
→ Returns: access_token, kba_passed
```

### Registration Page
```javascript
// POST /register
{
  first_name, last_name, email, password,
  password_confirmation, dob, ssn, phone,
  street, city, state, zip
}
→ Returns: access_token, kba_passed: 0
```

### KBA Verification Page
```javascript
// GET /idiq/verification-questions
→ Returns: Array of questions with choices

// POST /idiq/verification-answers
{
  answers: [
    { questionId: "q1", answer: "Sunset Blvd" },
    { questionId: "q2", answer: "Ford" }
  ]
}
→ Returns: { status: "Correct", kba_passed: true }
```

### Dashboard Page
```javascript
// GET /credit-score
→ Returns: {
  credit_score: 720,
  date: "2023-10-25",
  quick_view: {
    bureau: "Experian",
    inquiries: 2,
    public_records: 0,
    utilization: "15%"
  }
}
```

### Profile/Settings Page
```javascript
// GET /settings
→ Returns: User object

// PUT /settings
{
  first_name: "Johnny",
  phone: "999-999-9999"
}
→ Returns: Updated user object
```

### Credit Report Page
```javascript
// GET /idiq/credit-report
→ Returns: Full credit report JSON
```

---

## ⚠️ Important Notes

### Token Management
- Store token in `localStorage` or secure cookie
- Include in every authenticated request:
  ```javascript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```
- Handle 401 errors → Redirect to login

### KBA Status
- `kba_passed = 0` → User MUST complete verification first
- `kba_passed = 1` → User can access dashboard
- Check this after every login/register

### Registration Special Notes
- **Blocking operation** - Takes 3-10 seconds
- Show loading indicator
- SSN format: `666-12-1234` (with dashes)
- DOB format: `YYYY-MM-DD`

### KBA Response Statuses
- `"Correct"` → Verification successful, go to dashboard
- `"Incorrect"` → Show error, allow retry
- `"MoreQuestions"` → Fetch questions again immediately
- `"accountCodeMissing"` → "Thin file" error message

---

## 🧪 Test in Postman

### Complete User Journey:
```
1. Register → POST /register
   ✅ Token saved automatically

2. Get Questions → GET /idiq/verification-questions
   ✅ Copy question IDs

3. Submit Answers → POST /idiq/verification-answers
   ✅ Status should be "Correct"

4. Get Dashboard → GET /credit-score
   ✅ See credit score + quick view

5. Get Report → GET /idiq/credit-report
   ✅ Full credit data

6. Update Profile → PUT /settings
   ✅ Profile updated

7. Logout → POST /logout
   ✅ Token cleared
```

---

## 🎯 Environment Variables

### React (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Next.js (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Vue (.env)
```env
VUE_APP_API_URL=http://localhost:8000/api/v1
```

---

## ✅ Collection Features

- ✅ **Auto-save tokens** - No manual copying
- ✅ **Pre-filled examples** - Ready to test
- ✅ **Test scripts** - Automatic token extraction
- ✅ **Organized folders** - Easy navigation
- ✅ **Complete documentation** - Every endpoint documented
- ✅ **Frontend ready** - Direct integration examples

---

## 📊 API Summary

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Authentication | 6 | Mostly No |
| User Profile | 4 | Yes |
| KBA Verification | 2 | Yes |
| Credit Data | 3 | Yes |
| Billing | 2 | Yes |
| Utilities | 3 | No |
| **Total** | **20** | Mixed |

---

## 🚀 Ready to Use!

**Everything is set up and ready for frontend integration:**

1. ✅ Import collection to Postman
2. ✅ Test all endpoints
3. ✅ Copy code examples from guide
4. ✅ Integrate into your React/Vue/Next app
5. ✅ Handle authentication flow
6. ✅ Build your UI

**All endpoints tested and documented!** 🎉
