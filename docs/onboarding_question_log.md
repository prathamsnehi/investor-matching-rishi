# Founder Onboarding Flow

## 01 · Account Basics — Identity & Access

| Field | Type | Status |
|-------|------|--------|
| Full name | Text input | **Required** |
| Email address | Email input — used for login | **Required** |
| Mobile number | Phone input with OTP verification | **Required** |
| LinkedIn profile URL | URL input — used for identity verification | **Required** |
| Profile photo | Image upload | Optional |

---

## 02 · Startup Identity — Core Company Info

| Field | Type | Status |
|-------|------|--------|
| Startup name | Text input | **Required** |
| Your role at the startup | Text input — e.g. Co-founder & CEO | **Required** |
| Year founded | Dropdown (years) | **Required** |
| Startup logo | Image upload | Optional |
| One-line description (max 140 characters) | Text input — shown on discovery cards | **Required** |
| Full description of the startup (max 500 words) | Rich text area — shown on full profile | **Required** |
| Website URL | URL input | Optional |
| City / state of incorporation or primary operations | Dropdown — Indian states + major cities | **Required** |
| Is the entity incorporated? | Yes / No toggle — if yes, prompt for entity type | **Required** |
| Entity type (if incorporated) | Dropdown — Private Ltd, LLP, OPC, Other | Optional |

---

## 03 · Sector & Stage — Core Matching Filters

| Field | Type | Status |
|-------|------|--------|
| Primary sector | Single select from 12 parent sectors | **Hard filter** |
| Subsector (within primary sector) | Single or multi-select from relevant subsector list | **Hard filter** |
| Secondary sector (if applicable) | Single select from 12 parent sectors | Optional |
| Fundraising stage | Single select — Pre-seed / Seed / Pre-Series A | **Hard filter** |
| Technology Readiness Level (TRL) | Single select — Idea / Prototype / Pilot / Live product / Scaling | **Hard filter** |
| Business model | Multi-select — B2B / B2C / B2B2C / Marketplace / D2C / Other | **Required** |

---

## 04 · Fundraising Details — Core Matching Filters

| Field | Type | Status |
|-------|------|--------|
| Total amount being raised (₹) | Numeric input — used for investor ticket size matching | **Hard filter** |
| Minimum cheque size you will accept (₹) | Numeric input — filters out investors below threshold | **Hard filter** |
| How much have you raised so far in this round? (₹) | Numeric input — used for progress bar when > 0 | **Required** |
| Pre-money valuation (₹) | Numeric input | **Required** |
| Target close date for this round | Date picker | Optional |
| Use of funds (brief description) | Text area — max 200 words | Optional |
| Are you open to investor involvement beyond capital? | Multi-select — Mentorship / Network / Board seat / None / Open to all | Optional |

---

## 05 · Traction & Financials — Signal for Investors

| Field | Type | Status |
|-------|------|--------|
| Current revenue stage | Single select — Pre-revenue / Early revenue (under ₹10L/mo) / Growing revenue (₹10L–₹1Cr/mo) / Scaling (₹1Cr+/mo) | **Hard filter** |
| Month-on-month growth rate (%) | Numeric input | Optional |
| Have you raised external funding previously? | Yes / No toggle — if yes, prompt for details | **Required** |
| Previous funding details (amount, round, investors) | Text area — shown only if previous funding = Yes | Optional |
| Notable achievements, awards, or press mentions | Text area — e.g. YC application, incubator backing, media coverage | Optional |
| Pitch deck upload | PDF upload — visible only to investors you match with | Optional |

---

## 06 · Team — Up to 4 Key Members

| Field | Type | Status |
|-------|------|--------|
| Number of co-founders | Numeric input (1–4) | **Required** |
| For each co-founder: name, role, LinkedIn URL | Repeating field block — triggered by co-founder count | **Required** |
| For each co-founder: brief bio (max 100 words) | Text area per co-founder | Optional |
| Does any co-founder have prior startup experience? | Yes / No toggle per co-founder — if yes, prompt for details | Optional |
| Total full-time team size (including founders) | Numeric input | **Required** |

---

## 07 · Incubator & Accelerator Backing — Credibility Signals

