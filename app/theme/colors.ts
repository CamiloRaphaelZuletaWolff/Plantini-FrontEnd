export const palette = {
  light: {
    background: '#FFFBEF',
    surface: '#ffffff',
    text: '#0f172a',
    subtitle: '#475569',
    primary: '#217868',
    muted: '#94a3b8',
    border: '#e2e8f0',
    tabBarBackground: '#ffffff',
    drawerBackground: '#ffffff',
    switchTrackOn: '#217868',
    switchTrackOff: '#94a3b8',
    switchThumb: '#f8fafc',
  },
  dark: {
    background: '#1C1D31', 
    surface: '#1e293b',
    text: '#e2e8f0',
    subtitle: '#cbd5f5',
    primary: '#616D9F', 
    muted: '#475569',
    border: '#334155',
    tabBarBackground: '#1e293b',
    drawerBackground: '#1C1D31',
    switchTrackOn: '#616D9F',
    switchTrackOff: '#475569',
    switchThumb: '#1e293b',
  },
} as const;

export type Theme = keyof typeof palette;
export type ThemeColors = (typeof palette)[Theme];