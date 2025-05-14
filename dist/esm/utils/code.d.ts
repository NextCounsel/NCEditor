/**
 * Handles inserting code blocks into the editor content
 *
 * @param code The code content to insert
 * @param language The programming language for syntax highlighting
 * @param execCommand Function to execute editor commands
 */
export declare function insertCodeBlock(code: string, language: string, execCommand: (command: string, value?: string) => void): void;
