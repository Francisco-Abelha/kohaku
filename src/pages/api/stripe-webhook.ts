import type { APIRoute } from 'astro';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from 'astro:env/server';
import Stripe from 'stripe';

// Runs on Vercel for each request, like the checkout API.
export const prerender = false;

/**
 * Stripe calls this when a checkout finishes. Unlike the thank-you page, which anyone can open,
 * this is proof of payment: the request is signed with a secret only Stripe and this server know.
 * Kohaku ships nothing, so a paid order is only logged (Vercel → the deployment → Logs).
 */
export const POST: APIRoute = async ({ request }) => {
  if (!STRIPE_WEBHOOK_SECRET) return new Response('Webhook secret not set', { status: 500 });
  const stripe = new Stripe(STRIPE_SECRET_KEY);

  // The signature covers the exact bytes Stripe sent, so read the body as raw text, not JSON.
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      request.headers.get('stripe-signature') ?? '',
      STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    // Missing, forged or too old (Stripe's default tolerance is 5 minutes, which stops replays).
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (event.livemode) {
      // Should be impossible with a test key, but Kohaku must never fulfil a real payment.
      console.error(`Live-mode event ${event.id} ignored: Kohaku only accepts test payments.`);
    } else if (session.payment_status === 'paid') {
      const items = await stripe.checkout.sessions.listLineItems(session.id);
      // shortcut: logs only, so a duplicate delivery just logs twice; a real shop would store
      // event.id and skip ids it has already processed before fulfilling anything.
      console.log(
        `Test order paid: ${session.id}, ${(session.amount_total ?? 0) / 100} ${session.currency?.toUpperCase()}:`,
        items.data.map((item) => `${item.quantity} × ${item.description}`).join(', '),
      );
    }
  }

  // Answer quickly with 2xx, or Stripe retries the event for up to three days.
  return new Response(null, { status: 200 });
};
