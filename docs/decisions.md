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

## Motion with native CSS and small scripts, no animation library

**Chose:** CSS transitions and keyframes for load-in motion, CSS scroll-driven animations (`animation-timeline`) for scroll effects, and small scripts only where behaviour depends on scroll direction. Everything is disabled under `prefers-reduced-motion`.
**Alternatives:** GSAP with ScrollTrigger, Lenis for smooth scrolling, Framer Motion.
**Why:** the effects so far don't need a timeline library, and zero added JavaScript keeps the Lighthouse comparison strong. Browsers without scroll-driven animations (Firefox, for now) simply show the final state. GSAP stays the next step for pinned sections or long choreographed sequences.
**Gotcha:** Astro's CSS minifier folds `animation-timeline` into the `animation` shorthand, which Chrome rejects. Scroll-driven animations must use the `animation-*` longhands.

## Native cross-document page transitions

**Chose:** the browser's View Transitions API for navigations between pages (`@view-transition { navigation: auto; }`), with the clicked product card's photo morphing into the product page's gallery and back.
**Alternative:** Astro's `<ClientRouter />`, which swaps pages in with JavaScript.
**Why:** no added JavaScript, and every page still loads normally, so the existing scripts need no changes. Firefox simply navigates without the animation. `<ClientRouter />` becomes worth it if the phase 3 cart should persist across pages (`transition:persist`).
**Details:** only the clicked card's photo gets the `product-image` name, set on click; arriving back from a product page, a `pagereveal` script tags the matching card. Names are cleared after each transition, because pages restored from the back/forward cache keep them. Only the incoming snapshot is shown during the morph, because both are the same photo cropped differently and a crossfade looks ghosted.

## Product tabs as plain text with **bold**

**Chose:** the extra product tabs (Tasting Notes, How to Prepare, Care) are stored in each product's JSON as text: paragraphs separated by blank lines, with `**bold**` as the only formatting. `src/lib/text.ts` escapes the text and turns it into HTML.
**Alternatives:** store the WordPress HTML and insert it as-is; switch products to Markdown files; add a Markdown library.
**Why:** that's all the formatting the tabs use. Escaping first means content can never inject HTML, and it needs no dependency. If the tabs ever need lists or links, switching to Markdown files is the next step.

## No reviews tab

**Chose:** drop the WooCommerce "Reviews (0)" tab.
**Alternative:** rebuild reviews with a form and storage.
**Why:** there are no reviews, the WordPress form posts to WordPress's comment system, and a concept store has no one to review it.

## Netlify for hosting

**Chose:** Netlify, which builds the site from GitHub and gives each pull request a deploy preview.
**Alternative:** Vercel, as first planned.
**Why:** the site is already connected to Netlify. For a static Astro site both work the same way. Phase 3's checkout functions will use Netlify Functions through Astro's Netlify adapter.

## Self-hosted fonts through Astro's Fonts API

**Chose:** Astro's built-in Fonts API downloads Inter and Cormorant Garamond from Google at build time and serves them from our domain.
**Alternatives:** a Google Fonts `<link>`, as WordPress uses; `@fontsource` npm packages.
**Why:** visitors make no request to Google, which is faster and avoids sending EU visitors' IP addresses to a third party. It adds no dependency. Cormorant Garamond loads only weight 600, as on WordPress, so the text renders the same.

## Shop page as a lookbook with a fixed photo

**Chose:** one list of rich product rows beside a fixed photo that changes as each row crosses the middle of the screen (IntersectionObserver). Phones and no-JavaScript visitors get a photo in every row. Category pages use the same lookbook, with links to the other categories in place of the filter tabs.
**Alternatives:** a hover-photo category index, a pinned horizontal strip and a filterable grid (built, then dropped: the hover photos felt gimmicky and the strip held the scroll hostage); a broken grid; category chapters.
**Why:** it feels editorial without taking control of the scroll. The page always scrolls normally, and the photo only reacts to where you are.

## Deploying to both Netlify and Vercel, for now

**Chose:** connect the repo to Vercel as well as Netlify; each builds every push independently.
**Alternatives:** stay on Netlify only; move to Vercel only.
**Why:** Vercel has a connector to a phone app used to check on the site, and running both gives a side-by-side comparison for the agency. The static site needs no host-specific code, so this costs nothing. Phase 3's checkout functions are built for one host through Astro's adapter, so the choice is made there. Vercel's free plan is non-commercial only, which is fine for Kohaku but not for the client sites.

## Nav hides on scroll down, returns on scroll up

**Chose:** the usual pattern: the bar gets out of the way while you read and comes back when you scroll up. Home starts with it hidden over the hero; other pages start with it visible, sticky under the notice.
**Alternative:** the earlier reverse (revealed by scrolling down, hidden by scrolling up), which was a deliberate experiment.
**Why:** reviewed against Apple's design principles (familiarity, wayfinding): people already expect this from Safari and most sites, and scrolling up is how they look for navigation.

## Product page: photos beside a pinned panel, editorial sections

**Chose:** stacked photos beside a sticky purchase panel (a scroll-snap row on phones), and the WooCommerce tabs replaced by sections: description, a tasting-notes pull-quote, care, details, and "How to prepare" as a full-width matcha-green band with the recipe's amounts set large. Recipes are parsed from the content's bold recipe lines by `src/lib/recipe.ts` (tested), falling back to plain text.
**Alternatives:** a full-bleed hero photo with a slide-up purchase bar; a "museum label" layout; keeping the tabs or an accordion.
**Why:** the old first screen ran out halfway down; tabs hide the most distinctive content (the recipes) behind clicks. The matcha band answers the design review's call for one bold use of the brand colour. Scroll-snap gives phones native swipe momentum with no JavaScript.
