import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

interface Option {
  label: string;
  value: string;
}

interface SelectionGroupProps {
  title: string;
  options: Option[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}

export const SelectionGroup = ({
  title,
  options,
  selectedValues,
  onSelect,
  multiSelect = false,
}: SelectionGroupProps) => {
  const theme = useThemeColor();

  const handlePress = (value: string) => {
    onSelect(value);
  };

  const isSelected = (value: string) => {
    return selectedValues.includes(value);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={isSelected(option.value)}
            onPress={() => handlePress(option.value)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
