import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leadSentences, parseRecipes } from './recipe.ts';

test('reads a recipe line and its steps', () => {
  assert.deepEqual(parseRecipes('**2g matcha · 60ml water · 70°C**\n\nSift it.\n\nWhisk it.'), [
    {
      title: undefined,
      items: [
        { amount: '2 g', label: 'matcha' },
        { amount: '60 ml', label: 'water' },
        { amount: '70 °C', label: 'temperature' },
      ],
      steps: ['Sift it.', 'Whisk it.'],
    },
  ]);
});

test('reads several named recipes, with default labels', () => {
  const recipes = parseRecipes('**Usucha — 2g · 100ml water · 80°C**\n\nDrink.\n\n**Latte — 3g · 40ml water · 200ml milk**\n\nPour.');
  assert.equal(recipes.length, 2);
  assert.equal(recipes[0].title, 'Usucha');
  assert.deepEqual(recipes[1].items, [
    { amount: '3 g', label: 'powder' },
    { amount: '40 ml', label: 'water' },
    { amount: '200 ml', label: 'milk' },
  ]);
  assert.deepEqual(recipes[1].steps, ['Pour.']);
});

test('falls back to [] for text that is not a recipe', () => {
  assert.deepEqual(parseRecipes('Just some advice.\n\n**Bold aside**'), []);
  assert.deepEqual(parseRecipes('**Never use soap, and never leave it standing in water.**\n\nRinse.'), []);
});

test('takes whole sentences for the pull-quote', () => {
  const { lead, rest } = leadSentences('Dense and slow. The first impression is savoury rather than sweet, a broth-like depth. Then more.\n\nSecond paragraph.', 40);
  assert.equal(lead, 'Dense and slow. The first impression is savoury rather than sweet, a broth-like depth.');
  assert.equal(rest, 'Then more.\n\nSecond paragraph.');
});
