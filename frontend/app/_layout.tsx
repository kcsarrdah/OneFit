import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Colors } from '@/constants/Colors';

const ironNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.background,
    text: Colors.dark.foreground,
    border: Colors.dark.border,
  },
};

function RootLayoutContent() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationProvider>
    <ThemeProvider value={ironNavigationTheme}>
      <AppStack />
      <StatusBar style="light" />
    </ThemeProvider>
    </NavigationProvider>
  );
}

/** The header steps aside in focus mode (e.g. while logging a set). */
function AppStack() {
  const { focusMode } = useNavigation();
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: !focusMode,
          title: 'OneFit',
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CustomThemeProvider>
        <RootLayoutContent />
      </CustomThemeProvider>
    </GestureHandlerRootView>
  );
}