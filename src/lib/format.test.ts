// Run with: npm test (Node's built-in test runner, no extra dependencies)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate, formatPrice, priceRange } from './format.ts';

test('formats dates like WordPress, in UTC', () => {
  assert.equal(formatDate(new Date('2026-08-02T19:17:36Z')), 'August 2, 2026');
});

test('formats cents as dollars', () => {
  assert.equal(formatPrice(4200), '$42.00');
  assert.equal(formatPrice(9805), '$98.05');
});

test('shows a range only when prices differ', () => {
  assert.equal(priceRange([{ priceCents: 8200 }, { priceCents: 3600 }, { priceCents: 4800 }]), '$36.00 – $82.00');
  assert.equal(priceRange([{ priceCents: 3200 }]), '$32.00');
});
