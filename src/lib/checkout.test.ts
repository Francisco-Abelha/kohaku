import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toLineItems } from './checkout.ts';

const products = [
  { id: 'uji', data: { name: 'Uji', variants: [{ label: '30 g', priceCents: 4200 }, { label: '100 g', priceCents: 9800 }] } },
  { id: 'scoop', data: { name: 'Scoop', variants: [{ label: 'Standard', priceCents: 1400 }] } },
];

test('prices and names come from the product files, not the request', () => {
  const cart = [
    { id: 'uji', size: '100 g', qty: 2, priceCents: 1 },
    { id: 'scoop', size: 'Standard', qty: 1 },
  ];
  assert.deepEqual(toLineItems(cart, products), [
    { quantity: 2, price_data: { currency: 'usd', unit_amount: 9800, product_data: { name: 'Uji (100 g)' } } },
    { quantity: 1, price_data: { currency: 'usd', unit_amount: 1400, product_data: { name: 'Scoop' } } },
  ]);
});

test('rejects unknown products, sizes, odd quantities and non-arrays', () => {
  for (const cart of [
    [{ id: 'nope', size: '30 g', qty: 1 }],
    [{ id: 'uji', size: '5 kg', qty: 1 }],
    [{ id: 'uji', size: '30 g', qty: 0 }],
    [{ id: 'uji', size: '30 g', qty: 1.5 }],
    [{ id: 'uji', size: '30 g', qty: 11 }],
    [null],
    [],
    'uji',
  ]) {
    assert.equal(toLineItems(cart, products), null, JSON.stringify(cart));
  }
});
