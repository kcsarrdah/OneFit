# `hooks/useThemeColor.ts`

## Purpose

Expo template helper: one colour token for the current scheme, with optional
per-scheme overrides.

## Public API

`useThemeColor(props: { light?: string; dark?: string }, colorName: keyof Colors.light & keyof Colors.dark): string`.

## How it works

`props[scheme]` if given, else `Colors[scheme][colorName]`. With iron that is
always `Colors.dark[colorName]` on native.

## Depends on

[Colors](../constants/Colors.md), [useColorScheme](useColorScheme.md).

## Used by

[ThemedText](../components/ThemedText.md), [ThemedView](../components/ThemedView.md),
[Dialog](../components/ui/Dialog.md), [Input](../components/ui/Input.md),
[Textarea](../components/ui/Textarea.md), [NumberInput](../components/ui/NumberInput.md),
[RadioGroup](../components/ui/RadioGroup.md), [Checkbox](../components/ui/Checkbox.md),
[Label](../components/ui/Label.md), [TabBarBackground](../components/ui/TabBarBackground.md).

## Tests

none.

## Gotchas / TODO

none.
