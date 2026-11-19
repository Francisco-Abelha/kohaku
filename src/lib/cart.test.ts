import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addLine, itemCount, MAX_QTY, setQty } from './cart.ts';

test('adding the same size twice raises its quantity; another size gets its own line', () => {
  let lines = addLine([], 'uji', '30 g');
  lines = addLine(lines, 'uji', '30 g');
  lines = addLine(lines, 'uji', '100 g');
  assert.deepEqual(lines, [
    { id: 'uji', size: '30 g', qty: 2 },
    { id: 'uji', size: '100 g', qty: 1 },
  ]);
  assert.equal(itemCount(lines), 3);
});

test('quantity is capped, and zero removes the line', () => {
  const lines = [{ id: 'uji', size: '30 g', qty: 1 }];
  assert.equal(setQty(lines, 'uji', '30 g', 99)[0].qty, MAX_QTY);
  assert.deepEqual(setQty(lines, 'uji', '30 g', 0), []);
});