| Field | Type | Status |
|-------|------|--------|
| Are you backed by or associated with an incubator or accelerator? | Yes / No toggle | **Required** |
| Name of incubator / accelerator | Text input or searchable dropdown — shown if backed = Yes | Optional |
| Cohort / year of association | Text input — shown if backed = Yes | Optional |

---

## 08 · Preferences — Discovery Settings

| Field | Type | Status |
|-------|------|--------|
| Preferred investor type | Multi-select — Angel / VC fund / Family office / Any | Optional |

---
---

# Investor Onboarding Flow

## 01 · Account Basics — Identity & Access

| Field | Type | Status |
|-------|------|--------|
| Full name | Text input | **Required** |
| Email address | Email input — used for login | **Required** |
| Mobile number | Phone input with OTP verification | **Required** |
| LinkedIn profile URL | URL input — primary credibility signal | **Required** |
| Profile photo | Image upload | Optional |
| City of residence / primary base | Dropdown — Indian cities | **Required** |

---

## 02 · Investor Type & Background — Shapes Subsequent Questions

| Field | Type | Status |
|-------|------|--------|
| I am investing as | Single select — Individual angel / Part of a micro-VC or fund / Family office / Scout / Syndicate lead | **Required** |
| Fund or firm name (if applicable) | Text input — shown if not Individual angel | Optional |
| Fund website (if applicable) | URL input | Optional |
| Brief bio — your background and what you bring beyond capital (max 300 words) | Rich text area — shown on investor profile visible to founders | **Required** |
| Professional background / domain expertise | Multi-select — Finance / Tech / Operations / Sales & GTM / Product / Legal / Healthcare / Other | Optional |
| Notable portfolio companies (up to 5) | Repeating text input — company name + brief context | Optional |

---

## 03 · Investment Thesis — Core Matching Filters

| Field | Type | Status |
|-------|------|--------|
| Sectors of interest (primary) | Multi-select from 12 parent sectors — must pick at least 1; or Sector agnostic | **Hard filter** |
| Subsectors of interest | Multi-select from subsectors within chosen parent sectors | **Hard filter** |
| Preferred fundraising stage | Multi-select — Pre-seed / Seed / Pre-Series A | **Hard filter** |
| Minimum TRL you will consider | Single select — Idea / Prototype / Pilot / Live product / Scaling | **Hard filter** |
| Preferred business model | Multi-select — B2B / B2C / B2B2C / Marketplace / D2C / Any | Optional |
| Do you have a thesis note you'd like to share? | Text area or PDF upload — shown on investor profile | Optional |

---

## 04 · Cheque & Deployment — Core Matching Filters

| Field | Type | Status |
|-------|------|--------|
| Minimum cheque size per investment (₹) | Numeric input | **Hard filter** |
| Maximum cheque size per investment (₹) | Numeric input | **Hard filter** |
| Preferred revenue stage of startup at investment | Multi-select — Pre-revenue / Early revenue / Growing revenue / Any | **Hard filter** |

---

## 05 · Value-Add & Involvement — Shown on Investor Profile

| Field | Type | Status |
|-------|------|--------|
| What can you offer portfolio founders beyond capital? | Multi-select — Mentorship / Network & intros / GTM support / Hiring / Technical / Follow-on capital / Board involvement / Nothing specific | Optional |
| Preferred level of involvement post-investment | Single select — Hands-on / Periodic check-ins / Passive / Depends on startup | Optional |

---

## 06 · Deal Preferences & Process — Sets Expectations for Founders

| Field | Type | Status |
|-------|------|--------|
| Typical time from first meeting to term sheet (based on your past deals) | Single select — Under 2 weeks / 2–4 weeks / 1–3 months / 3+ months | Optional |
| Are there sectors or business models you will not invest in? | Text area — exclusions used internally for matching logic | Optional |

---

## 07 · Verification & Trust — Platform Integrity

| Field | Type | Status |
|-------|------|--------|
| PAN number | Text input — for identity verification only, not displayed | **Required** |
| Are you a SEBI-registered angel investor or AIF? | Yes / No toggle — if yes, prompt for registration number | Optional |
