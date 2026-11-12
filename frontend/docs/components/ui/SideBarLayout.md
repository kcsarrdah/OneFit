# `components/ui/SideBarLayout.tsx`

## Purpose

Wraps the tab navigator so the [VerticalTabBar](VerticalTabBar.md) sidebar
floats over every tab.

## Public API

`SidebarLayout({ children: ReactNode, sidebarWidth?: number = 280 })`.

## How it works

A full-size row with the iron background: `VerticalTabBar` (absolutely
positioned, so it takes no width) and a `flex: 1` content view holding
`children`.

## Depends on

[VerticalTabBar](VerticalTabBar.md), [Colors](../../constants/Colors.md),
[useColorScheme](../../hooks/useColorScheme.md).

## Used by

[app/(tabs)/_layout](../../app/(tabs)/_layout.md).

## Tests

none.

## Gotchas / TODO

- The file is `SideBarLayout.tsx` but the export is `SidebarLayout`.
- `sidebarWidth` is accepted and ignored; content is not inset for the
  sidebar.
- Lint: unused `Platform` import.
