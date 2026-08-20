import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('alpha_cut_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeSideEffects = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('alpha_cut_theme', theme);
  const faviconEl = document.getElementById('app-favicon');
  if (faviconEl) {
    faviconEl.setAttribute('href', theme === 'dark' ? '/favicon-dark.png' : '/favicon-light.png');
  }
};

const initialTheme = getInitialTheme();
applyThemeSideEffects(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light';
      applyThemeSideEffects(nextTheme);
      return { theme: nextTheme };
    }),
  setTheme: (newTheme) => {
    applyThemeSideEffects(newTheme);
    set({ theme: newTheme });
  },
}));
