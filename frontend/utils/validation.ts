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
