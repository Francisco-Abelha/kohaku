import type { CollectionEntry } from 'astro:content';

type Category = CollectionEntry<'products'>['data']['category'];

// Typed as Record<Category, …> so TypeScript flags a category missing from the schema.
export const categoryNames: Record<Category, string> = {
  'single-origin': 'Single Origin',
  daily: 'Daily',
  equipment: 'Equipment',
  'gift-sets': 'Gift Sets',
};

export const categoryLinks = Object.entries(categoryNames).map(([slug, name]) => ({
  name,
  href: `/product-category/${slug}/`,
}));
