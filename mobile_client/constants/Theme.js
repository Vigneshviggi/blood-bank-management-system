import { Platform } from 'react-native';

// LifeLink — refreshed visual identity
// Warmer, richer "vital" palette: garnet primary + emerald secondary.
// Same layout system as before — only the surface treatment changes.
export const Colors = {
  primary: '#C81E4A',        // deep garnet red
  primaryDark: '#8F1338',
  primarySoft: '#FDE7ED',
  secondary: '#0F9B8E',      // emerald teal
  secondaryDark: '#0B756B',
  secondarySoft: '#E3F6F3',
  accent: '#2D6CDF',
  success: '#0E9F6E',
  warning: '#DC7609',
  error: '#D92D20',
  info: '#2D6CDF',
  glass: 'rgba(255, 255, 255, 0.82)',
  background: '#FBF7F6',
  backgroundAlt: '#F4EEEC',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF6F2',
  text: '#1D1B20',
  textSecondary: '#6E6771',
  textMuted: '#A79FA8',
  border: '#F0E4E4',
  borderStrong: '#E0D3D3',
};

const ThemePalettes = {
  light: {
    background: '#FBF7F6',
    backgroundAlt: '#F4EEEC',
    surface: '#FFFFFF',
    surfaceSoft: '#FFF6F2',
    text: '#1D1B20',
    textSecondary: '#6E6771',
    textMuted: '#A79FA8',
    border: '#F0E4E4',
    borderStrong: '#E0D3D3',
    glass: 'rgba(255, 255, 255, 0.82)',
    icon: '#6E6771',
    tabIconDefault: '#6E6771',
    tabIconSelected: '#C81E4A',
  },
  dark: {
    background: '#171217',
    backgroundAlt: '#1A1A1B',
    surface: '#1E1E1E',
    surfaceSoft: '#272727',
    text: '#F2EEF0',
    textSecondary: '#A1A1AA',
    textMuted: '#7D7D86',
    border: '#333333',
    borderStrong: '#444444',
    glass: 'rgba(255, 255, 255, 0.08)',
    icon: '#A79FA8',
    tabIconDefault: '#A79FA8',
    tabIconSelected: '#FFFFFF',
  }
};

export const applyThemeMode = (mode = 'light') => {
  const palette = ThemePalettes[mode] || ThemePalettes.light;
  Object.assign(Colors, {
    background: palette.background,
    backgroundAlt: palette.backgroundAlt,
    surface: palette.surface,
    surfaceSoft: palette.surfaceSoft,
    text: palette.text,
    textSecondary: palette.textSecondary,
    textMuted: palette.textMuted,
    border: palette.border,
    borderStrong: palette.borderStrong,
    glass: palette.glass,
  });
};

Colors.light = {
  text: ThemePalettes.light.text,
  background: ThemePalettes.light.background,
  tint: Colors.primary,
  icon: ThemePalettes.light.icon,
  tabIconDefault: ThemePalettes.light.tabIconDefault,
  tabIconSelected: ThemePalettes.light.tabIconSelected,
};

Colors.dark = {
  text: ThemePalettes.dark.text,
  background: ThemePalettes.dark.background,
  tint: Colors.primary,
  icon: ThemePalettes.dark.icon,
  tabIconDefault: ThemePalettes.dark.tabIconDefault,
  tabIconSelected: ThemePalettes.dark.tabIconSelected,
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Radius = {
  sm: 14,
  md: 18,
  lg: 26,
  xl: 34,
  pill: 999,
};

export const Shadows = {
  soft: {
    shadowColor: '#3D1224',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  medium: {
    shadowColor: '#3D1224',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 6,
  },
  strong: {
    shadowColor: '#3D1224',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
  },
  // colored "glow" shadow for primary CTAs
  glow: {
    shadowColor: '#C81E4A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const Typography = Platform.select({
  web: {
    display: "'Poppins', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Poppins', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    display: 'Poppins_700Bold',
    heading: 'Poppins_700Bold',
    body: 'Inter_400Regular',
    mono: 'monospace',
  },
});

export const Fonts = Typography;
