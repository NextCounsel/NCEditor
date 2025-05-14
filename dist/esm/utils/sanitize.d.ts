/**
 * Sanitizes HTML to ensure it's safe and standards-compliant
 *
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML
 */
export declare function sanitizeHtml(html: string): string;
/**
 * Compares two HTML strings for semantic equivalence
 * This is useful for determining if the content has changed meaningfully
 *
 * @param html1 First HTML string to compare
 * @param html2 Second HTML string to compare
 * @returns true if the HTML strings are semantically equivalent
 */
export declare function areHtmlEquivalent(html1: string, html2: string): boolean;
