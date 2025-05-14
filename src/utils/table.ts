/**
 * Creates a table element with the specified number of rows and columns
 *
 * @param rows Number of rows in the table
 * @param cols Number of columns in the table
 * @returns HTML string for the table
 */
export function createTableElement(rows: number, cols: number): string {
  let tableHtml =
    '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0; border: 1px solid #cbd5e1;">';

  // Create table header
  tableHtml += "<thead>";
  tableHtml += "<tr>";
  for (let i = 0; i < cols; i++) {
    tableHtml +=
      '<th style="border: 1px solid #cbd5e1; padding: 0.5rem; background-color: #f1f5f9; font-weight: 500;">Header ' +
      (i + 1) +
      "</th>";
  }
  tableHtml += "</tr>";
  tableHtml += "</thead>";

  // Create table body
  tableHtml += "<tbody>";
  for (let i = 0; i < rows - 1; i++) {
    // -1 because we already created a header row
    tableHtml += "<tr>";
    for (let j = 0; j < cols; j++) {
      tableHtml +=
        '<td style="border: 1px solid #cbd5e1; padding: 0.5rem;">Cell ' +
        (i + 1) +
        "-" +
        (j + 1) +
        "</td>";
    }
    tableHtml += "</tr>";
  }
  tableHtml += "</tbody>";

  tableHtml += "</table>";

  return tableHtml;
}

/**
 * Merge selected table cells (either horizontally or vertically)
 *
 * @param editorElement The editor DOM element
 * @param direction 'horizontal' or 'vertical'
 */
export function mergeCells(
  editorElement: HTMLElement,
  direction: "horizontal" | "vertical"
): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Get the selected range
  const range = selection.getRangeAt(0);

  // Find the table containing the selection
  let currentNode = range.commonAncestorContainer;
  let table: HTMLTableElement | null = null;
  let targetCells: HTMLTableCellElement[] = [];

  // Traverse up to find table
  while (currentNode && currentNode !== editorElement) {
    if (currentNode.nodeName === "TABLE") {
      table = currentNode as HTMLTableElement;
      break;
    }
    currentNode = currentNode.parentNode as Node;
  }

  if (!table) return;

  // Find all selected cells
  const cells = table.querySelectorAll("th, td");
  const startCell = findClosestCell(range.startContainer);
  const endCell = findClosestCell(range.endContainer);

  if (!startCell || !endCell) return;

  // Determine which cells to merge based on direction
  if (direction === "horizontal") {
    // For horizontal merge, cells must be in the same row
    const startRow = startCell.parentElement;
    const endRow = endCell.parentElement;

    if (startRow !== endRow) {
      console.warn("Cannot merge horizontally across different rows");
      return;
    }

    // Find all cells between start and end in the same row
    const rowCells = Array.from(startRow?.cells || []);
    const startIndex = rowCells.indexOf(startCell);
    const endIndex = rowCells.indexOf(endCell);

    if (startIndex < 0 || endIndex < 0) return;

    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);

    for (let i = minIndex; i <= maxIndex; i++) {
      targetCells.push(rowCells[i]);
    }

    // Set colspan on the first cell
    if (targetCells.length > 0) {
      const firstCell = targetCells[0];
      const totalColspan = targetCells.reduce(
        (sum, cell) => sum + parseInt(cell.getAttribute("colspan") || "1", 10),
        0
      );

      firstCell.setAttribute("colspan", totalColspan.toString());

      // Remove other cells
      for (let i = 1; i < targetCells.length; i++) {
        targetCells[i].remove();
      }
    }
  } else if (direction === "vertical") {
    // For vertical merge, cells must be in the same column
    const startRowIndex = getRowIndex(startCell);
    const endRowIndex = getRowIndex(endCell);
    const startColIndex = getCellIndex(startCell);
    const endColIndex = getCellIndex(endCell);

    if (startColIndex !== endColIndex) {
      console.warn("Cannot merge vertically across different columns");
      return;
    }

    const minRowIndex = Math.min(startRowIndex, endRowIndex);
    const maxRowIndex = Math.max(startRowIndex, endRowIndex);

    // Find cells in the same column across rows
    for (let i = minRowIndex; i <= maxRowIndex; i++) {
      const row = table.rows[i];
      if (row && startColIndex < row.cells.length) {
        targetCells.push(row.cells[startColIndex]);
      }
    }

    // Set rowspan on the first cell
    if (targetCells.length > 0) {
      const firstCell = targetCells[0];
      const totalRowspan = targetCells.reduce(
        (sum, cell) => sum + parseInt(cell.getAttribute("rowspan") || "1", 10),
        0
      );

      firstCell.setAttribute("rowspan", totalRowspan.toString());

      // Remove other cells
      for (let i = 1; i < targetCells.length; i++) {
        targetCells[i].remove();
      }
    }
  }
}

/**
 * Helper function to find the closest table cell containing a node
 */
