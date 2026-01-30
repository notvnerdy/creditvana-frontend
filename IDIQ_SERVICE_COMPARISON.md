# IDIQ API Comparison: PIF Service vs Member Service

## 🚨 CRITICAL: Two Different Services

IDIQ has **TWO different API services** with different endpoints:

---

## 📊 Service Comparison

| Feature | PIF Service | Member Service (Official) |
|---------|-------------|---------------------------|
| **Base URL (Stage)** | `api-stage.identityiq.com/pif-service` | `api-stage.identityiq.com/member-service` |
| **Base URL (Prod)** | `api.identityiq.com/pif-service` | `api.identityiq.com/member-service` |
| **Documentation** | API specs | Official enrollment docs (Apr 2023) |
| **Use Case** | Full credit monitoring | Enrollment + verification |

---

## 🔄 Endpoint Mapping

### 1. Get Partner Token

| Service | Endpoint |
|---------|----------|
| **PIF** | `POST /v1/partner-token` |
| **Member** | `POST /v1/enrollment/partner-token` |

**Request:** Same for both ✅
```json
{
  "partnerId": "158096",
  "partnerSecret": "rWZwGjPZGccs3c8kFVOguZQWNeM="
}
```

**Response:** Same for both ✅

---

### 2. Enroll Member

| Service | Endpoint |
|---------|----------|
| **PIF** | `POST /v1/enrollment/enroll` |
| **Member** | `POST /v1/enrollment/enroll` |

**Request:** Same for both ✅  
**Auth:** Partner Token ✅

---

### 3. Get Member Token ⚠️ DIFFERENT

| Service | Endpoint | Request Body |
|---------|----------|--------------|
| **PIF** | `POST /v1/member-token` | `{"membershipNo": "xxx"}` |
| **Member** | `POST /v1/enrollment/partner-member-token` | `{"memberEmail": "xxx@email.com"}` |

**Key Difference:**
- PIF uses **membership number**
- Member uses **email address**

---

### 4. Get Verification Questions

| Service | Endpoint |
|---------|----------|
| **PIF** | `GET /v1/enrollment/verification-questions` |
| **Member** | `GET /v1/enrollment/verification-questions` |

**Same endpoint** ✅  
**Auth:** Member Token ✅

---

### 5. Submit Verification Answers

| Service | Endpoint |
|---------|----------|
| **PIF** | `POST /v1/enrollment/verification-questions` |
| **Member** | `POST /v1/enrollment/verification-questions` |

**Same endpoint** ✅  
**Auth:** Member Token ✅

---

### 6. Credit Score

| Service | Endpoint | Available? |
|---------|----------|------------|
| **PIF** | `GET /v1/credit-score` | ✅ Yes |
| **Member** | N/A | ❌ No - redirect to dashboard |

---

### 7. Credit Reports

| Service | Available? |
|---------|------------|
| **PIF** | ✅ Full API endpoints for reports |
| **Member** | ❌ Redirect to IdentityIQ dashboard |

---

### 8. Disputes

| Service | Available? |
|---------|------------|
| **PIF** | ✅ Full dispute API |
| **Member** | ❌ Redirect to IdentityIQ dashboard |

---

### 9. Dashboard Access

| Service | Method |
|---------|--------|
| **PIF** | API endpoints return JSON data |
| **Member** | Redirect to `https://gcpstage.identityiq.com/?Token={memberToken}` |

---

## 🎯 Which Service Should You Use?

### Use **PIF Service** if you want:
- ✅ Full credit score API access
- ✅ Full credit report API access
- ✅ Dispute management via API
- ✅ JSON data responses
- ✅ Build your own UI
- ✅ Mobile app integration
- ✅ Get member token by membership number

**Use Cases:**
- React/React Native apps
- Custom dashboards
- Mobile applications
- API-first integrations

---

### Use **Member Service** if you want:
- ✅ Simple enrollment flow
- ✅ Redirect to IdentityIQ dashboard
- ✅ Let IDIQ handle UI
- ✅ Get member token by email
- ✅ Official documented endpoints

**Use Cases:**
- Quick integrations
- Redirect-based flow
- Use IDIQ's existing dashboard
- Simpler implementation

---

## 🔑 Your CreditVana Setup

Based on your requirements (React app with full UI control):

**Recommended:** Use **PIF Service**

### Why PIF Service?
1. ✅ You already have the React UI built
2. ✅ You need JSON data for credit scores/reports
3. ✅ You want to display data in your own dashboard
4. ✅ You need dispute management APIs
5. ✅ You want full control over UX

### Your Current Setup:
```
Base URL: https://api-stage.identityiq.com/pif-service
Partner ID: 158096
Partner Secret: rWZwGjPZGccs3c8kFVOguZQWNeM=
Plan Code: PLAN03B
Offer Code: 431502GD
```

---

