import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { STRIPE_SECRET_KEY } from 'astro:env/server';
import Stripe from 'stripe';
import { toLineItems } from '../../lib/checkout';

// The one page that isn't built ahead of time: it runs on Vercel as a serverless function
// for each request, because it needs the secret key and must talk to Stripe.
export const prerender = false;

/** POST /api/checkout/ with { lines: CartLine[] } → { url } of a Stripe test checkout page. */
export const POST: APIRoute = async ({ request, url }) => {
  // Kohaku must never take real payments: refuse to run with anything but a test key.
  if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    return Response.json({ error: 'Checkout is set up for test keys only.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const lineItems = toLineItems(body?.lines, await getCollection('products'));
  if (!lineItems) return Response.json({ error: 'The cart has items that are no longer available.' }, { status: 400 });

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    // Stripe fills in {CHECKOUT_SESSION_ID} itself.
    success_url: `${url.origin}/checkout/success/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url.origin}/shop/`,
  });
  return Response.json({ url: session.url });
};
