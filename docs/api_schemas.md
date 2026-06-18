# API Schemas: Onboarding Endpoints
1. Allowed Enums
### Frontend Note: These should be mapped directly to TypeScript enum or union types. The backend will strictly validate against these exact string values.

AccountRole: "FOUNDER" | "INVESTOR"

FundingStage: "PRE_SEED" | "SEED" | "PRE_SERIES_A"

TRL (Tech Readiness Level): "IDEA" | "PROTOTYPE" | "PILOT" | "LIVE_PRODUCT" | "SCALING"

InvestorType: "ANGEL" | "VC_FUND" | "FAMILY_OFFICE"

2. Founder Onboarding
Endpoint: POST /api/v1/onboarding/onboard_founder

## Schema Definition

```JavaScript
{
  // --- Account Base Fields ---
  "role": "FOUNDER",                 // REQUIRED: Must be exactly "FOUNDER"
  "full_name": "string",             // REQUIRED
  "email_address": "string",         // REQUIRED: Valid email format
  "mobile_number": "string",         // REQUIRED: String to preserve country codes (e.g. "+91")
  "linkedin_profile_url": "string",  // OPTIONAL: Valid URL format or null
  "photo_url": "string",             // OPTIONAL: Valid URL/path or null
  
  // --- Founder Specific Fields ---
  "startup_name": "string",          // REQUIRED
  "one_line_desc": "string",         // REQUIRED
  "full_desc": "string",             // REQUIRED
  "stage": "FundingStage",           // REQUIRED: Enum value
  "trl": "TRL",                      // REQUIRED: Enum value
  "target_raise_inr": number,        // REQUIRED: Float
  "min_cheque_inr": number           // REQUIRED: Float
}
```
Sample JSON Payload

```JSON
{
  "role": "FOUNDER",
  "full_name": "Rishi Goyal",
  "email_address": "rishi@example.com",
  "mobile_number": "+919876543210",
  "linkedin_profile_url": "https://linkedin.com/in/rishi-goyal-1a4597238",
  "photo_url": null,
  "startup_name": "Fundmatch",
  "one_line_desc": "The future of Founder-Investor matchmaking in India.",
  "full_desc": "A digital platform that matches founders and investors based on fit and investment preferences using a curated ML engine...",
  "stage": "PRE_SEED",
  "trl": "PROTOTYPE",
  "target_raise_inr": 20000000.0,
  "min_cheque_inr": 1000000.0
}
```
3. Investor Onboarding
Endpoint: POST /api/v1/onboarding/onboard_investor

Schema Definition

```JavaScript
{
  // --- Account Base Fields ---
  "role": "INVESTOR",                // REQUIRED: Must be exactly "INVESTOR"
  "full_name": "string",             // REQUIRED
  "email_address": "string",         // REQUIRED: Valid email format
  "mobile_number": "string",         // REQUIRED: String to preserve country codes
  "linkedin_profile_url": "string",  // OPTIONAL: Valid URL format or null
  "photo_url": "string",             // OPTIONAL: Valid URL/path or null
  
  // --- Investor Specific Fields ---
  "investor_type": "InvestorType",   // REQUIRED: Enum value
  "brief_bio": "string",             // REQUIRED
  "preferred_stages": ["FundingStage"], // REQUIRED: Array of Enum strings
  "min_trl_accepted": "TRL",         // REQUIRED: Enum value
  "min_cheque_inr": number,          // REQUIRED: Float
  "max_cheque_inr": number           // REQUIRED: Float
}
```

Sample JSON Payload

```JSON
{
  "role": "INVESTOR",
  "full_name": "Priya Sharma",
  "email_address": "priya.angel@example.com",
  "mobile_number": "+919988776655",
  "linkedin_profile_url": "https://linkedin.com/in/priyasharma",
  "photo_url": "https://s3.aws.com/bucket/priya.jpg",
  "investor_type": "ANGEL",
  "brief_bio": "Active Indian angel investing in early-stage tech and consumer products. Looking to write 2-10 cheques per year.",
  "preferred_stages": [
    "PRE_SEED", 
    "SEED"
  ],
  "min_trl_accepted": "PROTOTYPE",
  "min_cheque_inr": 5000000.0,
  "max_cheque_inr": 50000000.0
}
```


### Authentication: Login Endpoint (`/login`)

**Endpoint:** `POST /api/v1/auth/login`

**Important Frontend Integration Note:** To comply with the OAuth2 security standard, this specific endpoint **strictly requires Form Data** (`application/x-www-form-urlencoded`), NOT standard JSON. Additionally, the user's email must be passed using the key `username`.

#### Request Payload (Form Data)
| Key | Type | Description |
| :--- | :--- | :--- |
| `username` | `string` | The user's registered email address. |
| `password` | `string` | The user's plain-text password. |

#### Response Schema (JSON)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "token_type": "bearer",
  "email": "user@example.com",
  "role": "FOUNDER" // or "INVESTOR"
}
```

### React Native Integration Reference
1. Axios Request Setup:

```JavaScript
import axios from 'axios';

const loginUser = async (email, password) => {
  const response = await axios.post('http://<API_URL>/api/v1/auth/login', 
    {
      username: email, // Must explicitly be 'username'
      password: password
    }, 
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  return response.data; 
};
```
2. Token Storage & Usage (MMKV):

```TypeScript
// 1. Store the token after successful login
mmkvStorage.set('access_token', response.data.access_token);
mmkvStorage.set('user_role', response.data.role); 

// 2. Attach to future protected API calls
const token = mmkvStorage.getString('access_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```