## 📝 Complete Flow Comparison

### PIF Service Flow (JSON APIs):
```
1. Get Partner Token
   ↓
2. Enroll Member
   ↓
3. Get Member Token (by membershipNo)
   ↓
4. Get Verification Questions
   ↓
5. Submit Answers
   ↓
6. Get Credit Score (JSON)
   ↓
7. Get Credit Report (JSON)
   ↓
8. Display in YOUR React dashboard
```

### Member Service Flow (Redirect):
```
1. Get Partner Token
   ↓
2. Enroll Member
   ↓
3. Get Member Token (by email)
   ↓
4. Get Verification Questions
   ↓
5. Submit Answers
   ↓
6. Redirect to IdentityIQ dashboard
   (User sees IDIQ's UI, not yours)
```

---

## 🧪 Test Data (Works on Both Services)

### Test Users:
| Name | SSN | DOB | State | Zip |
|------|-----|-----|-------|-----|
| CHILI HOT | 666525461 | 01/01/1984 | NC | 28430 |
| ED HEAT | 666254741 | 01/01/1984 | MO | 64072 |
| JOHN REAPER | 666254146 | 01/01/1984 | MS | 39202 |

### KBA Answers:
- SSN state: New Hampshire / California
- Birth year: 1963 / 1974
- Birth month: June (06) / August (08)
- High school grad: 1991
- Previous name: NA / Ztesterz
- Cities: Tuscaloosaz / Atlanta

---

## ⚠️ Important Notes

### Test Cases Document Says:
- Test data can be reused
- Names, street, city can be changed
- SSN, state, zip **must stay the same** after enrollment
- Cannot change SSN/state/zip and still get credit reports

### Token Differences:
- **PIF:** Get member token with `membershipNo`
- **Member:** Get member token with `memberEmail`
- Both tokens work the same way after obtained

### Credit Data Access:
- **PIF:** Full JSON API access to all data
- **Member:** Must redirect to IDIQ's dashboard

---

## 🎯 Recommendation for CreditVana

**Use PIF Service** with these endpoints:

```
Base URL: https://api-stage.identityiq.com/pif-service

Enrollment:
✅ POST /v1/partner-token
✅ POST /v1/enrollment/enroll
✅ POST /v1/member-token (with membershipNo)
✅ GET /v1/enrollment/verification-questions
✅ POST /v1/enrollment/verification-questions

Credit Data:
✅ GET /v1/credit-score
✅ GET /v1/quick-view-report
✅ GET /v1/credit-report
✅ POST /v1/credit-report/refresh

Disputes:
✅ POST /v1/dispute/enroll
✅ POST /v1/dispute/submit
✅ GET /v1/dispute/history

Plan Management:
✅ POST /v1/enrollment/plan-change
✅ POST /v1/enrollment/cancel-membership
```

This gives you **full control** over the UI and data display in your React app.

---

## 🔄 Migration Notes

If you started with Member Service and want to switch to PIF:

### Changes Needed:
1. **Base URL:** `member-service` → `pif-service`
2. **Member Token:** Use `membershipNo` instead of `email`
3. **Endpoint:** `/v1/member-token` instead of `/v1/enrollment/partner-member-token`
4. **Add Credit APIs:** Implement score, reports, disputes endpoints

### What Stays the Same:
- ✅ Partner credentials
- ✅ Enrollment endpoint
- ✅ Verification questions endpoints
- ✅ Test data

---

## 📞 Questions to Ask IDIQ

1. **"Do we have access to both PIF service and Member service?"**
2. **"Which service is recommended for a React application?"**
3. **"Can we use PIF service for full API access to credit data?"**
4. **"Are test SSNs (666xxxxx) still valid in staging?"**
5. **"Do our credentials work with both services?"**

---

## ✅ Quick Decision Matrix

| Requirement | Use PIF | Use Member |
|-------------|---------|------------|
| Custom React UI | ✅ | ❌ |
| Display credit data in your app | ✅ | ❌ |
| JSON API responses | ✅ | ❌ |
| Mobile app | ✅ | ⚠️ |
| Quick redirect integration | ❌ | ✅ |
| Use IDIQ's dashboard | ❌ | ✅ |
| Dispute management | ✅ | ❌ |
| Get token by membership# | ✅ | ❌ |
| Get token by email | ⚠️ | ✅ |

---

## 🎬 Conclusion

**For CreditVana React Application:**

**✅ Use PIF Service** (`pif-service`)
- Full API access to credit data
- Display everything in your React UI
- Complete control over user experience
- All features available via JSON APIs

**❌ Don't Use Member Service** (`member-service`)
- Limited to enrollment + redirect
- Can't display credit data in your app
- User sees IDIQ's UI, not yours
- Not suitable for custom React dashboards

---

**Your existing Postman collection with PIF service is correct for your use case!**
