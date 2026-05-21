import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const ACCENTS = [
  { color: '#e8334a', glow: 'rgba(232,51,74,0.3)', label: 'Red' },
  { color: '#f07020', glow: 'rgba(240,112,32,0.3)', label: 'Orange' },
  { color: '#d4a010', glow: 'rgba(212,160,16,0.3)', label: 'Yellow' },
  { color: '#2ea84a', glow: 'rgba(46,168,74,0.3)', label: 'Green' },
  { color: '#0078d4', glow: 'rgba(0,120,212,0.3)', label: 'Blue' },
  { color: '#7c3aed', glow: 'rgba(124,58,237,0.3)', label: 'Purple' },
];

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [accentIndex, setAccentIndex] = useState(4); // default blue

  const accent = ACCENTS[accentIndex];

  const applyTheme = (dark, idx) => {
    const root = document.documentElement;
    const a = ACCENTS[idx];
    root.style.setProperty('--accent', a.color);
    root.style.setProperty('--accent-glow', a.glow);
    document.body.classList.toggle('light', !dark);
  };

  const toggleMode = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next, accentIndex);
  };

  const setAccent = (idx) => {
    setAccentIndex(idx);
    applyTheme(isDark, idx);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleMode, accentIndex, setAccent, ACCENTS, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
