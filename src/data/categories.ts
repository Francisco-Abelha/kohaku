import type { CollectionEntry } from 'astro:content';

export type Category = CollectionEntry<'products'>['data']['category'];

// Typed as Record<Category, …> so TypeScript flags a category missing from the schema.
export const categoryNames: Record<Category, string> = {
  'single-origin': 'Single origin',
  daily: 'Daily',
  equipment: 'Equipment',
  'gift-sets': 'Gift sets',
};

// Copied from the WordPress category descriptions.
export const categoryDescriptions: Record<Category, string> = {
  'single-origin':
    'Four gardens across Uji, Nishio and Yame, each harvest kept separate rather than blended to a house style. First-harvest leaf only, stone-milled slowly and shipped within weeks. The tea changes from one year to the next — that is the point of buying it this way.',
  daily:
    'Everyday matcha built for volume rather than contemplation. More forward and more forgiving than the ceremonial grades, and happy in milk, over ice, or whisked quickly on a weekday morning.',
  equipment:
    'The four pieces that actually change the cup: a bamboo chasen, a bowl wide enough to whisk in, a scoop for measuring and a sifter for the clumps. Bought once, kept for years if looked after.',
  'gift-sets':
    'Everything needed to start, in one box. Chosen so nothing has to be replaced immediately — the whisk, bowl and scoop are the same ones we use ourselves.',
};

export const categoryLinks = Object.entries(categoryNames).map(([slug, name]) => ({
  name,
  href: `/product-category/${slug}/`,
}));
