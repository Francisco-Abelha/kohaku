# Decisions

## The filename is the content slug

**Chose:** no `slug` field in products or journal posts. The filename sets the URL.
**Alternative:** a `slug` field in each file, as in the first draft of the content model.
**Why:** Astro's `glob` loader lets a `slug` field silently replace the entry's id, so keeping both means two values that can disagree.

## Images live in `src/assets/`

**Chose:** images in `src/assets/`, validated with Astro's `image()` schema helper.
**Alternative:** images in `public/images/`, referenced by plain URL strings.
**Why:** Astro can convert and resize the images and record their dimensions, which matters on a photo-heavy site. A wrong path fails the build instead of showing a broken image. The cost is longer relative paths in the content files.

## One site-wide currency: USD

**Chose:** prices are integer cents in USD, with the currency set once for the whole site.
**Alternatives:** a currency field on each product or variant; converting the catalogue to EUR.
**Why:** the store sells in one currency, so a per-product field could only introduce mismatches. USD matches the WordPress site, so migrated prices stay exactly the same.

## The starter kit is one product with a fixed price

**Chose:** the Matcha Starter Kit has one variant at $92.00, the sum of its four items using the 50 g Daily Matcha.
**Alternative:** keep the WooCommerce grouped product, where customers add each item separately.
**Why:** a grouped product has no price of its own, while our schema requires every product to have one. A single price also keeps the cart simple.

## A faithful copy of the WordPress design

**Chose:** replicate shopkohaku.com's layout, copy, fonts and colours. Only the code underneath changes.
**Alternatives:** a copy with small fixes along the way; a redesign.
**Why:** the goal is to remove the WordPress dependency, and an identical design keeps the Lighthouse before-and-after comparison fair.

## Keep the WordPress URLs

**Chose:** the same paths as WordPress, such as `/product/ceremonial-matcha-uji/` and `/product-category/daily/`.
**Alternative:** cleaner new paths like `/shop/daily`, with redirects from the old ones.
**Why:** old links and search results keep working, and launch needs no redirect list for products and categories.

## Size buttons on the product page

**Chose:** one button per size, with the price updating on click.
**Alternative:** the WooCommerce dropdown.
**Why:** with two or three sizes, buttons show every option and its price in one click. This is the one deliberate change from the WordPress design.

## Import the content right after the layout

**Chose:** run the phase 2 import before building the home, shop and product pages.
**Alternative:** build every phase 1 page with two sample products and import afterwards.
**Why:** building against the real content lets us compare each page with the live site as we go.

## Netlify for hosting

**Chose:** Netlify, which builds the site from GitHub and gives each pull request a deploy preview.
**Alternative:** Vercel, as first planned.
**Why:** the site is already connected to Netlify. For a static Astro site both work the same way. Phase 3's checkout functions will use Netlify Functions through Astro's Netlify adapter.

## Self-hosted fonts through Astro's Fonts API

**Chose:** Astro's built-in Fonts API downloads Inter and Cormorant Garamond from Google at build time and serves them from our domain.
**Alternatives:** a Google Fonts `<link>`, as WordPress uses; `@fontsource` npm packages.
**Why:** visitors make no request to Google, which is faster and avoids sending EU visitors' IP addresses to a third party. It adds no dependency. Cormorant Garamond loads only weight 600, as on WordPress, so the text renders the same.
