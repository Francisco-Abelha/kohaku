import { MAX_QTY } from './cart.ts';

/** The fields of a product file that checkout needs. */
interface Product {
  id: string;
  data: { name: string; variants: { label: string; priceCents: number }[] };
}

/** A Stripe Checkout line with its price given inline, so nothing has to be set up in Stripe first. */
export interface LineItem {
  quantity: number;
  price_data: { currency: 'usd'; unit_amount: number; product_data: { name: string } };
}

const MAX_LINES = 20;

/**
 * Turns the cart sent by the browser into Stripe line items. The browser's data is untrusted
 * (anyone can edit localStorage or send their own request), so only ids, sizes and quantities
 * are read from it; names and prices come from the product files. Returns null if anything is off.
 */
export function toLineItems(cart: unknown, products: Product[]): LineItem[] | null {
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > MAX_LINES) return null;
  const byId = new Map(products.map((p) => [p.id, p]));
  const items: LineItem[] = [];
  for (const line of cart) {
    const product = byId.get(line?.id);
    const variant = product?.data.variants.find((v) => v.label === line?.size);
    const qty = line?.qty;
    if (!product || !variant || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
    const name = product.data.variants.length > 1 ? `${product.data.name} (${variant.label})` : product.data.name;
    items.push({
      quantity: qty,
      price_data: { currency: 'usd', unit_amount: variant.priceCents, product_data: { name } },
    });
  }
  return items;
}
