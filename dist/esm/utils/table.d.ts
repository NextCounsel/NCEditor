/**
 * Creates a table element with the specified number of rows and columns
 *
 * @param rows Number of rows in the table
 * @param cols Number of columns in the table
 * @returns HTML string for the table
 */
export declare function createTableElement(rows: number, cols: number): string;
/**
 * Merge selected table cells (either horizontally or vertically)
 *
 * @param editorElement The editor DOM element
 * @param direction 'horizontal' or 'vertical'
 */
export declare function mergeCells(editorElement: HTMLElement, direction: "horizontal" | "vertical"): void;
/**
 * Insert a row before or after the current row
 */
export declare function insertTableRow(editorElement: HTMLElement, position: "before" | "after"): void;
/**
 * Insert a column before or after the current column
 */
export declare function insertTableColumn(editorElement: HTMLElement, position: "before" | "after"): void;
/**
 * Delete the current row
 */
export declare function deleteTableRow(editorElement: HTMLElement): void;
/**
 * Delete the current column
 */
export declare function deleteTableColumn(editorElement: HTMLElement): void;