function findClosestCell(node: Node | null): HTMLTableCellElement | null {
  if (!node) return null;

  let current: Node | null = node;
  while (current) {
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      (current.nodeName === "TD" || current.nodeName === "TH")
    ) {
      return current as HTMLTableCellElement;
    }
    current = current.parentNode;
  }

  return null;
}

/**
 * Helper function to get the index of a cell within its row
 */
function getCellIndex(cell: HTMLTableCellElement): number {
  const row = cell.parentElement;
  if (!row) return -1;

  return Array.from(row.cells).indexOf(cell);
}

/**
 * Helper function to get the index of a row containing a cell
 */
function getRowIndex(cell: HTMLTableCellElement): number {
  const row = cell.parentElement as HTMLTableRowElement;
  if (!row) return -1;

  const table = row.parentElement?.parentElement as HTMLTableElement;
  if (!table) return -1;

  return Array.from(table.rows).indexOf(row);
}

/**
 * Insert a row before or after the current row
 */
export function insertTableRow(
  editorElement: HTMLElement,
  position: "before" | "after"
): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Find the closest table cell from the selection
  const cell = findClosestCell(selection.anchorNode as Node);
  if (!cell) return;

  // Find the row containing the cell
  const row = cell.parentElement as HTMLTableRowElement;
  if (!row) return;

  // Create a new row with the same number of cells
  const newRow = document.createElement("tr");
  const cellCount = row.cells.length;

  for (let i = 0; i < cellCount; i++) {
    const newCell = document.createElement("td");
    newCell.className = "border border-slate-300 p-2";
    newCell.style.cssText = "border: 1px solid #cbd5e1; padding: 0.5rem;";
    newCell.innerHTML = "&nbsp;";
    newRow.appendChild(newCell);
  }

  // Insert the new row before or after the current row
  if (position === "before") {
    row.parentNode?.insertBefore(newRow, row);
  } else {
    if (row.nextSibling) {
      row.parentNode?.insertBefore(newRow, row.nextSibling);
    } else {
      row.parentNode?.appendChild(newRow);
    }
  }
}

/**
 * Insert a column before or after the current column
 */
export function insertTableColumn(
  editorElement: HTMLElement,
  position: "before" | "after"
): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Find the closest table cell from the selection
  const cell = findClosestCell(selection.anchorNode as Node);
  if (!cell) return;

  // Get the index of the current cell
  const cellIndex = getCellIndex(cell);
  if (cellIndex === -1) return;

  // Find the table containing the cell
  let currentNode: Node | null = cell;
  let table: HTMLTableElement | null = null;

  while (currentNode && currentNode !== editorElement) {
    if (currentNode.nodeName === "TABLE") {
      table = currentNode as HTMLTableElement;
      break;
    }
    currentNode = currentNode.parentNode;
  }

  if (!table) return;

  // Calculate the target index for the new column
  const targetIndex = position === "before" ? cellIndex : cellIndex + 1;

  // Insert a new cell in each row at the target index
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const newCell = document.createElement(
      i === 0 && row.parentElement?.nodeName === "THEAD" ? "th" : "td"
    );

    newCell.innerHTML = "&nbsp;";

    if (i === 0 && row.parentElement?.nodeName === "THEAD") {
      newCell.style.cssText =
        "border: 1px solid #cbd5e1; padding: 0.5rem; background-color: #f1f5f9; font-weight: 500;";
    } else {
      newCell.style.cssText = "border: 1px solid #cbd5e1; padding: 0.5rem;";
    }

    // Insert at the correct position
    if (targetIndex >= row.cells.length) {
      row.appendChild(newCell);
    } else {
      row.insertBefore(newCell, row.cells[targetIndex]);
    }
  }
}

/**
 * Delete the current row
 */
export function deleteTableRow(editorElement: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Find the closest table cell from the selection
  const cell = findClosestCell(selection.anchorNode as Node);
  if (!cell) return;

  // Find the row containing the cell
  const row = cell.parentElement as HTMLTableRowElement;
  if (!row) return;

  // Don't delete if it's the only row in the table
  if (row.parentElement?.rows.length === 1) return;

  // Delete the row
  row.parentNode?.removeChild(row);
}

/**
 * Delete the current column
 */
export function deleteTableColumn(editorElement: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  // Find the closest table cell from the selection
  const cell = findClosestCell(selection.anchorNode as Node);
  if (!cell) return;

  // Get the index of the current cell
  const cellIndex = getCellIndex(cell);
  if (cellIndex === -1) return;

  // Find the table containing the cell
  let currentNode: Node | null = cell;
  let table: HTMLTableElement | null = null;

  while (currentNode && currentNode !== editorElement) {
    if (currentNode.nodeName === "TABLE") {
      table = currentNode as HTMLTableElement;
      break;
    }
    currentNode = currentNode.parentNode;
  }

  if (!table) return;

  // Don't delete if it's the only column in the table
  if (table.rows[0].cells.length === 1) return;

  // Delete the cell at the specified index in each row
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    if (cellIndex < row.cells.length) {
      row.deleteCell(cellIndex);
    }
  }
}
