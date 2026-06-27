import { AccountRole, FundingStage, TRL, InvestorType } from "@/constants/enums";

export type UserAccountType = "founder" | "investor";

/**
 * Founder onboarding draft — mirrors the POST /onboarding/founder payload
 * (docs/api_schemas.md), plus the locally-held pitch deck references.
 */
export interface FounderOnboardingData {
  startup_name?: string;
  one_line_desc?: string;
  full_desc?: string;
  stage?: FundingStage;
  trl?: TRL;
  target_raise_inr?: number;
  min_cheque_inr?: number;

  // Held locally only: backend has no pitch-deck field yet.
  pitchDeckUri?: string; // local file uri from the document picker
  pitchDeckUrl?: string; // Firebase Storage download URL after upload
}

/**
 * Investor onboarding draft — mirrors the POST /onboarding/investor payload.
 */
export interface InvestorOnboardingData {
  investor_type?: InvestorType;
  brief_bio?: string;
  preferred_stages?: FundingStage[];
  min_trl_accepted?: TRL;
  min_cheque_inr?: number;
  max_cheque_inr?: number;
}

/** Persisted auth session (see docs/api_schemas.md MMKV reference). */
export interface AuthSession {
  access_token: string;
  role: AccountRole;
  email: string;
  user_id?: string;
}

export const STORAGE_KEYS = {
  // Onboarding drafts + status
  USER_ACCOUNT_TYPE: "userAccountType",
  FOUNDER_ONBOARDING_DATA: "founderOnboardingData",
  INVESTOR_ONBOARDING_DATA: "investorOnboardingData",
  DID_USER_ONBOARD: "didUserOnboard",

  // Auth session
  ACCESS_TOKEN: "access_token",
  USER_ROLE: "user_role",
  USER_EMAIL: "user_email",
  USER_ID: "user_id",
};
