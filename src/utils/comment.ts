/**
 * Handles inserting comment blocks into the editor content
 *
 * @param comment The comment text to insert
 * @param execCommand Function to execute editor commands
 */
export function insertComment(
  comment: string,
  execCommand: (command: string, value?: string) => void
): void {
  if (!comment) return;

  const commentHtml = `
    <div class="nc-comment my-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <div class="text-sm text-gray-700">
        <span class="font-medium">Comment:</span> ${escapeHtml(comment)}
      </div>
    </div>
  `;

  execCommand("insertHTML", commentHtml);
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
