import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDateValue } from '../src/lib/calendar-date.mjs';

test('Keystatic YAML dates remain calendar dates whether quoted or parsed as Date', () => {
  assert.equal(calendarDateValue('2026-08-09'), '2026-08-09');
  assert.equal(calendarDateValue(new Date('2026-08-09T00:00:00.000Z')), '2026-08-09');
  assert.equal(calendarDateValue(undefined), undefined);
  const invalid = new Date('invalid');
  assert.equal(calendarDateValue(invalid), invalid);
});
