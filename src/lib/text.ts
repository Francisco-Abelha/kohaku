const escapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Turn content text into HTML paragraphs: blank lines separate paragraphs, and **text** becomes bold.
 * Everything is escaped first, so the content can never inject other HTML.
 */
export function paragraphsToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim().replace(/[&<>"']/g, (c) => escapes[c]))
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
    .join('');
}
