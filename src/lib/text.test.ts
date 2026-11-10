import assert from 'node:assert/strict';
import { test } from 'node:test';
import { paragraphsToHtml } from './text.ts';

test('splits paragraphs and supports bold', () => {
  assert.equal(
    paragraphsToHtml('**Do not wash it.** Wipe it dry.\n\nKeep it.'),
    '<p><strong>Do not wash it.</strong> Wipe it dry.</p><p>Keep it.</p>',
  );
});

test('escapes HTML in the content', () => {
  assert.equal(paragraphsToHtml('<script>x</script> & "y"'), '<p>&lt;script&gt;x&lt;/script&gt; &amp; &quot;y&quot;</p>');
});
