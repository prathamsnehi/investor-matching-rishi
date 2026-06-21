export type UserAccountType = 'founder' | 'investor';

export interface FounderOnboardingData {
  role?: string[];
  sector?: string[];
  stage?: string[];
  region?: string[];
  teamSize?: string[];
  year?: string[]; // Kept as string[] to match SelectionGroup but usually single
  model?: string[];
  targetMarket?: string[];
  fundingHistory?: string[];
  investorType?: string[];
  fundingNeed?: string[];
  description?: string;
  metrics?: string;
  revenue?: string[];
  runway?: string[];
  legal?: string[];
  pitchDeckUri?: string;
}

export interface InvestorOnboardingData {
  fundType?: string[];
  region?: string[];
  stage?: string[];
  ticketSize?: string[];
  frequency?: string[];
  sector?: string[];
  geoFocus?: string[];
  involvement?: string[];
  exit?: string[];
}

export const STORAGE_KEYS = {
  USER_ACCOUNT_TYPE: 'userAccountType',
  FOUNDER_ONBOARDING_DATA: 'founderOnboardingData',
  INVESTOR_ONBOARDING_DATA: 'InvestorOnboardingData', // Case matching user request
  DID_USER_ONBOARD: 'didUserOnboard',
};
