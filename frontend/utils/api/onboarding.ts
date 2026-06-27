import { apiClient } from "./client";
import { FundingStage, TRL, InvestorType } from "@/constants/enums";

export interface FounderOnboardingRequest {
  startup_name: string;
  one_line_desc: string;
  full_desc: string;
  stage: FundingStage;
  trl: TRL;
  target_raise_inr: number;
  min_cheque_inr: number;
}

export interface InvestorOnboardingRequest {
  investor_type: InvestorType;
  brief_bio: string;
  preferred_stages: FundingStage[];
  min_trl_accepted: TRL;
  min_cheque_inr: number;
  max_cheque_inr: number;
}

interface OnboardingResponse {
  status: number;
  message: string;
}

export const submitFounderOnboarding = (payload: FounderOnboardingRequest) =>
  apiClient.postJson<OnboardingResponse>("/onboarding/founder", payload);

export const submitInvestorOnboarding = (payload: InvestorOnboardingRequest) =>
  apiClient.postJson<OnboardingResponse>("/onboarding/investor", payload);
