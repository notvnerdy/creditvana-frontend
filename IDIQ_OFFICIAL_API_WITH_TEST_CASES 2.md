# IDIQ API - Official Documentation with Test Cases

## 🚨 IMPORTANT: Official Base URLs

The official IDIQ API uses **different base URLs** than the PIF service:

### Official Base URLs:
```
STAGING:    https://api-stage.identityiq.com/member-service
PRODUCTION: https://api.identityiq.com/member-service
```

### Previous URLs (Different Service):
```
STAGING:    https://api-stage.identityiq.com/pif-service
PRODUCTION: https://api.identityiq.com/pif-service
```

**Note:** Use `member-service` for enrollment endpoints!

---

## 📋 API Endpoints (Official Documentation)

### 1. Get Partner Token ✅

**Endpoint:** `POST /v1/enrollment/partner-token`  
**Auth:** Anonymous (no token required)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/partner-token`

**Request:**
```json
{
  "partnerId": "158096",
  "partnerSecret": "rWZwGjPZGccs3c8kFVOguZQWNeM="
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQzMTg3...",
  "expiresIn": 3600
}
```

**Status Codes:**
- `200 OK` - Success
- `422 UNPROCESSABLE ENTITY` - Validation error

---

### 2. Enroll Member ✅

**Endpoint:** `POST /v1/enrollment/enroll`  
**Auth:** Partner Token (Bearer)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/enroll`

**Headers:**
```
Authorization: Bearer {partnerToken}
Content-Type: application/json
```

**Request Model:**
```json
{
  "birthDate": "07/09/1975",           // MM/DD/YYYY (REQUIRED)
  "email": "calvin.miller@gmail.com",  // Valid email (REQUIRED)
  "firstName": "Calvin",                // 1-15 chars, letters and '- only (REQUIRED)
  "lastName": "Miller",                 // 1-15 chars, letters and '- only (REQUIRED)
  "middleNameInitial": "",             // 1 letter (OPTIONAL)
  "ssn": "123456789",                  // 9 digits only (REQUIRED)
  "offerCode": "431502GD",             // Offer code (REQUIRED)
  "planCode": "PLAN03B",               // Plan code (REQUIRED)
  "street": "939 Orange Ave",          // 1-50 chars (REQUIRED)
  "city": "Coronado",                  // 1-30 chars (REQUIRED)
  "state": "CA",                       // 2 letters (REQUIRED)
  "zip": "92118"                       // 5 digits (REQUIRED)
}
```

**Response:**
```json
{
  "membershipNo": "2434334444434"
}
```

**Status Codes:**
- `200 OK` - User enrolled
- `422 UNPROCESSABLE ENTITY` - Validation error

---

### 3. Get Member Token ✅

**Endpoint:** `POST /v1/enrollment/partner-member-token`  
**Auth:** Partner Token (Bearer)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/partner-member-token`

**⚠️ IMPORTANT:** Uses **email**, not membership number!

**Headers:**
```
Authorization: Bearer {partnerToken}
Content-Type: application/json
```

**Request:**
```json
{
  "memberEmail": "calvin.miller@gmail.com"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQzMTg3...",
  "expiresIn": 3600
}
```

**Status Codes:**
- `200 OK` - Success
- `422 UNPROCESSABLE ENTITY` - Validation error

---

### 4. Get Verification Questions ✅

**Endpoint:** `GET /v1/enrollment/verification-questions`  
**Auth:** Member Token (Bearer)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/verification-questions`

**Headers:**
```
Authorization: Bearer {memberToken}
```

**Response:**
```json
{
  "questions": [
    {
      "text": "1. Which of these street names are you associated with?",
      "answers": [
        {
          "text": "Bowen",
          "id": "68949244-3177371808"
        },
        {
          "text": "Brandywine",
          "id": "68949244-3177371810"
        },
        {
          "text": "None of the Above",
          "id": "68949244-3177371816"
        }
      ]
    }
  ],
  "isSuccess": true,
  "message": null
}
```

**Status Codes:**
- `200 OK` - Questions returned
- `422 UNPROCESSABLE ENTITY` - Error

---

### 5. Submit Verification Answers ✅

**Endpoint:** `POST /v1/enrollment/verification-questions`  
**Auth:** Member Token (Bearer)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/verification-questions`

**Headers:**
```
Authorization: Bearer {memberToken}
Content-Type: application/json
```

**Request:**
```json
{
  "answers": [
    "68949244-3177371816",
    "68949246-3177371826",
    "68949248-3177371836"
  ]
}
```

**Response:**
```json
{
  "status": "Incorrect",
  "message": "ID verification failed",
  "question": null
}
```

**Verification Status Values:**
- `Correct = 0` - Verification successful ✅
- `MoreQuestions = 1` - Additional questions needed ⏳
- `Incorrect = 2` - Verification failed ❌
- `AccountCodeMissing = 3` - Insufficient credit history ⚠️
- `Error = 4` - System error 🔴

**Status Codes:**
- `200 OK` - Request processed
- `422 UNPROCESSABLE ENTITY` - Validation error

---

### 6. Cancel Membership ✅

**Endpoint:** `POST /v1/enrollment/cancel-membership`  
**Auth:** Member Token (Bearer)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/cancel-membership`

