/** One line in the cart. Only ids are stored: names and prices come from the product files,
 *  so a stale cart can never carry an old price (and checkout re-reads prices on the server). */
export interface CartLine {
  id: string;
  size: string;
  qty: number;
}

export const MAX_QTY = 10;
const KEY = 'kohaku-cart';

const same = (line: CartLine, id: string, size: string) => line.id === id && line.size === size;

/** Adds one of a product size, or one more if it's already in the cart. */
export function addLine(lines: CartLine[], id: string, size: string): CartLine[] {
  const existing = lines.find((l) => same(l, id, size));
  return existing ? setQty(lines, id, size, existing.qty + 1) : [...lines, { id, size, qty: 1 }];
}

/** Changes a line's quantity, capped at MAX_QTY. Zero or less removes the line. */
export function setQty(lines: CartLine[], id: string, size: string, qty: number): CartLine[] {
  if (qty <= 0) return lines.filter((l) => !same(l, id, size));
  return lines.map((l) => (same(l, id, size) ? { ...l, qty: Math.min(qty, MAX_QTY) } : l));
}

export const itemCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.qty, 0);

const isLine = (x: unknown): x is CartLine =>
  typeof x === 'object' && x !== null &&
  typeof (x as CartLine).id === 'string' &&
  typeof (x as CartLine).size === 'string' &&
  Number.isInteger((x as CartLine).qty) && (x as CartLine).qty > 0;

/** The saved cart. Storage can be blocked (private mode) or hold junk, so anything odd reads as empty. */
export function loadCart(): CartLine[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(data) ? data.filter(isLine) : [];
  } catch {
    return [];
  }
}

/** Saves the cart and tells the page (the drawer and the header count listen for 'cart:change'). */
export function saveCart(lines: CartLine[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Storage blocked: the cart still works on this page, it just won't survive a reload.
  }
  document.dispatchEvent(new CustomEvent('cart:change'));
}
