/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Based on a comprehensive design system with semantic color naming.
 */

const tintColorLight = '#66a3a3'; // Your accent color
const tintColorDark = '#66a3a3'; // Same accent for consistency

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

export const Colors = {
  light: {
    // Original Expo colors (keeping for compatibility)
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Your design system colors (converted from HSL to hex)
    foreground: '#0a0a0b',           // 222.2 84% 4.9%
    card: '#ffffff',                  // 0 0% 100%
    cardForeground: '#0a0a0b',       // 222.2 84% 4.9%
    popover: '#ffffff',              // 0 0% 100%
    popoverForeground: '#0a0a0b',    // 222.2 84% 4.9%
    primary: '#1c1c20',              // 222.2 47.4% 11.2%
    primaryForeground: '#f8fafc',    // 210 40% 98%
    secondary: '#f1f5f9',            // 210 40% 96.1%
    secondaryForeground: '#1c1c20',  // 222.2 47.4% 11.2%
    muted: '#f1f5f9',                // 210 40% 96.1%
    mutedForeground: '#6b7280',      // 215.4 16.3% 46.9%
    accent: '#66a3a3',               // 174 45% 56%
    accentGradientEnd: '#7ab3b3',    // 174 50% 65%
    accentForeground: '#ffffff',     // 0 0% 100%
    destructive: '#ef4444',          // 0 84.2% 60.2%
    destructiveForeground: '#fef2f2', // 0 0% 98%
    border: '#e2e8f0',               // 214.3 31.8% 91.4%
    input: '#e2e8f0',                // 214.3 31.8% 91.4%
    ring: '#66a3a3',                 // 174 45% 56%
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Chart colors
    chart1: '#f97316',               // 12 76% 61%
    chart2: '#0891b2',               // 173 58% 39%
    chart3: '#1e40af',               // 197 37% 24%
    chart4: '#eab308',               // 43 74% 66%
    chart5: '#ea580c',               // 27 87% 67%

    // Water colors
    waterPrimary: WaterColors.primary,
    waterSecondary: WaterColors.secondary,
    waterLight: WaterColors.light,
    waterSurface: WaterColors.surface,
    waterDrop: WaterColors.drop,
  },
  dark: {
    // Original Expo colors (keeping for compatibility)
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // Your design system colors (dark mode)
    foreground: '#fafafa',           // 0 0% 98%
    card: '#1a1b1e',                 // 220 13% 10%
    cardForeground: '#fafafa',       // 0 0% 98%
    popover: '#1a1b1e',              // 220 13% 10%
    popoverForeground: '#fafafa',    // 0 0% 98%
    primary: '#fafafa',              // 0 0% 98%
    primaryForeground: '#1c1c20',    // 222.2 47.4% 11.2%
    secondary: '#262626',            // 217.2 32.6% 17.5%
    secondaryForeground: '#fafafa',  // 0 0% 98%
    muted: '#262626',                // 217.2 32.6% 17.5%
    mutedForeground: '#a1a1aa',      // 215 20.2% 65.1%
    accent: '#66a3a3',               // 174 45% 56% (same for consistency)
    accentGradientEnd: '#7ab3b3',    // 174 50% 65%
    accentForeground: '#1a1b1e',     // Dark text on accent for better contrast
    destructive: '#7f1d1d',          // 0 62.8% 30.6%
    destructiveForeground: '#fafafa', // 0 0% 98%
    border: '#262626',               // 217.2 32.6% 17.5%
    input: '#262626',                // 217.2 32.6% 17.5%
    ring: '#66a3a3',                 // 174 45% 56%
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Chart colors (dark mode variants)
    chart1: '#3b82f6',               // 220 70% 50%
    chart2: '#06b6d4',               // 160 60% 45%
    chart3: '#f59e0b',               // 30 80% 55%
    chart4: '#8b5cf6',               // 280 65% 60%
    chart5: '#f43f5e',               // 340 75% 55%

    waterPrimary: WaterColors.primary,
    waterSecondary: WaterColors.secondary, 
    waterLight: WaterColors.light,
    waterSurface: WaterColors.surface,
    waterDrop: WaterColors.drop,
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