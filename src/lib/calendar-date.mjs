// YAML can parse Keystatic's unquoted YYYY-MM-DD as a UTC Date. Restore
// the calendar string without giving date-only records a publication time.
export function calendarDateValue(value) {
  return value instanceof Date && !Number.isNaN(value.getTime())
    ? value.toISOString().slice(0, 10)
    : value;
}
