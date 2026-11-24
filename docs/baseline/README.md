# Lighthouse baseline: WordPress before, Astro after

Both sites were measured the same way: [PageSpeed Insights](https://pagespeed.web.dev) (Lighthouse running on Google's servers), mobile preset (simulated slow 4G and a mid-range phone), 3 runs per page, alternating between the sites. The table shows the median run by performance score; the last column lists all three.

- **WordPress:** https://shopkohaku.com (WooCommerce on Hostinger, with LiteSpeed page caching)
- **Astro:** https://kohaku-fgp6.vercel.app (Vercel production, before the domain moved)

The `.json` files are the full median reports. To read one, drop it onto the [Lighthouse viewer](https://googlechrome.github.io/lighthouse/viewer/).

Headless Chrome on a laptop couldn't be used for WordPress: the host's bot protection answers it with 403, which is why both sites went through PageSpeed Insights instead.

Measured 2026-11-19, Lighthouse 13.6.0, mobile preset.

| Page | Site | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Weight | Requests | Perf. runs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| home | WordPress | 92 | 96 | 100 | 92 | 1.7 s | 3.0 s | 0 ms | 0 | 302 KB | 37 | 91/92/92 |
| home | Astro | 100 | 100 | 100 | 91 | 0.9 s | 0.9 s | 0 ms | 0 | 276 KB | 11 | 100/100/100 |
| shop | WordPress | 95 | 96 | 100 | 92 | 1.7 s | 2.7 s | 0 ms | 0 | 243 KB | 39 | 95/95/96 |
| shop | Astro | 99 | 100 | 100 | 91 | 0.9 s | 1.4 s | 0 ms | 0 | 174 KB | 15 | 99/99/100 |
| product | WordPress | 90 | 97 | 100 | 92 | 2.0 s | 3.0 s | 0 ms | 0 | 335 KB | 46 | 87/90/90 |
| product | Astro | 100 | 100 | 100 | 91 | 0.9 s | 1.5 s | 0 ms | 0 | 984 KB | 12 | 100/100/100 |
| journal-post | WordPress | 99 | 96 | 100 | 92 | 1.7 s | 1.7 s | 0 ms | 0 | 211 KB | 32 | 96/99/99 |
| journal-post | Astro | 100 | 100 | 100 | 91 | 0.8 s | 1.7 s | 0 ms | 0 | 190 KB | 9 | 100/100/100 |

FCP: first contentful paint. LCP: largest contentful paint. TBT: total blocking time. CLS: cumulative layout shift.

## Reading the numbers

- **Speed:** the main image appears in 0.9–1.7 s instead of 1.7–3.0 s, and every page needs about a third as many requests (9–15 instead of 32–46), because there are no plugin scripts and stylesheets to load.
- **Accessibility:** WordPress loses points on colour contrast; the rebuild fixed it with a darker stone grey for small text.
- **SEO:** both miss meta descriptions. The rebuild's are added in the next pull request.
- **Weight:** the Astro product page is heavier (984 KB against 335 KB) almost entirely because of one photo: `matcha-powder-background-scaled.jpg` becomes a 677 KB WebP at 1280 px wide, since fine powder texture compresses badly. It still scores 100 (the photo isn't the main image), but it's on the list for the QA pass.

## After the launch (shopkohaku.com, 24 November 2026)

Measured the same way once the domain pointed at Vercel. SEO reaches 100 because the real domain no longer carries the `x-robots-tag: noindex` header Vercel puts on `*.vercel.app` addresses, and the product page is lighter after the QA pass (AVIF photos).

| Page | Performance | Accessibility | Best practices | SEO | LCP | Weight | Requests | Perf. runs |
|---|---|---|---|---|---|---|---|---|
| home | 100 | 100 | 100 | 100 | 0.9 s | 277 KB | 11 | 98/100/100 |
| shop | 99 | 100 | 100 | 100 | 1.5 s | 175 KB | 15 | 99/99/100 |
| product | 100 | 100 | 100 | 100 | 1.4 s | 365 KB | 12 | 100/100/100 |
| journal-post | 100 | 100 | 100 | 100 | 1.7 s | 191 KB | 9 | 100/100/100 |
