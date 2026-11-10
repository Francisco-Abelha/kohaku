#!/usr/bin/env python3
"""Export Kohaku's products and journal posts from the public WordPress REST API.

Step 1 (fetch) saves the raw API responses, unchanged, in raw/.
Step 2 (convert) turns raw/ into src/content/ files and downloads the images.

Only GET requests to public endpoints. Safe to re-run.

  python3 scripts/export_wordpress.py --site https://shopkohaku.com --out src/content
  python3 scripts/export_wordpress.py --skip-fetch    # convert again from raw/
"""
import argparse
import html
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'raw'
ASSETS = ROOT / 'src' / 'assets'
SOURCES = ROOT / 'docs' / 'image-sources.md'
USER_AGENT = 'kohaku-migration-script'

# Not in the API: the prefecture of each origin region.
PREFECTURES = {'Uji': 'Kyoto', 'Nishio': 'Aichi', 'Yame': 'Fukuoka'}
# Grouped products have no price of their own (docs/decisions.md).
GROUPED_PRICES = {'matcha-starter-kit': 9200}
# The products under "Where to start" on the WordPress home page.
FEATURED = {'ceremonial-matcha-nishio', 'ceremonial-matcha-uji', 'daily-matcha', 'premium-matcha-yame'}
# Images whose alt text is empty in WordPress.
ALT_FALLBACKS = {
    'matcha-bowl-scaled.jpg': 'Whisked matcha in a pale green spouted bowl, seen from above',
    'matcha-lifestyle3-scaled.jpg': 'A bamboo whisk in a dark bowl, a spoon of matcha powder and an iced matcha latte',
}


# ---- Step 1: fetch ---------------------------------------------------------

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read(), response.headers


def fetch_collection(url, name):
    """Save every page of a paginated collection as raw/<name>-<page>.json."""
    for old in RAW.glob(f'{name}-*.json'):
        old.unlink()
    page = 1
    while True:
        body, headers = get(f'{url}?per_page=100&page={page}')
        (RAW / f'{name}-{page}.json').write_bytes(body)
        if page >= int(headers.get('X-WP-TotalPages', 1)):
            return
        page += 1


