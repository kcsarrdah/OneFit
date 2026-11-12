# `components/HapticTab.tsx`

## Purpose

Expo template: a bottom-tab button that gives a light haptic on iOS.

## Public API

`HapticTab(props: BottomTabBarButtonProps)`.

## How it works

Wraps `PlatformPressable`; `onPressIn` fires `Haptics.impactAsync(Light)` when
`process.env.EXPO_OS === 'ios'`, then the caller's `onPressIn`.

## Depends on

`@react-navigation/bottom-tabs`, `@react-navigation/elements`, `expo-haptics`.

## Used by

Nothing. The custom [ScrollableTabBar](ui/ScrollableTabBar.md) does its own
haptics.

## Tests

none.

## Gotchas / TODO

Dead code; safe to delete.
