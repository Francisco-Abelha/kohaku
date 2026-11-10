const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

/** "$36.00 – $82.00" for several prices, "$32.00" for one, like WooCommerce. */
export function priceRange(variants: { priceCents: number }[]): string {
  const prices = variants.map((v) => v.priceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}
