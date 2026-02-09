import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { Chip } from '@/components/ui/Chip';

interface SelectionGroupProps {
  options: string[];
  selected: string[];
  maxSelect?: number; // 1 for single select
  onSelect: (selected: string[]) => void;
  otherPlaceholder?: string; // Placeholder for "Other" input
  title?: string; // Optional title for the group
}

export const SelectionGroup = ({ options, selected, maxSelect = 1, onSelect, otherPlaceholder = "Please specify...", title }: SelectionGroupProps) => {
  const theme = useThemeColor();
  const isMulti = maxSelect > 1;
  const [otherText, setOtherText] = useState('');

  // Check if "Other" is currently selected (starts with "Other")
  const isOtherSelected = selected.some(s => s.startsWith('Other'));
  
  // Extract existing "Other" text if present on mount
  useEffect(() => {
    const existingOther = selected.find(s => s.startsWith('Other'));
    if (existingOther) {
        // "Other: custom text" -> "custom text"
        const specificText = existingOther.replace('Other: ', '').replace('Other', '');
        setOtherText(specificText);
    }
  }, []);

  const handleSelect = (option: string) => {
    let newSelected = [...selected];

    if (option === 'Other') {
        if (isOtherSelected) {
             // Deselect Other
             newSelected = newSelected.filter(s => !s.startsWith('Other'));
             setOtherText('');
        } else {
             // Select Other
             if (!isMulti) newSelected = ['Other'];
             else newSelected.push('Other');
        }
    } else {
        // Normal Option
        if (newSelected.includes(option)) {
            newSelected = newSelected.filter(s => s !== option);
        } else {
            if (!isMulti) {
                newSelected = [option];
                setOtherText(''); 
            } else {
                if (newSelected.length < maxSelect) {
                    newSelected.push(option);
                }
            }
        }
    }
    
    onSelect(newSelected);
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    let newSelected = selected.filter(s => !s.startsWith('Other'));
    const formatted = text.trim() ? `Other: ${text}` : 'Other';
    
    if (!isMulti) {
        newSelected = [formatted];
    } else {
        if (!newSelected.some(s => s.startsWith('Other'))) {
            newSelected.push(formatted);
        } else {
            newSelected = newSelected.map(s => s.startsWith('Other') ? formatted : s); // This logic is slightly flawed if we just pushed above, but if we filtered it out, we just need to push.
            // Wait, I filtered it out in line 66: let newSelected = selected.filter...
            // So I just need to push it back.
            newSelected.push(formatted);
        }
    }
    onSelect(newSelected);
  };

  return (
    <View style={styles.container}>
      {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
           const isChecked = option === 'Other' 
             ? selected.some(s => s.startsWith('Other'))
             : selected.includes(option);

           return (
            <Chip
                key={option}
                label={option}
                selected={isChecked}
                onPress={() => handleSelect(option)}
            />
           );
        })}
      </View>

      {/* Render Text Input if "Other" is selected */}
      {selected.some(s => s.startsWith('Other')) && (
        <View style={styles.otherInputContainer}>
            <TextInput
                style={[styles.otherInput, { 
                    color: theme.text, 
                    borderColor: theme.gray,
                    backgroundColor: theme.background 
                }]}
                placeholder={otherPlaceholder}
                placeholderTextColor={theme.icon}
                value={otherText}
                onChangeText={handleOtherTextChange}
                autoFocus
            />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  otherInputContainer: {
    marginTop: 12,
    paddingLeft: 4,
  },
  otherInput: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 8,
  }
});
