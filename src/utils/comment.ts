/**
 * Handles inserting comments into the editor content
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
    <div class="nc-comment my-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded" 
         style="margin: 1rem 0; padding: 0.75rem; background-color: #fefce8; border-left: 4px solid #facc15; border-radius: 0.25rem;">
      <div class="text-sm text-gray-700" style="font-size: 0.875rem; color: #374151;">
        <span class="font-medium" style="font-weight: 500;">Comment:</span> ${comment}
      </div>
    </div>
  `;

  execCommand("insertHTML", commentHtml);
}
