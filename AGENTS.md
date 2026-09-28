# Project Rules

## Date and time handling

- Treat every date/time value returned by the API as UTC and convert it to the user's local timezone before displaying it.
- Treat date/time values entered or selected in the UI as local time and convert them to UTC before sending API requests.
- Use the shared `utcToLocal` and `localToUtc` helpers from `app/utils/dateTime.ts`; do not duplicate Moment timezone conversion logic in components.
- Call `.format(...)` after conversion to preserve the date/time format required by the relevant API or UI.
- Preserve the date/time format required by each API endpoint after timezone conversion.
