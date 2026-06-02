import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ActionButtonsProps {
  onRewind?: () => void;
  onNope: () => void;
  onSuperLike: () => void;
  onLike: () => void;
}

export const ActionButtons = ({ onNope, onSuperLike, onLike }: ActionButtonsProps) => {
  const theme = useThemeColor();

  return (
    <View style={styles.container}>
      {/* Nope (Cross) */}
      <TouchableOpacity 
        style={[styles.button, styles.smallButton, { borderColor: theme.error }]} 
        onPress={onNope}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={30} color={theme.error} />
      </TouchableOpacity>

      {/* Super Like (Star) */}
      <TouchableOpacity 
        style={[styles.button, styles.smallButton, { borderColor: '#3b82f6' }]} // Blue for Super Like usually
        onPress={onSuperLike}
        activeOpacity={0.7}
      >
        <Ionicons name="star" size={24} color="#3b82f6" />
      </TouchableOpacity>

      {/* Like (Heart/Check) */}
      <TouchableOpacity 
        style={[styles.button, styles.smallButton, { borderColor: '#E91E63' }]} 
        onPress={onLike}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={30} color="#E91E63" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  smallButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  largeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  }
});
