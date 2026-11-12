# `components/ui/Textarea.tsx`

## Purpose

The shared multi-line text field.

## Public API

`Textarea` (forwardRef to `TextInput`): `TextInputProps` except `style`, plus
`containerStyle?`, `inputStyle?`, `error?`, `rows?: number = 4`.

## How it works

Same look as [Input](Input.md), `multiline`, `textAlignVertical="top"`,
`minHeight = max(80, rows x 20)`.

## Depends on

[useThemeColor](../../hooks/useThemeColor.md).

## Used by

[RoutineDetailsStep](../../features/workouts/components/RoutineDetailsStep.md) (description).

## Tests

none.

## Gotchas / TODO

[FastCompleteDialog](../../features/fasting/components/FastCompleteDialog.md)
builds its own notes `TextInput` instead of using this.
