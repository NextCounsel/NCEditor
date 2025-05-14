/**
 * Creates a HTML table element with the specified rows and columns
 *
 * @param rows Number of rows to create
 * @param cols Number of columns to create
 * @returns HTML string for the table
 */
export function createTableElement(rows: number, cols: number): string {
  if (rows < 1 || cols < 1) {
    return "";
  }

  // Start the table with responsive and styled classes
  let tableHtml = `
    <table class="nc-table w-full border-collapse border border-slate-300 my-4" style="width: 100%; border-collapse: collapse; margin: 1rem 0; border: 1px solid #cbd5e1;">
      <thead>
        <tr class="bg-slate-100" style="background-color: #f1f5f9;">
  `;

  // Create header cells
  for (let col = 0; col < cols; col++) {
    tableHtml += `<th class="border border-slate-300 p-2 text-left font-medium" style="border: 1px solid #cbd5e1; padding: 0.5rem; text-align: left; font-weight: 500;">Header ${
      col + 1
    }</th>`;
  }

  // Close header row and start tbody
  tableHtml += `
        </tr>
      </thead>
      <tbody>
  `;

  // Create data rows
  for (let row = 1; row < rows; row++) {
    tableHtml += `<tr>`;

    // Create cells for this row
    for (let col = 0; col < cols; col++) {
      tableHtml += `<td class="border border-slate-300 p-2" style="border: 1px solid #cbd5e1; padding: 0.5rem;">Cell ${row}, ${
        col + 1
      }</td>`;
    }

    tableHtml += `</tr>`;
  }

  // Close the table
  tableHtml += `
      </tbody>
    </table>
  `;

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

  // If merging horizontally, cells must be in the same row
  if (direction === "horizontal") {
    const startRow = startCell.parentElement;
    const endRow = endCell.parentElement;

    if (startRow !== endRow) {
      console.warn("Cannot merge cells across different rows horizontally");
      return;
    }

    // Get all cells between start and end in the row
    const rowCells = Array.from((startRow as HTMLTableRowElement)?.cells || []);
    const startIndex = rowCells.indexOf(startCell);
    const endIndex = rowCells.indexOf(endCell);

    if (startIndex === -1 || endIndex === -1) return;

    const min = Math.min(startIndex, endIndex);
    const max = Math.max(startIndex, endIndex);

    targetCells = rowCells.slice(min, max + 1) as HTMLTableCellElement[];

    if (targetCells.length < 2) return;

    // Calculate total colspan
    let totalColspan = 0;
    targetCells.forEach((cell) => {
      totalColspan += parseInt(cell.getAttribute("colspan") || "1");
    });

    // Merge the cells
    const firstCell = targetCells[0];
    firstCell.setAttribute("colspan", totalColspan.toString());

    // Combine content and remove other cells
    for (let i = 1; i < targetCells.length; i++) {
      firstCell.innerHTML += " " + targetCells[i].innerHTML;
      targetCells[i].remove();
    }
  } else if (direction === "vertical") {
    // For vertical merging, we need to find cells in the same column
    const startCellIndex = getCellIndex(startCell);
    const endCellIndex = getCellIndex(endCell);

    if (
      startCellIndex === -1 ||
      endCellIndex === -1 ||
      startCellIndex !== endCellIndex
    ) {
      console.warn("Cannot merge cells across different columns vertically");
      return;
    }

    // Get all rows
    const rows = Array.from(table.rows);
    const startRowIndex = getRowIndex(startCell);
    const endRowIndex = getRowIndex(endCell);

    if (startRowIndex === -1 || endRowIndex === -1) return;

    const min = Math.min(startRowIndex, endRowIndex);
    const max = Math.max(startRowIndex, endRowIndex);

    // Get cells in the same column from each row
    for (let i = min; i <= max; i++) {
      const row = rows[i];
      const cell = row.cells[startCellIndex] as HTMLTableCellElement;
      if (cell) {
        targetCells.push(cell);
      }
    }

    if (targetCells.length < 2) return;

    // Calculate total rowspan
    let totalRowspan = 0;
    targetCells.forEach((cell) => {
      totalRowspan += parseInt(cell.getAttribute("rowspan") || "1");
    });

    // Merge the cells
    const firstCell = targetCells[0];
    firstCell.setAttribute("rowspan", totalRowspan.toString());

    // Combine content and remove other cells
    for (let i = 1; i < targetCells.length; i++) {
      firstCell.innerHTML += " " + targetCells[i].innerHTML;
      targetCells[i].remove();
    }
  }
}

/**
 * Helper function to find the closest table cell from a node
 */
function findClosestCell(node: Node): HTMLTableCellElement | null {
  while (node && node.nodeName !== "TD" && node.nodeName !== "TH") {
    node = node.parentNode as Node;
    if (!node) return null;
  }
  return node as HTMLTableCellElement;
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

  // Get the table
  const table = cell.closest("table") as HTMLTableElement;
  if (!table) return;

  // Get the index of the cell in its row
  const cellIndex = getCellIndex(cell);
  if (cellIndex === -1) return;

  // The actual index where we'll insert our column
  const insertIndex = position === "before" ? cellIndex : cellIndex + 1;

  // Loop through all rows and insert a cell at the same position
  Array.from(table.rows).forEach((row) => {
    const newCell =
      row.parentNode?.nodeName === "THEAD"
        ? document.createElement("th")
        : document.createElement("td");

    newCell.className =
      row.parentNode?.nodeName === "THEAD"
        ? "border border-slate-300 p-2 text-left font-medium"
        : "border border-slate-300 p-2";

    newCell.style.cssText =
      row.parentNode?.nodeName === "THEAD"
        ? "border: 1px solid #cbd5e1; padding: 0.5rem; text-align: left; font-weight: 500;"
        : "border: 1px solid #cbd5e1; padding: 0.5rem;";

    newCell.innerHTML = "&nbsp;";

    // Insert at the right position
    if (insertIndex >= row.cells.length) {
      row.appendChild(newCell);
    } else {
      row.insertBefore(newCell, row.cells[insertIndex]);
    }
  });
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
  const table = row.closest("table") as HTMLTableElement;
  if (table && table.rows.length <= 1) return;

  // Delete the row
  row.remove();
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

  // Get the table
  const table = cell.closest("table") as HTMLTableElement;
  if (!table) return;

  // Get the index of the cell in its row
  const cellIndex = getCellIndex(cell);
  if (cellIndex === -1) return;

  // Don't delete if it's the only column in the table
  if (table.rows[0].cells.length <= 1) return;

  // Delete the column from all rows
  Array.from(table.rows).forEach((row) => {
    if (row.cells[cellIndex]) {
      row.cells[cellIndex].remove();
    }
  });
}
