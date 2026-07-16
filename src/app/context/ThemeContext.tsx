import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Theme {
  bg: string;
  card: string;
  profileCard: string;
  text: string;
  muted: string;
  border: string;
  shadow: (color?: string) => string;
  accent: string;
  isDark: boolean;
}

const light: Theme = {
  bg: '#F9F8F3',
  card: '#FFFFFF',
  profileCard: '#13101C',
  text: '#13101C',
  muted: '#666666',
  border: '#13101C',
  shadow: (color = '#13101C') => `4px 4px 0 ${color}`,
  accent: '#C62828',
  isDark: false,
};

const dark: Theme = {
  bg: '#13101C',
  card: '#1d1929',
  profileCard: '#241f35',
  text: '#F9F8F3',
  muted: 'rgba(249,248,243,0.45)',
  border: 'rgba(249,248,243,0.15)',
  shadow: (color = '#C62828') => `4px 4px 0 ${color === '#13101C' ? 'rgba(198,40,40,0.45)' : color}`,
  accent: '#C62828',
  isDark: true,
};

interface Ctx {
  theme: Theme;
  toggle: () => void;
}

const ThemeCtx = createContext<Ctx>({ theme: light, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeCtx.Provider value={{ theme: isDark ? dark : light, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
