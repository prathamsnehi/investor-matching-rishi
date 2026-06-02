import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const Chip = ({ label, selected, onPress }: ChipProps) => {
  const theme = useThemeColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          borderColor: selected ? theme.primary : theme.gray,
          backgroundColor: selected ? theme.secondary : 'transparent',
          borderWidth: 1.5,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? theme.primary : theme.text,
            fontWeight: '500',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
  },
});
