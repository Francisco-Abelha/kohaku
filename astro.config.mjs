// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // Pages stay static; only routes marked `prerender = false` (the checkout API) run on Vercel as functions.
  adapter: vercel(),
  env: {
    schema: {
      // Read from .env locally and from Vercel's environment variables when deployed. Server-only:
      // importing it in browser code fails the build, so the key can't leak into the page.
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', startsWith: 'sk_test_' }),
    },
  },
  // WordPress URLs end in a slash (/about/), and we keep them identical.
  trailingSlash: 'always',
  // Downloaded at build time and served from our own domain, so visitors never request Google's servers.
  fonts: [
    {
      provider: fontProviders.google(),
      // Body text: a refined grotesk, clearly distinct from the Cormorant display serif.
      name: 'Instrument Sans',
      cssVariable: '--font-instrument',
      weights: [400, 500, 600],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Cormorant Garamond',
      cssVariable: '--font-cormorant',
      // Only 600, like the WordPress site: the wordmark and taglines render it at other weights.
      weights: [600],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
});
