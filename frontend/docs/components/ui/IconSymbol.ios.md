# `components/ui/IconSymbol.ios.tsx`

## Purpose

The iOS build of [IconSymbol](IconSymbol.md): native SF Symbols.

## Public API

`IconSymbol({ name: SymbolViewProps['name'], size?: number = 24, color: string, style?: StyleProp<ViewStyle>, weight?: SymbolWeight = 'regular' })`.

## How it works

Metro picks `.ios.tsx` on iOS. Renders `expo-symbols` `SymbolView` at
`size x size` with `tintColor`.

## Depends on

`expo-symbols`.

## Used by

Same callers as [IconSymbol](IconSymbol.md), on iOS.

## Tests

none.

## Gotchas / TODO

TypeScript resolves `IconSymbol.tsx`, so names are checked against the
Material `MAPPING`, not all SF Symbols. Text-only styles (e.g. the
`textShadow*` the tab bars pass) do nothing on a `SymbolView`.
