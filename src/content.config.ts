import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      category: z.enum(['single-origin', 'daily', 'equipment', 'gift-sets']),
      // Optional because equipment has no origin or weight.
      origin: z.object({ region: z.string(), prefecture: z.string() }).optional(),
      summary: z.string(),
      description: z.string(),
      variants: z
        .array(
          z.object({
            label: z.string(),
            grams: z.number().int().positive().optional(),
            priceCents: z.number().int().positive(),
          }),
        )
        .min(1),
      images: z.array(z.object({ src: image(), alt: z.string().min(1) })).min(1),
      featured: z.boolean().default(false),
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      excerpt: z.string(),
      cover: image(),
      coverAlt: z.string().min(1),
    }),
});

export const collections = { products, journal };
