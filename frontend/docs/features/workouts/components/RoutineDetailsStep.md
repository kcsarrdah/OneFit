# `features/workouts/components/RoutineDetailsStep.tsx`

## Purpose

Step 1 of "Create custom routine": name, description, estimated minutes,
difficulty and category.

## Public API

- `type RoutineDetails = Omit<NewRoutine, 'exercises'>`.
- `RoutineDetailsStep({ details: RoutineDetails, onChange: (patch: Partial<RoutineDetails>) => void })`.

## How it works

Controlled fields: [Input](../../../components/ui/Input.md) (name, required),
[Textarea](../../../components/ui/Textarea.md) (description),
[NumberInput](../../../components/ui/NumberInput.md) (5..180, step 5), and two
[RadioGroup](../../../components/ui/RadioGroup.md)s over `ROUTINE_DIFFICULTIES`
and `ROUTINE_CATEGORIES`, each item followed by its label.

## Depends on

The UI primitives above, [ThemedText](../../../components/ThemedText.md),
[constants](../constants.md), [types](../types.md), [Colors](../../../constants/Colors.md).

## Used by

[CreateCustomRoutineModal](CreateCustomRoutineModal.md).

## Tests

none.

## Gotchas / TODO

- Typing a duration hits the [NumberInput](../../../components/ui/NumberInput.md)
  clamp-while-typing bug (with `min={5}`, "30" becomes 5 after the first
  digit).
- Radio labels are not pressable and not linked to the radio for screen
  readers.
