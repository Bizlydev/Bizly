import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { setAppIcon } from 'expo-dynamic-app-icon';
import { darkColors, lightColors, ThemeColors } from '../constants/theme';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: darkColors,
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'light' ? 'light' : 'dark');

  const colors = mode === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    try {
      // Android uses the default dark icon and switches to the light alias when needed.
      setAppIcon(mode === 'light' ? 'light' : null);
    } catch {
      // Dynamic launcher icons require a native build; Expo Go is not supported.
    }
  }, [mode]);

  function toggleTheme() {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}