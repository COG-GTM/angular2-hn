import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';

interface SettingsStore extends Settings {
  darkColorSchemeMedia: MediaQueryList | null;
  setShowSettings: (show: boolean) => void;
  toggleSettings: () => void;
  toggleOpenLinksInNewTab: () => void;
  setTheme: (theme: Settings['theme']) => void;
  setFont: (fontSize: string) => void;
  setSpacing: (listSpace: string) => void;
  initTheme: () => void;
  handleSystemPreferredColorSchemeChange: (event: MediaQueryListEvent) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
      darkColorSchemeMedia: null,

      setShowSettings: (show) => set({ showSettings: show }),
      
      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
      
      toggleOpenLinksInNewTab: () => set((state) => ({ 
        openLinkInNewTab: !state.openLinkInNewTab 
      })),
      
      setTheme: (theme) => set({ theme }),
      
      setFont: (fontSize) => set({ titleFontSize: fontSize }),
      
      setSpacing: (listSpace) => set({ listSpacing: listSpace }),
      
      initTheme: () => {
        const darkColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        set({ darkColorSchemeMedia });
        
        const savedTheme = localStorage.getItem('react-hn-settings');
        if (!savedTheme) {
          const theme = darkColorSchemeMedia.matches ? 'night' : 'default';
          set({ theme });
        }
        
        darkColorSchemeMedia.addEventListener('change', get().handleSystemPreferredColorSchemeChange);
      },
      
      handleSystemPreferredColorSchemeChange: (event) => {
        const theme = event.matches ? 'night' : 'default';
        set({ theme });
      }
    }),
    {
      name: 'react-hn-settings',
      partialize: (state) => ({
        openLinkInNewTab: state.openLinkInNewTab,
        theme: state.theme,
        titleFontSize: state.titleFontSize,
        listSpacing: state.listSpacing,
      }),
    }
  )
);
