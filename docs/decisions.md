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
