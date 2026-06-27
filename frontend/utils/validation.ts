import { Alert } from 'react-native';

export const validateMandatoryFields = (data: any, fields: string[]) => {
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return { isValid: false, pendingField: field };
    }
  }
  return { isValid: true, pendingField: null };
};

export const showValidationError = (missingField: string) => {
    // Format field name: 'teamSize' -> 'Team Size'
    const formatted = missingField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    Alert.alert("Missing Information", `Please provide your ${formatted}.`);
};

/** Simple email shape check (backend validates strictly with email-validator). */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/** Accepts http(s) URLs only; used for the optional LinkedIn field. */
export const isValidUrl = (url: string): boolean => {
  return /^https?:\/\/.+/i.test(url.trim());
};

/**
 * Parses a user-entered rupee amount ("₹50,00,000", "50 L", "2 cr") into a
 * plain number, or null if it can't be interpreted. Supports lakh/crore suffixes.
 */
export const parseRupeeAmount = (input: string): number | null => {
  if (!input) return null;
  const cleaned = input.toLowerCase().replace(/[₹,\s]/g, '');
  const match = cleaned.match(/^([0-9]*\.?[0-9]+)(l|lakh|lakhs|cr|crore|crores)?$/);
  if (!match) return null;

  const base = parseFloat(match[1]);
  if (Number.isNaN(base)) return null;

  const suffix = match[2];
  if (suffix?.startsWith('l')) return base * 100_000;
  if (suffix?.startsWith('cr')) return base * 10_000_000;
  return base;
};

export const showError = (message: string) => {
  Alert.alert('Something went wrong', message);
};
