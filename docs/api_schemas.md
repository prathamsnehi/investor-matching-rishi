# Fundmatch API Schema Documentation (v1)

### Base URL

`http://<YOUR_SERVER_IP>:8000/api/v1`

### Authentication Security

Routes marked with **Requires Auth** expect a valid JWT token in the HTTP Headers:

```json
{
  "Authorization": "Bearer <your_access_token>"
}
```

### Allowed Enums

Frontend Note: These should be mapped directly to TypeScript enum or union types. The backend will strictly validate against these exact string values.

AccountRole: "FOUNDER" | "INVESTOR"
FundingStage: "PRE_SEED" | "SEED" | "PRE_SERIES_A"
TRL (Tech Readiness Level): "IDEA" | "PROTOTYPE" | "PILOT" | "LIVE_PRODUCT" | "SCALING"
InvestorType: "ANGEL" | "VC_FUND" | "FAMILY_OFFICE" | "SYNDICATE"

## 1. Authentication Endpoints (/auth)

### 1.1 Signup

Creates a base user account. Must be followed by the appropriate Onboarding endpoint.

Endpoint: POST /auth/signupRequires
Auth: No
Rate Limit: 5 requests / minute per IP

Request Body (JSON)

```javascript
{
  "full_name": "string",
  "email_address": "string (email format)",
  "mobile_number": "string (preserve country codes, e.g., +91)",
  "password": "string (min 8 chars)",
  "role": "FOUNDER | INVESTOR",
  "linkedin_profile_url": "string (optional valid URL or null)"
}
Response (201 Created)
```

```javascript
{
  "status": 201,
  "message": "success",
  "email": "user@example.com",
  "user_id": "uuid-string"
}
```

### 1.2 Login

Authenticates a user and issues a stateless JWT.

#### Endpoint: POST /auth/login

#### Requires Auth: No

#### Rate Limit: 5 requests / minute per IP

IMPORTANT: To comply with the OAuth2 security standard, this specific endpoint strictly requires Form Data (application/x-www-form-urlencoded), NOT standard JSON. Additionally, the user's email must be passed using the key username.

Request Payload (Form Data)

Key | Type | Description |
username | string | The user's registered email address.
password | string | The user's plain-text password.

Response (200 OK)

```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "token_type": "bearer",
  "email": "user@example.com",
  "role": "FOUNDER" // or "INVESTOR"
}
```

React Native Integration Reference
Axios Request Setup:

```javascript
import axios from "axios";

const loginUser = async (email, password) => {
  const response = await axios.post(
    "http://<API_URL>/api/v1/auth/login",
    {
      username: email, // Must explicitly be 'username'
      password: password,
    },
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    },
  );
  return response.data;
};
```

Token Storage & Usage (MMKV):

```javascript
// 1. Store the token after successful login
mmkvStorage.set("access_token", response.data.access_token);
mmkvStorage.set("user_role", response.data.role);

// 2. Attach to future protected API calls
const token = mmkvStorage.getString("access_token");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
```

### 1.3 Logout

Globally invalidates all active sessions for the user by rotating their token version.

#### Endpoint: POST /auth/logout

#### Requires Auth: Yes

#### Request Body(None)

Response (200 OK)

```javascript
  "status": 200,
  "message": "success"
}
```

### 1.4 Change Password

Updates the user's password and simultaneously logs them out of all other devices.

#### Endpoint: POST /auth/change_password

#### Requires Auth: Yes

Request Body (JSON)

```javascript
{
  "old_password": "string",
  "new_password": "string (min 8 chars)"
}
```

Response (200 OK)

```javascript
{
  "status": 200,
  "message": "success"
}
```

## 2. Onboarding Endpoints (/onboarding)

### 2.1 Onboard Investor

Creates the specific investor profile for a newly signed-up user.

Endpoint: POST /onboarding/investor
Requires Auth: Yes (User must have role: INVESTOR and send JWT in headers)

Request Body (JSON)

```javascript
{
  "investor_type": "ANGEL | VC_FUND | FAMILY_OFFICE | SYNDICATE",
  "brief_bio": "string",
  "min_trl_accepted": "IDEA | PROTOTYPE | PILOT | LIVE_PRODUCT | SCALING",
  "min_cheque_inr": 1000000.0,
  "max_cheque_inr": 50000000.0,
  "preferred_stages": ["PRE_SEED", "SEED"]
}
```

Response (201 Created)

```javascript
{
  "status": 201,
  "message": "profile created, onboarding complete"
}
```

### 2.2 Onboard Founder

Creates the specific startup profile for a newly signed-up user.

#### Endpoint: POST /onboarding/founder

#### Requires Auth: Yes (User must have role: FOUNDER and send JWT in headers)

Request Body (JSON)

```javascript
{
  "startup_name": "string",
  "one_line_desc": "string",
  "full_desc": "string",
  "stage": "PRE_SEED | SEED | PRE_SERIES_A",
  "trl": "IDEA | PROTOTYPE | PILOT | LIVE_PRODUCT | SCALING",
  "target_raise_inr": 20000000.0,
  "min_cheque_inr": 1000000.0
}
```

Response (201 Created)

```javascript
{
  "status": 201,
  "message": "profile created, onboarding complete"
}
```
