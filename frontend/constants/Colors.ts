import { Platform } from 'react-native';

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Based on a comprehensive design system with semantic color naming.
 */

// Iron: the app is dark only. Warm near-blacks, chalk-white text and one
// hot orange for actions, matching the OneFit web app's default theme.
const ironAccent = '#ff6a1f';
export const WaterColors = {
  // Core water colors (same in light and dark)
  primary: '#1E88E5',      // Main water blue
  secondary: '#42A5F5',    // Medium water blue  
  light: '#64B5F6',        // Light water blue
  surface: '#90CAF9',      // Water surface
  drop: '#0D47A1',         // Water droplet
  
  // Progress states (same in both modes)
  empty: '#E0E0E0',        // Empty/no water
  low: '#FF9800',          // Warning orange
  medium: '#2196F3',       // Progress blue
  high: '#1976D2',         // Good blue
  full: '#0D47A1',         // Complete deep blue
};

const iron = {
  // Original Expo keys (kept for compatibility)
  text: '#f3ece4',
  background: '#0b0908',
  tint: ironAccent,
  icon: '#b8ada2',
  tabIconDefault: '#8a7f74',
  tabIconSelected: ironAccent,

  // Design system tokens
  foreground: '#f3ece4',
  card: '#1d1916',
  cardForeground: '#f3ece4',
  popover: '#1d1916',
  popoverForeground: '#f3ece4',
  primary: '#f3ece4',
  primaryForeground: '#0b0908',
  secondary: '#2a241f',
  secondaryForeground: '#f3ece4',
  muted: '#2a241f',
  mutedForeground: '#b8ada2',
  accent: ironAccent,
  accentGradientEnd: '#ff8a4a',
  accentForeground: '#0b0908',
  destructive: '#e5484d',
  destructiveForeground: '#fff7f5',
  border: '#2a241f',
  input: '#3a322b',
  ring: ironAccent,
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Chart colors
  chart1: ironAccent,
  chart2: '#ffc23d',
  chart3: '#5fb4ff',
  chart4: '#c8ff2e',
  chart5: '#e5484d',

  waterPrimary: WaterColors.primary,
  waterSecondary: WaterColors.secondary,
  waterLight: WaterColors.light,
  waterSurface: WaterColors.surface,
  waterDrop: WaterColors.drop,
};

/** Both schemes resolve to Iron, so screens that still ask for 'light' stay dark. */
export const Colors = { light: iron, dark: iron };

export const GlassmorphismColors = {
  light: {
    background: 'rgba(255, 255, 255, 0.70)',
    overlay: 'rgba(0, 0, 0, 0.02)',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.25)',
    iconActive: '#1A1A1A',
    iconInactive: '#2A2A2A',
    iconMuted: '#404040',
  },
  dark: {
    background: 'rgba(20, 20, 20, 0.70)',
    overlay: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    shadow: 'rgba(0, 0, 0, 0.30)',
    iconActive: '#FFFFFF',
    iconInactive: '#E0E0E0',
    iconMuted: '#C0C0C0',
  },
};

// Shared glass effect configuration
export const GlassEffectConfig = {
  borderRadius: {
    vertical: Platform.OS === 'android' ? 30 : 22.5,
    horizontal: Platform.OS === 'android' ? 35 : 27.5,
  },
  shadow: {
    elevation: Platform.OS === 'android' ? 12 : 0,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  dimensions: {
    vertical: {
      width: Platform.OS === 'android' ? 60 : 55,
      /** Left padding that keeps screen content clear of the floating sidebar. */
      contentInset: Platform.OS === 'android' ? 84 : 80,
      tabHeight: Platform.OS === 'android' ? 80 : 70,
    },
    horizontal: {
      height: Platform.OS === 'android' ? 70 : 55,
      margin: 40,
    },
  },
};


export const getWaterProgressColor = (percentage: number, colorScheme: 'light' | 'dark') => {
  // Use the same colors regardless of theme
  if (percentage >= 100) return WaterColors.full;
  if (percentage >= 75) return WaterColors.high;
  if (percentage >= 50) return WaterColors.medium;
  if (percentage >= 25) return WaterColors.low;
  return WaterColors.empty;
};