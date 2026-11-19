import type { APIRoute } from 'astro';
import { isFormName, validate } from '../../lib/forms';

// Runs on Vercel for each request, like the checkout API.
export const prerender = false;

/**
 * POST /api/forms/ with { form, ...fields }. Checks the fields again (the browser's checks can be
 * skipped by anyone) and logs that a submission arrived. Kohaku is a concept store: nothing is
 * stored or emailed, and the log deliberately leaves out what people typed.
 */
export const POST: APIRoute = async ({ request }) => {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== 'object' || !isFormName(data.form)) {
    return Response.json({ error: 'Unknown form.' }, { status: 400 });
  }

  // Honeypot: a field people never see, which spam bots fill in. Pretend it worked and drop it.
  if (data.company) return Response.json({ ok: true });

  const errors = validate(data.form, data);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  console.log(
    data.form === 'contact'
      ? `Contact form: a message of ${data.message.trim().length} characters arrived.`
      : 'Newsletter: a sign-up arrived.',
  );
  return Response.json({ ok: true });
};
