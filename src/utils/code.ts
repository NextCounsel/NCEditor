/**
 * Handles inserting code blocks into the editor content
 *
 * @param code The code content to insert
 * @param language The programming language for syntax highlighting
 * @param execCommand Function to execute editor commands
 */
export function insertCodeBlock(
  code: string,
  language: string,
  execCommand: (command: string, value?: string) => void
): void {
  if (!code) return;

  const codeHtml = `
    <pre class="nc-code-block bg-gray-100 rounded-md p-4 my-4 overflow-x-auto">
      <code class="language-${language} text-sm font-mono">${escapeHtml(
    code
  )}</code>
    </pre>
  `;

  execCommand("insertHTML", codeHtml);
}

/**
 * Escape HTML special characters to prevent XSS
 *
 * @param text Text to escape
 * @returns Escaped text
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
