/** The site's two forms. The browser and the server both check submissions with validate(),
 *  so the messages people see while typing match what the server would answer. */
export type FormName = 'contact' | 'newsletter';
export type Field = 'name' | 'email' | 'message';
export type Errors = Partial<Record<Field, string>>;

export const isFormName = (x: unknown): x is FormName => x === 'contact' || x === 'newsletter';

// Deliberately loose: something@something.something. Only sending an email proves an address works.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(form: FormName, data: Record<string, unknown>): Errors {
  const text = (key: Field) => (typeof data[key] === 'string' ? (data[key] as string).trim() : '');
  const errors: Errors = {};

  const email = text('email');
  if (!email) errors.email = 'Enter your email address.';
  else if (!EMAIL.test(email) || email.length > 254) errors.email = 'Enter an email address like name@example.com.';

  if (form === 'contact') {
    const name = text('name');
    if (!name) errors.name = 'Enter your name.';
    else if (name.length > 100) errors.name = 'Keep your name under 100 characters.';

    const message = text('message');
    if (!message) errors.message = 'Write your message.';
    else if (message.length > 5000) errors.message = 'Keep your message under 5,000 characters.';
  }
  return errors;
}
