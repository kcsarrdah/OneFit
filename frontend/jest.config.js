module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/.expo/',
      '<rootDir>/__tests__/setup.ts',
    ],
    collectCoverageFrom: [
      'hooks/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'features/**/*.{ts,tsx}',
      '!**/*.d.ts',
      '!**/node_modules/**',
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
    transformIgnorePatterns: [
      'node_modules/(?!((react-native|@react-native|expo|@expo|react-native-svg|react-native-reanimated|@react-native-async-storage)/.*|react-native-gesture-handler/.*|@react-navigation/.*))',
    ],
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  };