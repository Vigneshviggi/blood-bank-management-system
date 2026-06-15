export const Colors = {
  primary: '#E53935', // Healthcare Red
  secondary: '#FFCDD2', // Soft Red
  accent: '#1976D2', // Hospital Blue
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  error: '#B00020',
  success: '#43A047',
  warning: '#FB8C00',
  glass: 'rgba(255, 255, 255, 0.8)',
  import { Platform } from 'react-native';

  export const Colors = {
    primary: '#D92D20',
    primaryDark: '#B42318',
    accent: '#175CD3',
    surface: '#FFFFFF',
    surfaceSoft: '#FFF7F7',
    background: '#F7F8FA',
    backgroundAlt: '#F2F4F7',
    text: '#101828',
    textSecondary: '#667085',
    textMuted: '#98A2B3',
    border: '#EAECF0',
    borderStrong: '#D0D5DD',
    success: '#039855',
    warning: '#DC6803',
    error: '#D92D20',
    info: '#2E90FA',
    glass: 'rgba(255, 255, 255, 0.78)',
  };

  Colors.light = {
    text: Colors.text,
    background: Colors.background,
    tint: Colors.primary,
    icon: Colors.textSecondary,
    tabIconDefault: Colors.textSecondary,
    tabIconSelected: Colors.primary,
  };

  Colors.dark = {
    text: '#ECEDEE',
    background: '#101828',
    tint: Colors.primary,
    icon: '#98A2B3',
    tabIconDefault: '#98A2B3',
    tabIconSelected: '#FFFFFF',
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
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
  };

  export const Shadows = {
    soft: {
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
    medium: {
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 7,
    },
    strong: {
      shadowColor: '#101828',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.16,
      shadowRadius: 30,
      elevation: 10,
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
