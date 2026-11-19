import type { APIRoute } from 'astro';

// Built as /robots.txt. Allows everything and points crawlers at the sitemap, using the address
// from `site` in astro.config.mjs so it follows the domain move.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`);
