# Product

OneFit: an all-in-one fitness tracker (workouts, meals, fasting, water, recovery) that makes logging feel effortless.

Facts below come from the owner's own statements during development (Nov 2026). Items marked *(inferred)* are reasonable readings not yet confirmed.

## Platform

adaptive

The main product is the Expo / React Native app (`frontend/`, iOS and Android, also runs on web). `web/` is a separate React web app, today the Muscle Explorer.

## Stack

- App: Expo 53, React Native 0.79, expo-router, Reanimated, Gesture Handler, AsyncStorage (local data for now).
- Web: React 19, TypeScript, Vite, Tailwind v4, three.js via @react-three/fiber.
- Backend: Go + Gin, SQLite, Firebase auth. Workout, fasting, water, template, exercise and anatomy APIs exist; the app does not call them yet.
- AI parsing of meals (photo/voice to portions) is planned with the Claude API.

## Users

The owner first: trains at the gym about 3 days a week and plays soccer about 2 days, wears a Whoop, and finds today's trackers tedious. Broader audience: regular gym-goers who want to log without it feeling like a chore *(inferred)*.

## Product Purpose

Track everything (lifts, meals, fasting, water, sport, recovery) with as little input as possible, so people keep logging. Logging should take a gesture, not a form.

## Positioning

Fitness tracking with the input speed of a trading app: confirm with a swipe, Robinhood style, instead of filling forms.

## Operating Context

In the gym between sets: sweaty hands, short attention, phone held in one hand, glanced at from a distance. Also on the go for meals. Often dim or mixed lighting.

## Capabilities and Constraints

- No guessing or auto-planned workouts: the schedule varies (gym and soccer days), so the app remembers each exercise's own last numbers instead of predicting.
- No smartwatch or gadget integrations. Whoop data (recovery, strain, sport sessions) is welcome.
- Meals without weighing: portions in everyday units (fists, palms, scoops), estimated from a photo or a sentence.
- Data is local on the device until the backend is wired up.

## Brand Commitments

- Dark only. Never a light mode.
- Gym feel: motivating, physical, confident; not clinical.
- The translucent "liquid glass" floating panels stay.
- No skulls or bony anatomical heads in visuals (a mannequin head instead).

## Evidence on Hand

- Muscle Explorer web app with a 3D body (BodyParts3D, CC BY 4.0).
- The OneFit Design canvas: https://claude.ai/artifact/PVCEjWyKi7SqwGjEEtWEJH

## Product Principles

1. Simplicity over completeness on any one screen: one task, one primary action.
2. Confirm, don't enter: show the likely numbers, let the user nudge and swipe.
3. Every exercise remembers itself; there is no plan to edit.
4. Physical, smooth interactions: things follow the finger and settle with springs.
5. UI quality is the top priority.

## Accessibility & Inclusion

Touch targets at least 44 pt; text contrast at least 4.5:1 on the dark ground and on the orange; every gesture has a button or accessibility-action equivalent; Reduce Motion keeps direct manipulation but drops decorative movement.
