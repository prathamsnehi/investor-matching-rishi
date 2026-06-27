import React from "react";
import { View, Text, StyleSheet, TextInput, TextInputProps } from "react-native";
import { useThemeColor } from "@/utils/contexts/ColorProvider";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  multiline?: boolean;
}

export const TextField = ({
  label,
  value,
  onChangeText,
  helperText,
  multiline = false,
  ...rest
}: TextFieldProps) => {
  const theme = useThemeColor();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholderTextColor={theme.icon}
        style={[
          styles.input,
          multiline && styles.multiline,
          { color: theme.text, borderColor: theme.gray, backgroundColor: theme.background },
        ]}
        {...rest}
      />
      {helperText && <Text style={[styles.helper, { color: theme.icon }]}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  helper: {
    fontSize: 13,
    marginTop: 6,
  },
});
