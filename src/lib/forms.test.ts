import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validate } from './forms.ts';

test('a complete contact form passes; spaces alone count as empty', () => {
  assert.deepEqual(validate('contact', { name: 'Ana', email: 'ana@example.com', message: 'Hello' }), {});
  assert.deepEqual(Object.keys(validate('contact', { name: '  ', email: 'ana@example.com', message: '\n' })), ['name', 'message']);
});

test('email must look like an address; the newsletter only needs the email', () => {
  for (const email of ['ana', 'ana@example', 'ana @example.com', 42]) {
    assert.ok(validate('newsletter', { email }).email, String(email));
  }
  assert.deepEqual(validate('newsletter', { email: 'ana@example.com' }), {});
});

test('overlong fields are refused', () => {
  const errors = validate('contact', { name: 'a'.repeat(101), email: 'ana@example.com', message: 'a'.repeat(5001) });
  assert.deepEqual(Object.keys(errors), ['name', 'message']);
});
