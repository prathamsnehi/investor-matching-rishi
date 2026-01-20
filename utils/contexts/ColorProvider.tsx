import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type ThemeColors = typeof Colors.light;

const ColorContext = createContext<ThemeColors>(Colors.light);

export const ColorProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ColorContext.Provider value={theme}>
      {children}
    </ColorContext.Provider>
  );
};

export const useThemeColor = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useThemeColor must be used within a ColorProvider');
  }
  return context;
};
