/**
 * @file fastingMilestones.ts
 * @description Defines the physiological milestones that occur during fasting.
 * Converted to React Native with IconSymbol integration.
 */

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
      description: 'Your blood sugar levels begin to fall as the body uses recently consumed glucose and starts tapping into stored glycogen.'
    },
    {
      id: 'glycogen_depletion',
      timeHours: 8,
      name: 'Glycogen Depletion Nears',
      iconName: 'heart.fill',
      description: 'Liver glycogen stores significantly deplete, signaling the body to switch to alternative energy sources like fat.'
    },
    {
      id: 'ketosis_starts',
      timeHours: 12,
      name: 'Ketosis Begins',
      iconName: 'flame.fill',
      description: 'Your body starts producing ketone bodies from fat as glycogen stores are nearly exhausted. This marks the metabolic shift to fat as a primary fuel.'
    },
    {
      id: 'fat_burning_increases',
      timeHours: 18,
      name: 'Fat Burning Increases',
      iconName: 'bolt.fill',
      description: 'Fat breakdown (lipolysis) and ketone production ramp up, providing sustained energy and enhancing mental clarity for some.'
    },
    {
      id: 'autophagy_activated',
      timeHours: 24,
      name: 'Autophagy Activated',
      iconName: 'arrow.2.circlepath',
      description: 'Cellular self-cleaning (autophagy) is significantly upregulated, helping remove damaged cells and regenerate newer, healthier ones.'
    },
    {
      id: 'growth_hormone_surges',
      timeHours: 48,
      name: 'Growth Hormone Surges',
      iconName: 'chevron.up',
      description: 'Human Growth Hormone (HGH) levels can increase substantially, supporting muscle preservation, tissue repair, and fat metabolism.'
    },
    {
      id: 'immune_reset',
      timeHours: 72,
      name: 'Immune System Reset',
      iconName: 'shield.fill',
      description: 'Prolonged fasting may trigger the regeneration of immune stem cells, contributing to a renewal of the immune system.'
    },
  ];