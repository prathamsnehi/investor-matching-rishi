import mmkvStorage from "@/utils/storage/mmkvStorage";
import { STORAGE_KEYS, FounderOnboardingData, InvestorOnboardingData, UserAccountType } from "./types";

// User Onboarding Status
export const getUserOnboardingStatus = function () {
    return mmkvStorage.getBoolean(STORAGE_KEYS.DID_USER_ONBOARD) || false;
}

export const setUserOnboardingStatus = function () {
    mmkvStorage.set(STORAGE_KEYS.DID_USER_ONBOARD, true);
}

// User Account Type
export const setUserAccountType = (type: UserAccountType) => {
    mmkvStorage.set(STORAGE_KEYS.USER_ACCOUNT_TYPE, type);
};

export const getUserAccountType = (): UserAccountType | undefined => {
    const type = mmkvStorage.getString(STORAGE_KEYS.USER_ACCOUNT_TYPE);
    return type as UserAccountType | undefined;
};

// Founder Data
export const getInternalFounderData = (): FounderOnboardingData => {
    const json = mmkvStorage.getString(STORAGE_KEYS.FOUNDER_ONBOARDING_DATA);
    if (!json) return {};
    try {
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to parse founder data", e);
        return {};
    }
};

export const setInternalFounderData = (data: Partial<FounderOnboardingData>) => {
    const current = getInternalFounderData();
    const updated = { ...current, ...data };
    mmkvStorage.set(STORAGE_KEYS.FOUNDER_ONBOARDING_DATA, JSON.stringify(updated));
};

// Investor Data
export const getInternalInvestorData = (): InvestorOnboardingData => {
    const json = mmkvStorage.getString(STORAGE_KEYS.INVESTOR_ONBOARDING_DATA);
    if (!json) return {};
    try {
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to parse investor data", e);
        return {};
    }
};

export const setInternalInvestorData = (data: Partial<InvestorOnboardingData>) => {
    const current = getInternalInvestorData();
    const updated = { ...current, ...data };
    mmkvStorage.set(STORAGE_KEYS.INVESTOR_ONBOARDING_DATA, JSON.stringify(updated));
};