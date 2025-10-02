import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemePreset {
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
  };
}

export const themePresets: ThemePreset[] = [
  {
    name: 'Default Warm',
    colors: {
      background: '#F5E9DA',
      foreground: '#3E3E3E',
      card: '#FFF8F1',
      cardForeground: '#3E3E3E',
      primary: '#80CBC4',
      primaryForeground: '#ffffff',
      secondary: '#8D6E63',
      secondaryForeground: '#ffffff',
      accent: '#FFAB91',
      accentForeground: '#3E3E3E',
      muted: '#F5E9DA',
      mutedForeground: '#8D6E63',
      border: 'rgba(141, 110, 99, 0.2)',
    }
  },
  {
    name: 'Calm Blue',
    colors: {
      background: '#E3F2FD',
      foreground: '#1A237E',
      card: '#F8FDFF',
      cardForeground: '#1A237E',
      primary: '#42A5F5',
      primaryForeground: '#ffffff',
      secondary: '#5C6BC0',
      secondaryForeground: '#ffffff',
      accent: '#FF7043',
      accentForeground: '#ffffff',
      muted: '#E3F2FD',
      mutedForeground: '#5C6BC0',
      border: 'rgba(92, 107, 192, 0.2)',
    }
  },
  {
    name: 'Elegant Neutral',
    colors: {
      background: '#FAFAFA',
      foreground: '#212121',
      card: '#FFFFFF',
      cardForeground: '#212121',
      primary: '#616161',
      primaryForeground: '#ffffff',
      secondary: '#9E9E9E',
      secondaryForeground: '#ffffff',
      accent: '#FF9800',
      accentForeground: '#ffffff',
      muted: '#F5F5F5',
      mutedForeground: '#757575',
      border: 'rgba(158, 158, 158, 0.2)',
    }
  }
];

interface ThemeContextType {
  currentPreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentPreset, setCurrentPreset] = useState<ThemePreset>(themePresets[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const setThemePreset = (preset: ThemePreset) => {
    setCurrentPreset(preset);
    // Apply theme to CSS custom properties
    const root = document.documentElement;
    Object.entries(preset.colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
  };

  useEffect(() => {
    // Apply initial theme
    setThemePreset(currentPreset);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      currentPreset, 
      setThemePreset, 
      showThemeSelector, 
      setShowThemeSelector 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}