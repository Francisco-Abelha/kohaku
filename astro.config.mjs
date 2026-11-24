// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // The public address, used for canonical links, link previews and the sitemap.
  site: 'https://shopkohaku.com',
  integrations: [
    // Lists every built page in /sitemap-index.xml, except the thank-you page.
    sitemap({ filter: (page) => !page.includes('/checkout/') }),
  ],
  // Pages stay static; only routes marked `prerender = false` (the checkout API) run on Vercel as functions.
  adapter: vercel(),
  env: {
    schema: {
      // Read from .env locally and from Vercel's environment variables when deployed. Server-only:
      // importing it in browser code fails the build, so the key can't leak into the page.
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', startsWith: 'sk_test_' }),
      // Signs Stripe's webhook calls (src/pages/api/stripe-webhook.ts). Optional so checkout
      // still works before the webhook is registered; the webhook answers 500 without it.
      STRIPE_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', startsWith: 'whsec_', optional: true }),
    },
  },
  // WordPress URLs end in a slash (/about/), and we keep them identical.
  trailingSlash: 'always',
  // WordPress addresses with no page here (from its wp-sitemap.xml and its standard feeds and
  // archives), sent somewhere sensible with a permanent redirect so old links and search results work.
  redirects: {
    '/cart/': '/shop/', // the cart is a drawer now
    '/checkout/': '/shop/',
    '/my-account/': '/', // no customer accounts
    '/category/uncategorized/': '/journal/',
    '/2026/': '/journal/', // year archive
    '/author/kohaku/': '/about/',
    '/feed/': '/journal/', // RSS feeds
    '/comments/feed/': '/journal/',
    '/journal/feed/': '/journal/',
    '/product/[slug]/feed': '/product/[slug]', // per-page comment feeds
    '/[slug]/feed': '/[slug]',
    '/wp-sitemap.xml': '/sitemap-index.xml',
    '/sitemap.xml': '/sitemap-index.xml',
  },
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
