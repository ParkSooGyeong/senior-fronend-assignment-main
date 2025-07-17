import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        updateThemeClass(theme);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const updateThemeClass = (theme: Theme) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && mediaQuery.matches);

  document.documentElement.classList.toggle('dark', isDark);
};

mediaQuery.addEventListener('change', () => {
  const { theme } = useThemeStore.getState();
  if (theme === 'system') {
    updateThemeClass('system');
  }
});

const initializeTheme = () => {
  const { theme } = useThemeStore.getState();
  updateThemeClass(theme);
};

initializeTheme(); 