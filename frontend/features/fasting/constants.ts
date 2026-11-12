/**
 * @file constants.ts
 * @description Fasting schedules (16:8 and friends) and the physiological
 * milestones along a fast.
 */

export interface FastingSchedule {
  id: string;
  name: string;
  durationHours: number; // 0 for custom
  iconName: string; // Name of the icon in our IconSymbol component
  description: string;
}

export const FASTING_SCHEDULES: FastingSchedule[] = [
  { id: '16:8', name: '16:8', durationHours: 16, iconName: 'clock.3', description: 'Fast for 16 hours, eat within 8 hours.' },
  { id: '18:6', name: '18:6', durationHours: 18, iconName: 'clock.6', description: 'Fast for 18 hours, eat within 6 hours.' },
  { id: '20:4', name: '20:4', durationHours: 20, iconName: 'clock.9', description: 'Fast for 20 hours, eat within 4 hours.' },
  { id: 'custom', name: 'Custom', durationHours: 0, iconName: 'pencil', description: 'Set your own fasting duration.' },
];

export interface FastingMilestone {
  id: string;
  timeHours: number;
  name: string;
  iconName: string;
  description: string;
}

export const FASTING_MILESTONES: FastingMilestone[] = [
  {
    id: 'blood_sugar_drop',
    timeHours: 4,
    name: 'Blood Sugar Drops',
    iconName: 'chevron.down',
    description: 'Your blood sugar levels begin to fall as the body uses recently consumed glucose and starts tapping into stored glycogen.',
  },
  {
    id: 'glycogen_depletion',
    timeHours: 8,
    name: 'Glycogen Depletion Nears',
    iconName: 'heart.fill',
    description: 'Liver glycogen stores significantly deplete, signaling the body to switch to alternative energy sources like fat.',
  },
  {
    id: 'ketosis_starts',
    timeHours: 12,
    name: 'Ketosis Begins',
    iconName: 'flame.fill',
    description: 'Your body starts producing ketone bodies from fat as glycogen stores are nearly exhausted. This marks the metabolic shift to fat as a primary fuel.',
  },
  {
    id: 'fat_burning_increases',
    timeHours: 18,
    name: 'Fat Burning Increases',
    iconName: 'bolt.fill',
    description: 'Fat breakdown (lipolysis) and ketone production ramp up, providing sustained energy and enhancing mental clarity for some.',
  },
  {
    id: 'autophagy_activated',
    timeHours: 24,
    name: 'Autophagy Activated',
    iconName: 'arrow.2.circlepath',
    description: 'Cellular self-cleaning (autophagy) is significantly upregulated, helping remove damaged cells and regenerate newer, healthier ones.',
  },
  {
    id: 'growth_hormone_surges',
    timeHours: 48,
    name: 'Growth Hormone Surges',
    iconName: 'chevron.up',
    description: 'Human Growth Hormone (HGH) levels can increase substantially, supporting muscle preservation, tissue repair, and fat metabolism.',
  },
  {
    id: 'immune_reset',
    timeHours: 72,
    name: 'Immune System Reset',
    iconName: 'shield.fill',
    description: 'Prolonged fasting may trigger the regeneration of immune stem cells, contributing to a renewal of the immune system.',
  },
];
