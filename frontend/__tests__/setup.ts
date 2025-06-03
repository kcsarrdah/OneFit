// __tests__/setup.ts
import '@testing-library/jest-native/extend-expect';

// Mock timer functions globally - this is the key fix
Object.defineProperty(global, 'setInterval', {
  value: jest.fn(() => 12345),
  writable: true
});
Object.defineProperty(global, 'clearInterval', {
  value: jest.fn(),
  writable: true
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => 
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

// Mock React Native
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(config => config.ios),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => 
  require('react-native-reanimated/mock')
);