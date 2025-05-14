/**
 * Handles inserting images into the editor content
 *
 * @param file Optional file to insert as base64
 * @param url Optional URL to insert
 * @param execCommand Function to execute editor commands
 */
export declare function insertImage(file: File | null, url: string | null, execCommand: (command: string, value?: string) => void): void;
/**
 * Initialize image resizing functionality for all images in the editor
 *
 * @param editorElement The editor DOM element
 * @returns A cleanup function to remove event listeners
 */
export declare function initImageResizing(editorElement: HTMLElement): () => void;
