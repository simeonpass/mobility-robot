/**
 * Helpers for product description HTML / plain-text layout on PDPs.
 * Accessories often have rich Shopify HTML that was previously flattened
 * into a single paragraph via the plain `description` field.
 */

const THIN_DESCRIPTION_MAX = 90;

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Shopify body has real layout (lists / headings), not a title stub. */
export function hasStructuredDescriptionHtml(html: string): boolean {
  return /<(?:ul|ol|li|h[1-6])\b/i.test(html);
}

/** True when Shopify body is effectively just the product title. */
export function isThinProductDescription(
  htmlOrText: string | null | undefined,
  title?: string | null,
): boolean {
  const raw = htmlOrText ?? '';
  if (hasStructuredDescriptionHtml(raw)) return false;

  const plain = stripHtml(raw);
  if (!plain) return true;
  if (plain.length <= THIN_DESCRIPTION_MAX) return true;
  if (title) {
    const normalised = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (normalised(plain) === normalised(title)) return true;
  }
  return false;
}

/**
 * Clean Shopify description HTML for storefront display:
 * drop inline styles / tracking attrs, demote h1, keep structure.
 */
export function normalizeDescriptionHtml(html: string): string {
  return html
    .replace(/\s(?:style|class|data-[a-z0-9_-]+)="[^"]*"/gi, '')
    .replace(/\s(?:style|class|data-[a-z0-9_-]+)='[^']*'/gi, '')
    .replace(/<\/?font\b[^>]*>/gi, '')
    .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/(<\/li>)\s*<p>\s*<\/p>/gi, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Split plain Shopify description into paragraphs / bullet lines. */
export function formatPlainDescription(text: string): {
  paragraphs: string[];
  bullets: string[];
} {
  const normalised = text.replace(/\r\n/g, '\n').trim();
  if (!normalised) return {paragraphs: [], bullets: []};

  const lines = normalised
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  const bullets: string[] = [];

  for (const line of lines) {
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
    if (bullet) {
      bullets.push(bullet[1].trim());
      continue;
    }
    paragraphs.push(line);
  }

  // Single run-on blob with no newlines — split into readable paragraphs.
  if (paragraphs.length === 1 && bullets.length === 0) {
    return {paragraphs: splitRunOnParagraph(paragraphs[0]), bullets: []};
  }

  return {paragraphs, bullets};
}

function splitRunOnParagraph(text: string): string[] {
  if (text.length < 140) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!sentences || sentences.length < 2) return [text];

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = `${current}${sentence}`.trim();
    if (current && next.length > 140) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

export function extractHighlightsFromHtml(html: string): string[] {
  const items: string[] = [];
  const liPattern = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liPattern.exec(html))) {
    const text = stripHtml(match[1]);
    if (text) items.push(text);
  }
  return items;
}

/** Build simple semantic HTML from plain paragraphs + bullets. */
export function buildDescriptionHtmlFromPlain(text: string): string {
  const {paragraphs, bullets} = formatPlainDescription(text);
  const parts: string[] = [];

  for (const paragraph of paragraphs) {
    parts.push(`<p>${escapeHtml(paragraph)}</p>`);
  }

  if (bullets.length) {
    parts.push(
      `<ul>${bullets
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join('')}</ul>`,
    );
  }

  return parts.join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