**Headers:**
```
Authorization: Bearer {memberToken}
Content-Type: application/json
```

**Request:**
```json
{
  "email": "calvin.miller@gmail.com",
  "offerCode": "431502GD"
}
```

**Status Codes:**
- `200 OK` - Membership canceled
- `422 UNPROCESSABLE ENTITY` - Validation error

---

### 7. Get Member Status ✅

**Endpoint:** `GET /v1/enrollment/member-status`  
**Auth:** Partner Token (Bearer)  
**URL:** `https://api-stage.identityiq.com/member-service/v1/enrollment/member-status`

**Query Parameters:**
```
/v1/enrollment/member-status?membership-number=xxx
/v1/enrollment/member-status?email=xxx
/v1/enrollment/member-status?membership-number=xxx&email=yyy
```

**Response:**
```json
{
  "billingStatus": "string",
  "cancelledDate": "2023-04-11T09:48:45.383Z",
  "chargebackCount": 0,
  "chargebackDate": "2023-04-11T09:48:45.383Z",
  "currentStatus": "string",
  "effort": "string",
  "effortCode": "string",
  "emailAddress": "string",
  "enrollmentDate": "2023-04-11T09:48:45.383Z",
  "extCustRefId": "string",
  "extPartnerRefId": "string",
  "firstName": "string",
  "lastName": "string",
  "lastSuccessBillDate": "2023-04-11T09:48:45.383Z",
  "membershipNo": "string",
  "nextBillDate": "2023-04-11T09:48:45.383Z",
  "planCode": "string",
  "pricePoint": "string",
  "totalChargebackAmount": 0,
  "recentReportDate": "2023-04-11T09:48:45.383Z",
  "nextReportRefreshDate": "2023-04-11T09:48:45.383Z"
}
```

**Status Codes:**
- `200 OK` - Member found
- `400 BAD REQUEST` - Empty membership# or email
- `404 NOT FOUND` - Member not found

---

### 8. Redirect to IdentityIQ Dashboard

**STAGE URL:** `https://gcpstage.identityiq.com/`  
**PROD URL:** `https://member.identityiq.com/`

**Format:**
```
{IdentityIQ URL}/?Token={MemberToken}&isMobileApp=false&redirect=Dashboard.aspx
```

**Example:**
```
https://gcpstage.identityiq.com/?Token=eyJhbGci...&isMobileApp=false&redirect=Dashboard.aspx
```

---

## 🧪 Test Cases from IDIQ

### Test User Data

| # | Last Name | First Name | SSN | DOB | Street | City | State | Zip |
|---|-----------|------------|-----|-----|--------|------|-------|-----|
| 1 | HOT | CHILI | 666525461 | 01/01/1984 | 3325 ARMORY RD | CASTLE HAYNE | NC | 28430 |
| 2 | ED | HEAT | 666254741 | 01/01/1984 | 4163 WHITE OAK DR | MISSOURI CITY | MO | 64072 |
| 3 | REAPER | JOHN | 666254146 | 01/01/1984 | 805 WALNUT STREET | JACKSON | MS | 39202 |
| 4 | MANGO | HABI | 666154747 | 02/02/1985 | 1523 CROWFIELD RD | PHOENIX | AZ | 85018 |
| 5 | SWEET | HOT | 666154736 | 01/01/1984 | 3340 JOES RD | NIVERVILLE | NY | 12130 |

### Test Credit Cards

| Type | Number | CVV |
|------|--------|-----|
| Visa | 4444444444444448 | 331 |
| MasterCard | 5454545454545454 | 321 |

**Expiration Date:** Any future date (MM/YY format)

---

## 📝 KBA Test Answers

### General Questions:

| Question | Answer |
|----------|--------|
| What are the last four digits of your SSN? | Last 4 of inputted SSN |
| What state was your SSN issued? | New Hampshire / California |
| In what year were you born? | 1963 / 1974 |
| In what month were you born? | June (06) / August (08) |
| How old are you? | Dummy=N/A-40 |
| What year did you graduate from high school? | 1991 |
| Which last names have you used previously? | NA / Ztesterz |

### Address Questions:

| Question | Answer |
|----------|--------|
| Which cities are you associated with? | Tuscaloosaz / Atlanta |
| Which street names are you associated with? | (Use test data street) |
| What state do you live in? | (Use test data state) |
| What is your ZIP code? | (Use test data ZIP) |

