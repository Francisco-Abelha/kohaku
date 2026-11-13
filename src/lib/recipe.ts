export interface RecipeItem {
  amount: string; // "60 ml"
  label: string; // "water"
}

export interface Recipe {
  title?: string; // "Usucha", when the line names one
  items: RecipeItem[];
  steps: string[]; // the paragraphs after the line, still in content-text form
}

// What an amount is when the line doesn't say ("3g" alone).
const defaultLabels: Record<string, string> = { g: 'powder', ml: 'water', '°C': 'temperature' };

/**
 * Read a "How to prepare" text. Each bold line such as "**Usucha — 2g · 100ml water · 80°C**"
 * starts a recipe; the paragraphs after it belong to that recipe. Returns [] when the text
 * doesn't follow that pattern, so the page can show it as plain paragraphs instead.
 */
export function parseRecipes(body: string): Recipe[] {
  const recipes: Recipe[] = [];
  for (const paragraph of body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    const heading = paragraph.match(/^\*\*(.+)\*\*$/);
    if (!heading) {
      if (!recipes.length) return []; // text before the first recipe line: not a recipe
      recipes[recipes.length - 1].steps.push(paragraph);
      continue;
    }
    let line = heading[1];
    let title: string | undefined;
    const named = line.match(/^(.+?)\s+—\s+(.+)$/);
    if (named) [, title, line] = named;
    const items: RecipeItem[] = [];
    for (const part of line.split('·').map((p) => p.trim())) {
      const m = part.match(/^(\d+(?:\.\d+)?)\s*(g|ml|°C)\s*(.*)$/);
      if (!m) return [];
      items.push({ amount: `${m[1]} ${m[2]}`, label: m[3] || defaultLabels[m[2]] });
    }
    recipes.push({ title, items, steps: [] });
  }
  return recipes;
}

/**
 * Split off the opening of a text for a pull-quote: whole sentences from the first paragraph
 * until there are at least `min` characters. `rest` is everything after, paragraphs kept.
 */
export function leadSentences(text: string, min = 80): { lead: string; rest: string } {
  const [first = '', ...others] = text.trim().split(/\n\s*\n/);
  const sentences = first.split(/(?<=[.!?])\s+/);
  let count = 0;
  while (count < sentences.length && sentences.slice(0, count).join(' ').length < min) count++;
  const rest = [sentences.slice(count).join(' '), ...others].filter(Boolean).join('\n\n');
  return { lead: sentences.slice(0, count).join(' '), rest };
}
