# Kohaku: project context for Claude Code

## What this project is

Kohaku is a concept matcha brand I designed. The current site, https://shopkohaku.com, runs on WordPress and WooCommerce. This repo rebuilds it as a custom **Astro + TypeScript** site, deployed on **Vercel**.

It is a portfolio project. The goal is a faster site that I understand completely and can explain in an interview. It is also practice before I migrate two real business sites the same way.

**Kohaku is not a real business.** It must never take real payments. Checkout uses Stripe in **test mode** only, and the site shows a visible "concept store, no real orders" notice.

## About me and how to work with me

- I'm a student at 42 (Lisbon). I'm comfortable with C and Python, and new to JavaScript, TypeScript and Astro.
- **Teach, don't just do.** Before writing a non-trivial file, explain the approach in a few sentences. Afterwards, point out the one or two concepts in it I should understand.
- Let me write some of the code myself. When something is a good learning exercise (a component, a type, a loop over content), suggest I try it first, then review what I wrote.
- Keep changes small. One concept or feature at a time.
- If I ask for something that's a bad idea, say so and explain why.
- Don't add dependencies without telling me what they do and why we need them.

## Stack

- **Astro**: static pages, with islands only where interactivity is needed (the cart)
- **TypeScript**: strict mode
- **Content collections**: products as JSON, journal posts as Markdown, validated with schemas in `src/content.config.ts` (or wherever the current Astro version expects it; check the docs)
- **Plain CSS** with custom properties for the brand's colours and type. No CSS framework unless we decide otherwise.
- **Stripe Checkout** (test mode), with a webhook endpoint (phase 3)
- **Vercel**: hosting, preview deployments, serverless functions
- **Python 3**: `scripts/export_wordpress.py` for migrating content

## Phases

1. **Static site**: layout, header and footer, home, shop, category pages, product pages with variants, about, contact. Content comes from files.
2. **Content migration**: Python script exports products and journal posts from WordPress into `src/content/`, then the journal pages.
3. **Cart and checkout**: client-side cart island, then Stripe Checkout (test mode) and the webhook.
4. **Launch**: newsletter and contact forms, SEO metadata, redirects from old WordPress URLs, Lighthouse comparison, then move the domain to Vercel.

Order change (2026-11-10): the phase 2 content import runs right after the phase 1 layout, so pages are built against real content. The rebuild is a faithful copy of the WordPress design, with the same URLs.

Each phase is its own branch and pull request into `main`. Don't commit directly to `main`.

## Content model (draft, refine with me)

Products, one JSON file each in `src/content/products/`:

```json
{
  "name": "Ceremonial Matcha — Uji",
  "category": "single-origin",
  "origin": { "region": "Uji", "prefecture": "Kyoto" },
  "summary": "One-line description for cards.",
  "description": "Full description for the product page.",
  "variants": [
    { "label": "30 g", "grams": 30, "priceCents": 4200 },
    { "label": "100 g", "grams": 100, "priceCents": 9800 }
  ],
  "images": [{ "src": "../../assets/products/uji.jpg", "alt": "Kohaku Uji matcha pouch" }],
  "featured": true
}
```

- Categories: `single-origin`, `daily`, `equipment`, `gift-sets`
- Prices are stored in cents, as integers, to avoid floating-point errors. The whole site uses one currency, USD, matching the WordPress site.
- `origin` and a variant's `grams` are optional, because equipment has neither.
- The filename is the URL slug, so there is no `slug` field: `ceremonial-matcha-uji.json` becomes `/product/ceremonial-matcha-uji`.
- Images live in `src/assets/` and are referenced by a path relative to the content file, so Astro can optimise them and the build fails on a wrong path.
- Journal posts are Markdown files in `src/content/journal/`, with frontmatter: `title`, `date`, `excerpt`, `cover`, `coverAlt`.

## Migration script rules

- Only read from the live WordPress site, using GET requests to the public REST API. Never write to it, log into it or change it.
- Step 1 saves the raw API responses unchanged in `raw/` (gitignored). Step 2 converts them into the content model above.
- Download images separately into `src/assets/`, and keep a list of where each image came from so I can check credits and licences.
- The Matcha Starter Kit is a WooCommerce grouped product with no price of its own. Export it as one variant at `9200` cents.
- The script must be safe to re-run.

## Safety rules

- Never commit `.env`, API keys or Stripe secrets. Check `.gitignore` before the first commit that involves secrets.
- Stripe keys must be **test** keys (`sk_test_…`). Refuse to use live keys.
- Never deploy to production or change DNS without asking me first.
- Don't delete files or rewrite git history without asking.

## Documentation habits

- Write commit messages that say what changed and why.
- Each PR description covers what changed, why, how to test it, and a screenshot if it's visual.
- Add an entry to `docs/decisions.md` whenever we make a real technical choice: what we chose, the alternatives, and why.
- Keep `README.md` up to date as features land. It already has placeholders for the before-and-after numbers.
- The Lighthouse baseline for the WordPress site goes in `docs/baseline/`.

## Brand notes

- Tagline: "Matcha, considered."
- Calm, minimal and editorial: lots of white space, large photography, restrained typography.
- Copy is short and plain. Match the tone of the existing site when writing placeholder text.
