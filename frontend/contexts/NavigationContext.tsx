import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

// Navigation Types
export type NavigationMode = 'home' | 'fasting' | 'water' | 'workouts' | 'habits' | 'nutrition' | 'explore';

export interface SidebarOption {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string | number;
}

export interface NavigationConfig {
  mode: NavigationMode;
  title: string;
  icon: string;
  globalOptions: SidebarOption[];
  modeSpecificOptions: SidebarOption[];
}

interface NavigationContextType {
  currentMode: NavigationMode;
  currentSidebarOption: string | null;
  navigationConfig: NavigationConfig[];
  setCurrentMode: (mode: NavigationMode) => void;
  setCurrentSidebarOption: (optionId: string | null) => void;
  getCurrentConfig: () => NavigationConfig | undefined;
  getSidebarOptions: () => SidebarOption[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Common/Global Options (appear across all modes)
const GLOBAL_OPTIONS: SidebarOption[] = [
  { id: 'analytics', label: 'Analytics', icon: 'chart.bar.fill', route: '/analytics' },
  { id: 'settings', label: 'Settings', icon: 'gearshape.fill', route: '/settings' },
];

// Navigation Configuration
const NAVIGATION_CONFIG: NavigationConfig[] = [
  {
    mode: 'home',
    title: 'Dashboard',
    icon: 'house.fill',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'overview', label: 'Overview', icon: 'rectangle.grid.1x2.fill', route: '/home' },
      { id: 'goals', label: 'Goals', icon: 'target', route: '/home/goals' },
      { id: 'streaks', label: 'Streaks', icon: 'flame.fill', route: '/home/streaks' },
    ]
  },
  {
    mode: 'fasting',
    title: 'Fasting',
    icon: 'bolt.fill',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'timer', label: 'Timer', icon: 'timer', route: '/fasting' },
      { id: 'schedules', label: 'Schedules', icon: 'calendar', route: '/fasting/schedules' },
      { id: 'progress', label: 'Progress', icon: 'chart.line.uptrend.xyaxis', route: '/fasting/progress' },
      { id: 'tips', label: 'Tips', icon: 'lightbulb.fill', route: '/fasting/tips' },
    ]
  },
  {
    mode: 'water',
    title: 'Water',
    icon: 'drop.fill',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'tracker', label: 'Tracker', icon: 'plus.circle.fill', route: '/water' },
      { id: 'goals', label: 'Goals', icon: 'target', route: '/water/goals' },
      { id: 'reminders', label: 'Reminders', icon: 'bell.fill', route: '/water/reminders' },
    ]
  },
  {
    mode: 'workouts',
    title: 'Workouts',
    icon: 'figure.run',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'workout', label: 'Workout', icon: 'timer', route: '/workouts' },
      { id: 'routines', label: 'Routines', icon: 'list.bullet', route: '/workouts/routines' },
      { id: 'exercises', label: 'Exercises', icon: 'dumbbell.fill', route: '/workouts/exercises' },
      { id: 'workout-history', label: 'History', icon: 'clock.fill', route: '/workouts/history' },
    ]
  },
  {
    mode: 'habits',
    title: 'Habits',
    icon: 'heart.fill',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'dashboard', label: 'Dashboard', icon: 'square.grid.2x2.fill', route: '/habits' },
      { id: 'new-habit', label: 'New Habit', icon: 'plus.circle.fill', route: '/habits/new' },
      { id: 'categories', label: 'Categories', icon: 'folder.fill', route: '/habits/categories' },
    ]
  },
  {
    mode: 'nutrition',
    title: 'Nutrition',
    icon: 'fork.knife',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'log', label: 'Food Log', icon: 'book.fill', route: '/nutrition' },
      { id: 'search', label: 'Search Foods', icon: 'magnifyingglass', route: '/nutrition/search' },
      { id: 'recipes', label: 'Recipes', icon: 'list.bullet.rectangle', route: '/nutrition/recipes' },
      { id: 'macros', label: 'Macros', icon: 'chart.pie.fill', route: '/nutrition/macros' },
    ]
  },
  {
    mode: 'explore',
    title: 'Explore',
    icon: 'paperplane.fill',
    globalOptions: GLOBAL_OPTIONS,
    modeSpecificOptions: [
      { id: 'discover', label: 'Discover', icon: 'star.fill', route: '/explore' },
      { id: 'community', label: 'Community', icon: 'person.3.fill', route: '/explore/community' },
      { id: 'challenges', label: 'Challenges', icon: 'flag.fill', route: '/explore/challenges' },
    ]
  },
];

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentMode, setCurrentModeState] = useState<NavigationMode>('home');
  const [currentSidebarOption, setCurrentSidebarOption] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Auto-detect current mode from route segments
  useEffect(() => {
    if (segments.length > 0) {
      const firstSegment = segments[0];
      const modeFromRoute = NAVIGATION_CONFIG.find(config => 
        config.mode === firstSegment || 
        (firstSegment === '(tabs)' && segments[1] && config.mode === segments[1])
      );
      
      if (modeFromRoute) {
        setCurrentModeState(modeFromRoute.mode);
      }
    }
  }, [segments]);

  const setCurrentMode = (mode: NavigationMode) => {
    setCurrentModeState(mode);
    setCurrentSidebarOption(null); // Reset sidebar selection when mode changes
  };

  const getCurrentConfig = () => {
    return NAVIGATION_CONFIG.find(config => config.mode === currentMode);
  };

  const getSidebarOptions = (): SidebarOption[] => {
    const config = getCurrentConfig();
    if (!config) return [];
    
    return [
      ...config.modeSpecificOptions,
      { id: 'separator', label: '', icon: '', route: '' }, // Visual separator
      ...config.globalOptions,
    ];
  };

  return (
    <NavigationContext.Provider
      value={{
        currentMode,
        currentSidebarOption,
        navigationConfig: NAVIGATION_CONFIG,
        setCurrentMode,
        setCurrentSidebarOption,
        getCurrentConfig,
        getSidebarOptions,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}