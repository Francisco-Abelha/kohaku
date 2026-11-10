// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // WordPress URLs end in a slash (/about/), and we keep them identical.
  trailingSlash: 'always',
  // Downloaded at build time and served from our own domain, so visitors never request Google's servers.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 500, 600, 700],
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
