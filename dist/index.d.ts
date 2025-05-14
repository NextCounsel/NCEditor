import React from 'react';

interface NCEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    autoInsertTable?: boolean;
    defaultFontFamily?: string;
    defaultFontSize?: string;
    defaultTextColor?: string;
    defaultBackgroundColor?: string;
    showWordCount?: boolean;
}
declare function NCEditor({ value, onChange, placeholder, className, readOnly, autoInsertTable, defaultFontFamily, defaultFontSize, defaultTextColor, defaultBackgroundColor, showWordCount, }: NCEditorProps): React.JSX.Element;

interface NCEditorContentProps {
    editorRef: React.RefObject<HTMLDivElement>;
    sourceView: boolean;
    sourceContent: string;
    handleSourceChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleContentChange: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
    placeholder?: string;
    direction: string;
    readOnly?: boolean;
    isFullscreen?: boolean;
}
declare function NCEditorContent({ editorRef, sourceView, sourceContent, handleSourceChange, handleContentChange, handleFocus, handleBlur, placeholder, direction, readOnly, isFullscreen, }: NCEditorContentProps): React.JSX.Element;

interface NCEditorToolbarProps {
    execCommand: (command: string, value?: string) => void;
    editorRef: React.RefObject<HTMLDivElement>;
    insertTable: (rows: number, cols: number) => void;
    insertImage: (file: File | null, url: string | null) => void;
    insertComment: (comment: string) => void;
    insertCode: (code: string, language: string) => void;
    sourceView: boolean;
    setSourceView: (sourceView: boolean) => void;
    readOnly?: boolean;
    onRevertContent?: () => void;
    hasChanges?: boolean;
    onFontFamilyChange?: (fontFamily: string) => void;
    onFontSizeChange?: (fontSize: string) => void;
    isFullscreen?: boolean;
    toggleFullscreen?: () => void;
    onTextColorChange?: (color: string) => void;
    onBackgroundColorChange?: (color: string) => void;
    onToggleFindReplace?: () => void;
    mergeCells?: (direction: "horizontal" | "vertical") => void;
    insertTableRow?: (position: "before" | "after") => void;
    insertTableColumn?: (position: "before" | "after") => void;
    deleteTableRow?: () => void;
    deleteTableColumn?: () => void;
    onTextDirectionChange?: (direction: "ltr" | "rtl") => void;
}
declare function NCEditorToolbar({ execCommand, sourceView, setSourceView, readOnly, hasChanges, onRevertContent, isFullscreen, toggleFullscreen, }: NCEditorToolbarProps): React.JSX.Element;

/**
 * Sanitizes HTML to ensure it's safe and standards-compliant
 *
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML
 */
declare function sanitizeHtml(html: string): string;
/**
 * Compares two HTML strings for semantic equivalence
 * This is useful for determining if the content has changed meaningfully
 *
 * @param html1 First HTML string to compare
 * @param html2 Second HTML string to compare
 * @returns true if the HTML strings are semantically equivalent
 */
declare function areHtmlEquivalent(html1: string, html2: string): boolean;

/**
 * Creates a table element with the specified number of rows and columns
 *
 * @param rows Number of rows in the table
 * @param cols Number of columns in the table
 * @returns HTML string for the table
 */
declare function createTableElement(rows: number, cols: number): string;
/**
 * Merge selected table cells (either horizontally or vertically)
 *
 * @param editorElement The editor DOM element
 * @param direction 'horizontal' or 'vertical'
 */
declare function mergeCells(editorElement: HTMLElement, direction: "horizontal" | "vertical"): void;
/**
 * Insert a row before or after the current row
 */
declare function insertTableRow(editorElement: HTMLElement, position: "before" | "after"): void;
/**
 * Insert a column before or after the current column
 */
declare function insertTableColumn(editorElement: HTMLElement, position: "before" | "after"): void;
/**
 * Delete the current row
 */
declare function deleteTableRow(editorElement: HTMLElement): void;
/**
 * Delete the current column
 */
declare function deleteTableColumn(editorElement: HTMLElement): void;

/**
 * Handles inserting images into the editor content
 *
 * @param file Optional file to insert as base64
 * @param url Optional URL to insert
 * @param execCommand Function to execute editor commands
 */
declare function insertImage(file: File | null, url: string | null, execCommand: (command: string, value?: string) => void): void;
/**
 * Initialize image resizing functionality for all images in the editor
 *
 * @param editorElement The editor DOM element
 * @returns A cleanup function to remove event listeners
 */
declare function initImageResizing(editorElement: HTMLElement): () => void;

/**
 * Handles inserting comment blocks into the editor content
 *
 * @param comment The comment text to insert
 * @param execCommand Function to execute editor commands
 */
declare function insertComment(comment: string, execCommand: (command: string, value?: string) => void): void;

/**
 * Handles inserting code blocks into the editor content
 *
 * @param code The code content to insert
 * @param language The programming language for syntax highlighting
 * @param execCommand Function to execute editor commands
 */
declare function insertCodeBlock(code: string, language: string, execCommand: (command: string, value?: string) => void): void;

export { NCEditor, NCEditorContent, NCEditorToolbar, areHtmlEquivalent, createTableElement, deleteTableColumn, deleteTableRow, initImageResizing, insertCodeBlock, insertComment, insertImage, insertTableColumn, insertTableRow, mergeCells, sanitizeHtml };
export type { NCEditorContentProps, NCEditorProps, NCEditorToolbarProps };