def fetch_item(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(get(url)[0])


def fetch(site):
    api = f'{site}/wp-json'
    RAW.mkdir(exist_ok=True)
    fetch_collection(f'{api}/wc/store/v1/products', 'products')
    for product in load_collection('products'):
        for variation in product['variations']:
            fetch_item(f"{api}/wc/store/v1/products/{variation['id']}", RAW / 'variations' / f"{variation['id']}.json")
    fetch_collection(f'{api}/wp/v2/posts', 'posts')
    for post in load_collection('posts'):
        if post['featured_media']:
            fetch_item(f"{api}/wp/v2/media/{post['featured_media']}", RAW / 'media' / f"{post['featured_media']}.json")
    # The custom tabs (Tasting Notes, How to Prepare, Care) come from the child theme and
    # are not in the REST API, so we save the public product pages too.
    for product in load_collection('products'):
        fetch_item(f"{site}/product/{product['slug']}/", RAW / 'product-pages' / f"{product['slug']}.html")
    # Not converted: kept as the reference for building the About, Contact and policy pages.
    fetch_collection(f'{api}/wp/v2/pages', 'pages')


# ---- Step 2: convert -------------------------------------------------------

def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def load_collection(name):
    pages = sorted(RAW.glob(f'{name}-*.json'), key=lambda f: int(f.stem.rsplit('-', 1)[1]))
    return [item for page in pages for item in load(page)]


def text(fragment):
    """Strip tags, decode entities and collapse whitespace."""
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', '', fragment)).split())


def blocks(fragment, tags):
    """Return (tag, inner HTML) for each block, and fail if any text sits outside one."""
    pattern = rf'<({tags})\b[^>]*>(.*?)</\1>'
    leftover = text(re.sub(pattern, '', fragment, flags=re.S))
    if leftover:
        raise ValueError(f'unconverted HTML near: {leftover[:80]!r}')
    return re.findall(pattern, fragment, re.S)


def paragraphs(fragment):
    """Plain text of each <p>, separated by blank lines."""
    return '\n\n'.join(text(body) for _, body in blocks(fragment, 'p'))


def markdown(fragment):
    """Convert post HTML to Markdown. The posts only use <h2>, <p> and <strong>."""
    fragment = re.sub(r'</?(?:strong|b)(?:\s[^>]*)?>', '**', fragment)
    return '\n\n'.join(('## ' if tag == 'h2' else '') + text(body) for tag, body in blocks(fragment, 'h2|p')) + '\n'


def custom_tabs(page):
    """Read the child theme's tabs from a product page as [{title, body}], body in **bold** Markdown."""
    if 'woocommerce-tabs' not in page:
        raise ValueError('not a product page (maybe a bot check?)')
    titles = dict(re.findall(r'class="(kohaku_\w+)_tab"[^>]*>\s*<a[^>]*>(.*?)</a>', page, re.S))
    tabs = []
    for key, body in re.findall(r'id="tab-(kohaku_\w+)"[^>]*>(.*?)</div>', page, re.S):
        body = re.sub(r'<h2\b[^>]*>.*?</h2>', '', body, count=1, flags=re.S)  # repeats the tab title
        tabs.append({'title': text(titles[key]), 'body': markdown(body).strip()})
    return tabs


def parse_grams(size):
    match = re.fullmatch(r'\s*(\d+)\s*g\s*', size, re.I)
    if not match:
        raise ValueError(f'unknown size {size!r}')
    return int(match.group(1))


def price_cents(prices):
    if prices['currency_code'] != 'USD' or prices['currency_minor_unit'] != 2:
        raise ValueError(f'unexpected currency {prices["currency_code"]}')
    return int(prices['price'])


def variants(product, variations):
    kind, slug = product['type'], product['slug']
    if kind == 'grouped':
        return [{'label': 'Standard', 'priceCents': GROUPED_PRICES[slug]}]
    if kind == 'simple':
        return [{'label': 'Standard', 'priceCents': price_cents(product['prices'])}]
    if kind != 'variable':
        raise ValueError(f'{slug}: unsupported product type {kind!r}')
    result = []
    for variation in product['variations']:
        size = next(a['value'] for a in variation['attributes'] if a['name'] == 'Size')
        grams = parse_grams(size)
        price = price_cents(variations[variation['id']]['prices'])
        result.append({'label': f'{grams} g', 'grams': grams, 'priceCents': price})
    return sorted(result, key=lambda v: v['grams'])


class Images:
    """Downloads images once and remembers where each came from."""

    def __init__(self, site):
        self.site = site
        self.sources = {}

    def add(self, url, folder, alt):
        if not url.startswith(self.site + '/'):
            raise ValueError(f'image from another site: {url}')
        name = url.split('?')[0].rsplit('/', 1)[1]
        local = f'src/assets/{folder}/{name}'
        if self.sources.get(local, url) != url:
            raise ValueError(f'two different images are both called {name}')
        dest = ROOT / local
        if not dest.exists():
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(get(url)[0])
        self.sources[local] = url
        alt = text(alt) or ALT_FALLBACKS.get(name)
        if not alt:
            raise ValueError(f'{name} has no alt text: add one to ALT_FALLBACKS')
        return f'../../assets/{folder}/{name}', alt

    def write_sources(self):
        """Regenerate docs/image-sources.md, keeping any licences already filled in."""
        old = {}
        if SOURCES.exists():
            for m in re.finditer(r'^\| `([^`]+)` \| \S+ \| (.*) \|$', SOURCES.read_text(encoding='utf-8'), re.M):
                old[m.group(1)] = m.group(2)
        rows = [f'| `{f}` | {u} | {old.get(f, "To check")} |' for f, u in sorted(self.sources.items())]
        SOURCES.write_text(
            '# Image sources\n\n'
            'Where each image came from, so credits and licences can be checked. '
            'Generated by `scripts/export_wordpress.py`; re-running it keeps the Licence column.\n\n'
            '| File | Source | Licence |\n|---|---|---|\n' + '\n'.join(rows) + '\n',
            encoding='utf-8',
        )


def convert_product(product, variations, page, images):
    slug = product['slug']
    categories = [c['slug'] for c in product['categories']]
    if len(categories) != 1:
        raise ValueError(f'{slug}: expected one category, got {categories}')
    attributes = {a['name']: [t['name'] for t in a['terms']] for a in product['attributes']}

    result = {'name': text(product['name']), 'category': categories[0]}
    if 'Origin' in attributes:
        region = attributes['Origin'][0]
        result['origin'] = {'region': region, 'prefecture': PREFECTURES[region]}
    if 'Grade' in attributes:
        result['grade'] = attributes['Grade'][0]
    result['summary'] = paragraphs(product['short_description'])
    result['description'] = paragraphs(product['description'])
    tabs = custom_tabs(page)
    if tabs:
        result['tabs'] = tabs
    result['variants'] = variants(product, variations)
    result['images'] = []
    for image in product['images']:
        src, alt = images.add(image['src'], 'products', image['alt'])
        result['images'].append({'src': src, 'alt': alt})
    if slug in FEATURED:
        result['featured'] = True
    return result


def convert_post(post, media, images):
    if not post['featured_media']:
        raise ValueError(f"{post['slug']}: no featured image, but posts need a cover")
    cover = media[post['featured_media']]
    src, alt = images.add(cover['source_url'], 'journal', cover['alt_text'])
    frontmatter = {
        'title': text(post['title']['rendered']),
        # Full UTC timestamp: all three posts share a date, so the time decides their order.
        'date': post['date_gmt'] + 'Z',
        'excerpt': paragraphs(post['excerpt']['rendered']),
        'cover': src,
        'coverAlt': alt,
    }
    # JSON strings are valid YAML, and json.dumps handles quotes and colons safely.
    lines = [f'{key}: {json.dumps(value, ensure_ascii=False)}' for key, value in frontmatter.items()]
    return '---\n' + '\n'.join(lines) + '\n---\n\n' + markdown(post['content']['rendered'])


def convert(site, out):
    images = Images(site)
    variations = {int(f.stem): load(f) for f in (RAW / 'variations').glob('*.json')}
    products = load_collection('products')
    (out / 'products').mkdir(parents=True, exist_ok=True)
    for product in products:
        page = (RAW / 'product-pages' / f"{product['slug']}.html").read_text(encoding='utf-8')
        data = convert_product(product, variations, page, images)
        path = out / 'products' / f"{product['slug']}.json"
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    media = {int(f.stem): load(f) for f in (RAW / 'media').glob('*.json')}
    posts = load_collection('posts')
    (out / 'journal').mkdir(parents=True, exist_ok=True)
    for post in posts:
        (out / 'journal' / f"{post['slug']}.md").write_text(convert_post(post, media, images), encoding='utf-8')

    images.write_sources()
    print(f'{len(products)} products, {len(posts)} posts, {len(images.sources)} images')


def main():
    parser = argparse.ArgumentParser(description='Export Kohaku content from WordPress.')
    parser.add_argument('--site', default='https://shopkohaku.com')
    parser.add_argument('--out', type=Path, default=ROOT / 'src' / 'content')
    parser.add_argument('--skip-fetch', action='store_true', help='skip step 1 and convert what is already in raw/')
    args = parser.parse_args()
    site = args.site.rstrip('/')
    if not args.skip_fetch:
        fetch(site)
    convert(site, args.out)


if __name__ == '__main__':
    main()
