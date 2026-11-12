---
name: OneFit Iron
colors:
  ground: "#0b0908"
  surface: "#1d1916"
  surface-raised: "#2a241f"
  line: "#3a322b"
  ink: "#f3ece4"
  ink-muted: "#b8ada2"
  ink-faint: "#8a7f74"
  accent: "#ff6a1f"
  accent-ink: "#0b0908"
  danger: "#e5484d"
  glass: "rgba(20, 20, 20, 0.70)"
  glass-border: "rgba(255, 255, 255, 0.08)"
typography:
  display: Oswald 600/700, uppercase, +0.4 to +1.6 tracking
  body: platform sans (SF Pro / Roboto), 13-16
  numbers: Oswald, tabular
radius:
  chip: 12
  control: 22-28
  card: 18
  sheet: 28 (0 when full screen)
spacing: 4, 8, 12, 16, 24, 32, 44
---

# Design System: OneFit Iron

## Overview

Dark, warm and physical: a chalk-and-iron gym palette with one hot orange for anything you act on. Screens are deliberately sparse, one task at a time, so the app stays simple even though it tracks everything. Two signatures carry the identity: the **liquid glass** floating panels and the **swipe-to-confirm sheet** that rises with your finger and floods the screen orange.

Source of truth for screens: the OneFit Design canvas (https://claude.ai/artifact/PVCEjWyKi7SqwGjEEtWEJH). Tokens in code: `frontend/constants/Colors.ts`, `frontend/constants/Fonts.ts`; the web app's iron theme in `web/src/index.css` and `web/src/theme/themes.ts`.

## Colors

### Primary
- **Accent `#ff6a1f`**: actions only (the swipe sheet, primary buttons, "sets today", Finish). Text on it is near-black `#0b0908` (7.6:1).

### Neutral
- **Ground `#0b0908`**: every screen's background.
- **Surface `#1d1916`**: list rows, steppers, inputs.
- **Raised `#2a241f`**: pressed states, stepper buttons, borders.
- **Ink `#f3ece4`**, **muted `#b8ada2`** (secondary text, 9:1), **faint `#8a7f74`** (placeholders, the × sign).

### Named Rules
- **One accent.** Orange means "act here". Never use it for decoration or status.
- **The flood.** After a confirmed swipe the whole screen is accent, with near-black ink, until the user moves on.

## Typography

- **Display: Oswald** (600 SemiBold, 700 Bold), uppercase for titles and action labels. Big numbers in Oswald at 76-128 pt, tabular, shrinking with length so weight and reps always fit side by side.
- **Body: platform sans**, 13-16 pt. Secondary lines in ink-muted.

### Hierarchy
1. The number you are about to log (116 pt).
2. Screen title (32-40 pt Oswald).
3. Row titles (16 pt semibold), then secondary lines (13-15 pt muted).

### Named Rules
- **No eyebrows.** No small label above a heading; the heading speaks.

## Layout

Phone first (375 pt wide). 16 pt side gutters (20 on lists). Generous space between groups, tight within them. Content clears the floating sidebar by 80 pt on the left while it is visible. Bottom actions sit above the safe area.

## Elevation & Depth

Depth comes from translucency, not shadows: the glass panels float over content with blur. Cards are flat surfaces on the ground. The swipe sheet is the one thing that moves above everything.

## Shapes

Fully rounded pills for chips and steppers; 18 pt cards; 22-28 pt big controls; the sheet's top corners are 28 pt and square off as it fills the screen.

## Components

### Buttons
Library `Button` (`frontend/components/ui/Button.tsx`). Primary = accent fill, near-black Oswald label. On the accent flood, invert: near-black fill with orange label, or a 2 pt near-black outline.

### Chips
Muscle-group filters: 40 pt pills, outline when idle, ink fill with ground text when selected. Set chips: small surface pills, tabular numbers.

### Cards / Containers
List rows on `surface`, 18 pt radius, 68 pt minimum height, chevron on the right.

### Inputs / Fields
Search: 52 pt pill on `surface`. Big numbers become a bottom-ruled input when tapped, empty, with the current value as placeholder.

### Navigation
Liquid glass: the floating bottom tab bar and the vertical sidebar (`ScrollableTabBar`, `VerticalTabBar`) are translucent, blurred, softly bordered panels. Focus mode (logging) hides the header, sidebar and tab bar.

### Swipe to Confirm (signature)
`frontend/components/ui/SwipeToConfirm.tsx`. Accent sheet rests as a 104 pt bar; follows the finger; content lifts and fades; "Release to log" past 40% with a haptic tick; fills the screen on release or flick; springs back otherwise. Coming back, it lowers into the bar.

## Do's and Don'ts

### Do:
- Show the likely numbers and let people nudge them.
- Keep one primary action per screen, at the bottom, reachable by thumb.
- Give every gesture a tap or accessibility-action equivalent.

### Don't:
- Add a light theme.
- Put orange on anything that is not an action.
- Add labels above headings, nested cards, or decoration that does not carry information.
- Remove the glass panels.
