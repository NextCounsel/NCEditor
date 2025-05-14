/**
 * Handles inserting comment blocks into the editor content
 *
 * @param comment The comment text to insert
 * @param execCommand Function to execute editor commands
 */
export declare function insertComment(comment: string, execCommand: (command: string, value?: string) => void): void;