### Employment Questions:

| Question | Answer |
|----------|--------|
| Current or previous employer? | (Varies by test user) |

---

## ⚠️ Important Test Notes

### Test Case Rules:
1. **Reusable:** Test cases can be reused multiple times
2. **Changeable:** Can change First, Middle, Last Name, Street, City
3. **Fixed:** SSN, State, Zip must remain the same for credit reports
4. **Once Enrolled:** Cannot change SSN, State, or Zip after enrollment

### Test Data Requirements:
- Use SSNs starting with `666` (test SSNs)
- Use valid email addresses
- Birth dates must be 18+ years old
- Use provided credit card test numbers
- Street, City, Name can be modified for uniqueness

---

## 🔄 Complete Test Flow

### Step 1: Get Partner Token
```bash
POST /v1/enrollment/partner-token
{
  "partnerId": "158096",
  "partnerSecret": "rWZwGjPZGccs3c8kFVOguZQWNeM="
}
→ Save accessToken as {partnerToken}
```

### Step 2: Enroll Test User
```bash
POST /v1/enrollment/enroll
Authorization: Bearer {partnerToken}
{
  "firstName": "CHILI",
  "lastName": "HOT",
  "email": "test1@example.com",
  "birthDate": "01/01/1984",
  "ssn": "666525461",
  "street": "3325 ARMORY RD",
  "city": "CASTLE HAYNE",
  "state": "NC",
  "zip": "28430",
  "planCode": "PLAN03B",
  "offerCode": "431502GD"
}
→ Returns membershipNo
```

### Step 3: Get Member Token
```bash
POST /v1/enrollment/partner-member-token
Authorization: Bearer {partnerToken}
{
  "memberEmail": "test1@example.com"
}
→ Save accessToken as {memberToken}
```

### Step 4: Get Verification Questions
```bash
GET /v1/enrollment/verification-questions
Authorization: Bearer {memberToken}
→ Returns questions with answer IDs
```

### Step 5: Submit Answers
```bash
POST /v1/enrollment/verification-questions
Authorization: Bearer {memberToken}
{
  "answers": ["id1", "id2", "id3"]
}
→ Check status: Correct, MoreQuestions, Incorrect, etc.
```

### Step 6: Access Dashboard
```bash
https://gcpstage.identityiq.com/?Token={memberToken}&isMobileApp=false&redirect=Dashboard.aspx
```

---

## 🔑 Your Credentials

```
Partner ID: 158096
Partner Secret: rWZwGjPZGccs3c8kFVOguZQWNeM=
Plan Code: PLAN03B
Offer Code: 431502GD
```

---

## 📊 Key Differences from Previous Documentation

### Base URL Changed:
```
OLD: https://api-stage.identityiq.com/pif-service
NEW: https://api-stage.identityiq.com/member-service
```

### Member Token Endpoint Changed:
```
OLD: POST /v1/member-token
     Body: { "membershipNo": "xxx" }

NEW: POST /v1/enrollment/partner-member-token
     Body: { "memberEmail": "xxx@example.com" }
```

### All Endpoints Under /v1/enrollment:
- `/v1/enrollment/partner-token`
- `/v1/enrollment/enroll`
- `/v1/enrollment/partner-member-token`
- `/v1/enrollment/verification-questions`
- `/v1/enrollment/cancel-membership`
- `/v1/enrollment/member-status`

---

## ✅ Testing Checklist

- [ ] Get partner token with your credentials
- [ ] Enroll test user (use test data from table)
- [ ] Get member token using email
- [ ] Get verification questions
- [ ] Submit answers (use KBA test answers)
- [ ] Check verification status
- [ ] Access dashboard with member token
- [ ] Get member status
- [ ] Cancel membership (optional)

---

## 🚨 Common Issues

### Issue: "Invalid partner credentials"
- Verify Partner ID: `158096`
- Verify Secret: `rWZwGjPZGccs3c8kFVOguZQWNeM=`

### Issue: "Member not found"
- Use the **email** address, not membership number
- Ensure user was enrolled successfully

### Issue: "Verification failed"
- Use answers from KBA test data
- Ensure answers match the test user's information
- Check SSN, birth date, state match test data

### Issue: "Wrong base URL"
- Use `member-service` not `pif-service`
- Use `/v1/enrollment/` prefix on all endpoints

---

## 📞 Support

**IDIQ Support:** support@identityiq.com

**Questions to Ask:**
1. Confirm test SSN data still valid
2. Request updated KBA answer key if needed
3. Verify plan codes and offer codes
4. Get additional test accounts if needed

---

**This documentation is based on official IDIQ API documentation dated April 12, 2023**
