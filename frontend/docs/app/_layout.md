# `app/_layout.tsx`

## Purpose

The root layout: providers, fonts, the navigation theme and the stack header.

## Public API

Default export `RootLayout` (expo-router root layout). No props.

## How it works

Tree, outside in:

```
GestureHandlerRootView (flex 1)
  ThemeProvider (contexts/ThemeContext, dark only)
    RootLayoutContent: waits for fonts, renders null until loaded
      NavigationProvider (contexts/NavigationContext)
        @react-navigation ThemeProvider (ironNavigationTheme)
          AppStack: <Stack> with "(tabs)" and "+not-found"
          StatusBar style="light"
```

- Fonts: `SpaceMono` (template asset), `Oswald_600SemiBold`, `Oswald_700Bold`
  (see [Fonts](../constants/Fonts.md)).
- `ironNavigationTheme` is React Navigation's `DarkTheme` with `primary`,
  `background`, `card`, `text`, `border` from `Colors.dark`.
- `AppStack` reads `focusMode` from [NavigationContext](../contexts/NavigationContext.md):
  the `(tabs)` screen's header (title "OneFit") is hidden while a set is being
  logged.
- `import 'react-native-reanimated'` initialises Reanimated early.

## Depends on

[ThemeContext](../contexts/ThemeContext.md), [NavigationContext](../contexts/NavigationContext.md),
[Colors](../constants/Colors.md), `expo-font`, `expo-router`, `@expo-google-fonts/oswald`,
`react-native-gesture-handler`.

## Used by

expo-router (root of every route).

## Tests

none.

## Gotchas / TODO

- No `<Toaster />` is mounted, so `toast()` calls (fasting save/discard) never
  show; see [useToast](../hooks/useToast.md).
- `SplashScreen.preventAutoHideAsync` is not used; the app renders nothing
  until fonts load.
- `SpaceMono` is only used by the template Explore screen.
