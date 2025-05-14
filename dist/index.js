'use strict';

var React = require('react');
var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');

/**
 * Combines multiple class names into a single string, merging Tailwind classes properly
 */
function cn(...inputs) {
    return tailwindMerge.twMerge(clsx.clsx(inputs));
}

function NCEditorToolbar({ execCommand, sourceView, setSourceView, readOnly = false, hasChanges = false, onRevertContent, isFullscreen = false, toggleFullscreen, }) {
    // Only show a minimal toolbar for this example
    return (React.createElement("div", { className: cn("nc-editor-toolbar p-1 border-b flex flex-wrap gap-1 items-center bg-white sticky top-0 z-10", isFullscreen && "w-full") },
        React.createElement("button", { type: "button", onClick: () => execCommand("bold"), className: cn("px-2 py-1 rounded hover:bg-gray-100", readOnly && "opacity-50 cursor-not-allowed"), disabled: readOnly, title: "Bold" }, "B"),
        React.createElement("button", { type: "button", onClick: () => execCommand("italic"), className: cn("px-2 py-1 rounded hover:bg-gray-100", readOnly && "opacity-50 cursor-not-allowed"), disabled: readOnly, title: "Italic" }, "I"),
        React.createElement("button", { type: "button", onClick: () => execCommand("underline"), className: cn("px-2 py-1 rounded hover:bg-gray-100", readOnly && "opacity-50 cursor-not-allowed"), disabled: readOnly, title: "Underline" }, "U"),
        React.createElement("div", { className: "w-px h-6 bg-gray-200 mx-1" }),
        React.createElement("button", { type: "button", onClick: () => setSourceView(!sourceView), className: cn("px-2 py-1 rounded hover:bg-gray-100", sourceView && "bg-amber-100 text-amber-700", readOnly && "opacity-50 cursor-not-allowed"), disabled: readOnly, title: "HTML Source" }, "HTML"),
        sourceView && hasChanges && onRevertContent && (React.createElement("button", { type: "button", onClick: onRevertContent, className: "px-2 py-1 rounded hover:bg-gray-100 text-red-600", title: "Revert changes" }, "Revert")),
        React.createElement("div", { className: "flex-grow" }),
        toggleFullscreen && (React.createElement("button", { type: "button", onClick: toggleFullscreen, className: cn("px-2 py-1 rounded hover:bg-gray-100", isFullscreen && "bg-blue-100 text-blue-700"), title: isFullscreen ? "Exit Fullscreen" : "Fullscreen" }, isFullscreen ? "Exit Fullscreen" : "Fullscreen"))));
}

function NCEditorContent({ editorRef, sourceView, sourceContent, handleSourceChange, handleContentChange, handleFocus, handleBlur, placeholder, direction = "ltr", readOnly = false, isFullscreen = false, }) {
    const textareaRef = React.useRef(null);
    React.useEffect(() => {
        // Focus the textarea when switching to source view
        if (sourceView && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [sourceView]);
    // Handle input events from the contentEditable div
    const handleInput = () => {
        setTimeout(handleContentChange, 0);
    };
    // Calculate the height for fullscreen mode
    const fullscreenHeight = isFullscreen ? "calc(100vh - 50px)" : undefined;
    return (React.createElement("div", { className: "relative" },
        sourceView ? (React.createElement("div", { className: "source-editor-container relative" },
            React.createElement("textarea", { ref: textareaRef, value: sourceContent, onChange: handleSourceChange, className: cn("min-h-[350px] font-mono text-sm p-4 rounded-none border-0 focus-visible:ring-0 resize-y font-mono", isFullscreen && "h-[calc(100vh-50px)]"), spellCheck: false, dir: direction, onFocus: handleFocus, onBlur: handleBlur, readOnly: readOnly, style: {
                    tabSize: 2,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    height: fullscreenHeight,
                    width: "100%",
                } }),
            React.createElement("div", { className: "absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-bl" }, "HTML Source"))) : (React.createElement("div", { ref: editorRef, className: cn("nc-editor-content min-h-[350px] p-4 focus:outline-none overflow-auto prose prose-sm max-w-none", !sourceContent && placeholder ? "empty-editor" : "", isFullscreen && "h-[calc(100vh-50px)]", "nc-ltr-content"), contentEditable: !readOnly, onInput: handleInput, onKeyUp: handleInput, onKeyDown: (e) => {
                // Special handling for enter key to ensure we capture paragraph creation
                if (e.key === "Enter") {
                    setTimeout(handleContentChange, 0);
                }
            }, onPaste: (e) => {
                // Make sure we update after paste operations
                setTimeout(handleContentChange, 0);
            }, "data-placeholder": placeholder, onFocus: handleFocus, onBlur: handleBlur, dir: "ltr", "data-text-direction": "ltr", style: {
                position: "relative",
                height: fullscreenHeight,
                direction: "ltr",
                textAlign: "left",
                unicodeBidi: "normal",
            } })),
        React.createElement("style", null, `
        /* Basic editor styles */
        .empty-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          position: absolute;
          pointer-events: none;
        }
        
        .source-editor-container {
          position: relative;
          border-top: 2px solid #f59e0b;
          background-color: #fffbeb;
        }

        /* Force LTR for editor content - important to prevent reversal */
        .nc-editor-content {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }
        
        /* Force LTR for all content inside editor */
        .nc-editor-content * {
          direction: inherit;
          unicode-bidi: inherit;
        }
        
        /* Special class for LTR content */
        .nc-ltr-content {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: normal !important;
        }
        
        /* Only use RTL when explicitly needed */
        .nc-rtl-text {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: embed !important;
        }

        /* Ensure tables have visible borders by default */
        .nc-editor-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          border: 1px solid #cbd5e1;
        }
        
        .nc-editor-content th,
        .nc-editor-content td {
          border: 1px solid #cbd5e1;
          padding: 0.5rem;
        }
        
        .nc-editor-content th {
          background-color: #f1f5f9;
          font-weight: 500;
        }
        
        /* Style for comment blocks */
        .nc-editor-content .nc-comment {
          margin: 1rem 0;
          padding: 0.75rem;
          background-color: #fefce8;
          border-left: 4px solid #facc15;
          border-radius: 0.25rem;
        }
        `)));
}

/**
 * Sanitizes HTML to ensure it's safe and standards-compliant
 *
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML
 */
function sanitizeHtml(html) {
    // For a production application, you would use a proper sanitization library
    // such as DOMPurify. This is a simple placeholder implementation.
    if (!html)
        return "";
    // Create a temporary DOM element to parse and sanitize the HTML
    const tempElement = document.createElement("div");
    tempElement.innerHTML = html;
    tempElement.dir = "ltr"; // Set default direction to LTR
    // Define allowed tags and attributes
    const allowedTags = [
        "p",
        "br",
        "div",
        "span",
        "strong",
        "em",
        "u",
        "s",
        "blockquote",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "pre",
        "code",
    ];
    const allowedAttributes = {
        all: ["class", "style", "id", "dir"],
        a: ["href", "target", "rel"],
        img: ["src", "alt", "width", "height"],
        td: ["colspan", "rowspan"],
        th: ["colspan", "rowspan"],
        div: ["contenteditable", "data-*", "dir"],
        table: ["contenteditable"],
        pre: ["data-language"],
        code: ["data-language"],
    };
    // Recursively sanitize the element and its children
    sanitizeNode(tempElement, allowedTags, allowedAttributes);
    return tempElement.innerHTML;
}
/**
 * Sanitize a DOM node and its children
 */
function sanitizeNode(node, allowedTags, allowedAttributes) {
    // Process all child nodes recursively
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child;
            const tagName = childElement.tagName.toLowerCase();
            // If this tag is not allowed, replace it with its contents
            if (!allowedTags.includes(tagName)) {
                // Create a document fragment to hold the child's contents
                const fragment = document.createDocumentFragment();
                while (childElement.firstChild) {
                    fragment.appendChild(childElement.firstChild);
                }
                // Replace the element with its children
                node.replaceChild(fragment, childElement);
                continue;
            }
            // Filter attributes
            const attributesToRemove = [];
            for (const attr of Array.from(childElement.attributes)) {
                const attrName = attr.name;
                // Check if this attribute is allowed for this tag
                const allowedForTag = allowedAttributes[tagName] || [];
                const allowedForAll = allowedAttributes.all || [];
                // Special case for data-* attributes on divs
                const isDataAttrOnDiv = tagName === "div" &&
                    allowedAttributes.div.includes("data-*") &&
                    attrName.startsWith("data-");
                if (!allowedForAll.includes(attrName) &&
                    !allowedForTag.includes(attrName) &&
                    !isDataAttrOnDiv) {
                    attributesToRemove.push(attrName);
                }
            }
            // Remove disallowed attributes
            for (const attrName of attributesToRemove) {
                childElement.removeAttribute(attrName);
            }
            // Process this element's children
            sanitizeNode(childElement, allowedTags, allowedAttributes);
        }
    }
}
/**
 * Compares two HTML strings for semantic equivalence
 * This is useful for determining if the content has changed meaningfully
 *
 * @param html1 First HTML string to compare
 * @param html2 Second HTML string to compare
 * @returns true if the HTML strings are semantically equivalent
 */
function areHtmlEquivalent(html1, html2) {
    if (html1 === html2)
        return true;
    // Create DOM elements to compare their content
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    div1.innerHTML = sanitizeHtml(html1);
    div2.innerHTML = sanitizeHtml(html2);
    // Normalize both elements to remove inconsistencies
    normalizeElement(div1);
    normalizeElement(div2);
    // Compare the normalized HTML
    return div1.innerHTML === div2.innerHTML;
}
/**
 * Normalize an element by removing unnecessary whitespace
 * and normalizing text nodes
 *
 * @param element Element to normalize
 */
function normalizeElement(element) {
    // Handle text nodes
    if (element.childNodes) {
        Array.from(element.childNodes).forEach((node) => {
            var _a;
            if (node.nodeType === Node.TEXT_NODE) {
                // Normalize text nodes by collapsing whitespace
                node.textContent = ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, " ").trim()) || "";
            }
            else if (node.nodeType === Node.ELEMENT_NODE) {
                // Recursively normalize child elements
                normalizeElement(node);
            }
        });
    }
    // Remove empty text nodes
    Array.from(element.childNodes).forEach((node) => {
        var _a;
        if (node.nodeType === Node.TEXT_NODE && ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === "") {
            element.removeChild(node);
        }
    });
}

/**
 * Creates a table element with the specified number of rows and columns
 *
 * @param rows Number of rows in the table
 * @param cols Number of columns in the table
 * @returns HTML string for the table
 */
function createTableElement(rows, cols) {
    let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0; border: 1px solid #cbd5e1;">';
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
function mergeCells(editorElement, direction) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
        return;
    // Get the selected range
    const range = selection.getRangeAt(0);
    // Find the table containing the selection
    let currentNode = range.commonAncestorContainer;
    let table = null;
    let targetCells = [];
    // Traverse up to find table
    while (currentNode && currentNode !== editorElement) {
        if (currentNode.nodeName === "TABLE") {
            table = currentNode;
            break;
        }
        currentNode = currentNode.parentNode;
    }
    if (!table)
        return;
    // Find all selected cells
    table.querySelectorAll("th, td");
    const startCell = findClosestCell(range.startContainer);
    const endCell = findClosestCell(range.endContainer);
    if (!startCell || !endCell)
        return;
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
        const rowCells = Array.from((startRow === null || startRow === void 0 ? void 0 : startRow.cells) || []);
        const startIndex = rowCells.indexOf(startCell);
        const endIndex = rowCells.indexOf(endCell);
        if (startIndex < 0 || endIndex < 0)
            return;
        const minIndex = Math.min(startIndex, endIndex);
        const maxIndex = Math.max(startIndex, endIndex);
        for (let i = minIndex; i <= maxIndex; i++) {
            targetCells.push(rowCells[i]);
        }
        // Set colspan on the first cell
        if (targetCells.length > 0) {
            const firstCell = targetCells[0];
            const totalColspan = targetCells.reduce((sum, cell) => sum + parseInt(cell.getAttribute("colspan") || "1", 10), 0);
            firstCell.setAttribute("colspan", totalColspan.toString());
            // Remove other cells
            for (let i = 1; i < targetCells.length; i++) {
                targetCells[i].remove();
            }
        }
    }
    else if (direction === "vertical") {
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
            const totalRowspan = targetCells.reduce((sum, cell) => sum + parseInt(cell.getAttribute("rowspan") || "1", 10), 0);
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
function findClosestCell(node) {
    if (!node)
        return null;
    let current = node;
    while (current) {
        if (current.nodeType === Node.ELEMENT_NODE &&
            (current.nodeName === "TD" || current.nodeName === "TH")) {
            return current;
        }
        current = current.parentNode;
    }
    return null;
}
/**
 * Helper function to get the index of a cell within its row
 */
function getCellIndex(cell) {
    const row = cell.parentElement;
    if (!row)
        return -1;
    return Array.from(row.cells).indexOf(cell);
}
/**
 * Helper function to get the index of a row containing a cell
 */
function getRowIndex(cell) {
    var _a;
    const row = cell.parentElement;
    if (!row)
        return -1;
    const table = (_a = row.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
    if (!table)
        return -1;
    return Array.from(table.rows).indexOf(row);
}
/**
 * Insert a row before or after the current row
 */
function insertTableRow(editorElement, position) {
    var _a, _b, _c;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
        return;
    // Find the closest table cell from the selection
    const cell = findClosestCell(selection.anchorNode);
    if (!cell)
        return;
    // Find the row containing the cell
    const row = cell.parentElement;
    if (!row)
        return;
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
        (_a = row.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(newRow, row);
    }
    else {
        if (row.nextSibling) {
            (_b = row.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(newRow, row.nextSibling);
        }
        else {
            (_c = row.parentNode) === null || _c === void 0 ? void 0 : _c.appendChild(newRow);
        }
    }
}
/**
 * Insert a column before or after the current column
 */
function insertTableColumn(editorElement, position) {
    var _a, _b;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
        return;
    // Find the closest table cell from the selection
    const cell = findClosestCell(selection.anchorNode);
    if (!cell)
        return;
    // Get the index of the current cell
    const cellIndex = getCellIndex(cell);
    if (cellIndex === -1)
        return;
    // Find the table containing the cell
    let currentNode = cell;
    let table = null;
    while (currentNode && currentNode !== editorElement) {
        if (currentNode.nodeName === "TABLE") {
            table = currentNode;
            break;
        }
        currentNode = currentNode.parentNode;
    }
    if (!table)
        return;
    // Calculate the target index for the new column
    const targetIndex = position === "before" ? cellIndex : cellIndex + 1;
    // Insert a new cell in each row at the target index
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const newCell = document.createElement(i === 0 && ((_a = row.parentElement) === null || _a === void 0 ? void 0 : _a.nodeName) === "THEAD" ? "th" : "td");
        newCell.innerHTML = "&nbsp;";
        if (i === 0 && ((_b = row.parentElement) === null || _b === void 0 ? void 0 : _b.nodeName) === "THEAD") {
            newCell.style.cssText =
                "border: 1px solid #cbd5e1; padding: 0.5rem; background-color: #f1f5f9; font-weight: 500;";
        }
        else {
            newCell.style.cssText = "border: 1px solid #cbd5e1; padding: 0.5rem;";
        }
        // Insert at the correct position
        if (targetIndex >= row.cells.length) {
            row.appendChild(newCell);
        }
        else {
            row.insertBefore(newCell, row.cells[targetIndex]);
        }
    }
}
/**
 * Delete the current row
 */
function deleteTableRow(editorElement) {
    var _a, _b;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
        return;
    // Find the closest table cell from the selection
    const cell = findClosestCell(selection.anchorNode);
    if (!cell)
        return;
    // Find the row containing the cell
    const row = cell.parentElement;
    if (!row)
        return;
    // Don't delete if it's the only row in the table
    if (((_a = row.parentElement) === null || _a === void 0 ? void 0 : _a.rows.length) === 1)
        return;
    // Delete the row
    (_b = row.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(row);
}
/**
 * Delete the current column
 */
function deleteTableColumn(editorElement) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0)
        return;
    // Find the closest table cell from the selection
    const cell = findClosestCell(selection.anchorNode);
    if (!cell)
        return;
    // Get the index of the current cell
    const cellIndex = getCellIndex(cell);
    if (cellIndex === -1)
        return;
    // Find the table containing the cell
    let currentNode = cell;
    let table = null;
    while (currentNode && currentNode !== editorElement) {
        if (currentNode.nodeName === "TABLE") {
            table = currentNode;
            break;
        }
        currentNode = currentNode.parentNode;
    }
    if (!table)
        return;
    // Don't delete if it's the only column in the table
    if (table.rows[0].cells.length === 1)
        return;
    // Delete the cell at the specified index in each row
    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        if (cellIndex < row.cells.length) {
            row.deleteCell(cellIndex);
        }
    }
}

/**
 * Handles inserting images into the editor content
 *
 * @param file Optional file to insert as base64
 * @param url Optional URL to insert
 * @param execCommand Function to execute editor commands
 */
function insertImage(file, url, execCommand) {
    if (!file && !url)
        return;
    if (file) {
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            if ((_a = e.target) === null || _a === void 0 ? void 0 : _a.result) {
                const dataUrl = e.target.result.toString();
                const imageHtml = createResizableImageHtml(dataUrl, file.name);
                execCommand("insertHTML", imageHtml);
            }
        };
        reader.readAsDataURL(file);
    }
    else if (url) {
        const imageHtml = createResizableImageHtml(url, "image");
        execCommand("insertHTML", imageHtml);
    }
}
/**
 * Creates HTML for a resizable image
 *
 * @param src Image source (URL or data URL)
 * @param alt Alternative text for the image
 * @returns HTML string for the resizable image
 */
function createResizableImageHtml(src, alt) {
    return `
    <div class="nc-image-container" contenteditable="false" style="display: inline-block; position: relative; margin: 5px;">
      <img src="${src}" alt="${alt}" class="nc-image" style="display: block; max-width: 100%;" />
      <div class="nc-image-resize-handle" contenteditable="false" style="
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 12px;
        height: 12px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: nwse-resize;
        z-index: 100;
      "></div>
      <div class="nc-image-size-indicator" style="
        position: absolute;
        bottom: -20px;
        right: 0;
        background-color: rgba(0,0,0,0.6);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 3px;
        display: none;
      "></div>
    </div>
  `;
}
/**
 * Initialize image resizing functionality for all images in the editor
 *
 * @param editorElement The editor DOM element
 * @returns A cleanup function to remove event listeners
 */
function initImageResizing(editorElement) {
    let activeResizeHandle = null;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let currentImage = null;
    let sizeIndicator = null;
    const handleMouseDown = (e) => {
        const target = e.target;
        if (target.classList.contains("nc-image-resize-handle")) {
            e.preventDefault();
            e.stopPropagation();
            // Get the parent container and image
            const container = target.closest(".nc-image-container");
            currentImage = container.querySelector(".nc-image");
            sizeIndicator = container.querySelector(".nc-image-size-indicator");
            if (currentImage) {
                activeResizeHandle = target;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = currentImage.offsetWidth;
                startHeight = currentImage.offsetHeight;
                // Show size indicator
                if (sizeIndicator) {
                    sizeIndicator.style.display = "block";
                    updateSizeIndicator(currentImage.offsetWidth, currentImage.offsetHeight);
                }
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
            }
        }
    };
    const handleMouseMove = (e) => {
        if (!activeResizeHandle || !currentImage)
            return;
        e.preventDefault();
        // Calculate the new width and height
        const deltaX = e.clientX - startX;
        e.clientY - startY;
        // Maintain aspect ratio while resizing (optional)
        const aspectRatio = startWidth / startHeight;
        // Calculate new dimensions (you can modify this logic based on your needs)
        const newWidth = Math.max(30, startWidth + deltaX);
        const newHeight = Math.max(30, newWidth / aspectRatio);
        // Apply the new dimensions to the image
        currentImage.style.width = `${newWidth}px`;
        currentImage.style.height = `${newHeight}px`;
        // Update size indicator if present
        if (sizeIndicator) {
            updateSizeIndicator(newWidth, newHeight);
        }
    };
    const handleMouseUp = (e) => {
        if (activeResizeHandle) {
            e.preventDefault();
            // Hide size indicator
            if (sizeIndicator) {
                sizeIndicator.style.display = "none";
            }
            // Reset state
            activeResizeHandle = null;
            currentImage = null;
            sizeIndicator = null;
            // Remove event listeners
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }
    };
    // Helper function to update the size indicator text
    const updateSizeIndicator = (width, height) => {
        if (sizeIndicator) {
            sizeIndicator.textContent = `${Math.round(width)} × ${Math.round(height)}`;
        }
    };
    // Add event listener for mousedown to detect resize handle clicks
    editorElement.addEventListener("mousedown", handleMouseDown);
    // Return a cleanup function
    return () => {
        editorElement.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };
}

/**
 * Handles inserting comment blocks into the editor content
 *
 * @param comment The comment text to insert
 * @param execCommand Function to execute editor commands
 */
function insertComment(comment, execCommand) {
    if (!comment)
        return;
    const commentHtml = `
    <div class="nc-comment my-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
      <div class="text-sm text-gray-700">
        <span class="font-medium">Comment:</span> ${escapeHtml$1(comment)}
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
function escapeHtml$1(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Handles inserting code blocks into the editor content
 *
 * @param code The code content to insert
 * @param language The programming language for syntax highlighting
 * @param execCommand Function to execute editor commands
 */
function insertCodeBlock(code, language, execCommand) {
    if (!code)
        return;
    const codeHtml = `
    <pre class="nc-code-block bg-gray-100 rounded-md p-4 my-4 overflow-x-auto">
      <code class="language-${language} text-sm font-mono">${escapeHtml(code)}</code>
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
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function NCEditor({ value, onChange, placeholder, className, readOnly = false, autoInsertTable = false, defaultFontFamily = "Arial, sans-serif", defaultFontSize = "16px", defaultTextColor = "#000000", defaultBackgroundColor = "", showWordCount = false, }) {
    const direction = "ltr"; // Set default direction
    const editorRef = React.useRef(null);
    const editorContainerRef = React.useRef(null);
    const [sourceView, setSourceView] = React.useState(false);
    const [sourceContent, setSourceContent] = React.useState("");
    const [focus, setFocus] = React.useState(false);
    const [originalContent, setOriginalContent] = React.useState(""); // Store original content
    const [hasInitialized, setHasInitialized] = React.useState(false);
    const [isContentModified, setIsContentModified] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [wordStats, setWordStats] = React.useState({ words: 0, characters: 0 });
    // Initialize editor content
    React.useEffect(() => {
        if (editorRef.current && value && !hasInitialized) {
            const cleanHtml = sanitizeHtml(value);
            editorRef.current.innerHTML = cleanHtml;
            // Apply default font settings
            editorRef.current.style.fontFamily = defaultFontFamily;
            editorRef.current.style.fontSize = defaultFontSize;
            editorRef.current.style.color = defaultTextColor;
            editorRef.current.dir = "ltr"; // Set default direction to LTR
            if (defaultBackgroundColor) {
                editorRef.current.style.backgroundColor = defaultBackgroundColor;
            }
            setOriginalContent(cleanHtml); // Store initial sanitized content
            setHasInitialized(true);
        }
    }, [
        value,
        hasInitialized,
        defaultFontFamily,
        defaultFontSize,
        defaultTextColor,
        defaultBackgroundColor,
    ]);
    // Initialize image resizing functionality
    React.useEffect(() => {
        if (editorRef.current && !sourceView && !readOnly) {
            // Initialize image resizing and store cleanup function
            const cleanupResizing = initImageResizing(editorRef.current);
            // Cleanup on unmount or when switching to source view
            return cleanupResizing;
        }
    }, [sourceView, readOnly]);
    // Handle fullscreen mode
    React.useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener("keydown", handleEscapeKey);
        // Prevent scrolling on body when fullscreen
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        }
        else {
            document.body.style.overflow = "";
        }
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
            document.body.style.overflow = "";
        };
    }, [isFullscreen]);
    // Toggle fullscreen mode
    const toggleFullscreen = React.useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);
    // Auto-insert table if needed
    React.useEffect(() => {
        if (autoInsertTable && editorRef.current && !sourceView && hasInitialized) {
            setTimeout(() => {
                handleInsertTable(2, 2);
            }, 100); // Small delay to ensure editor is ready
        }
    }, [autoInsertTable, hasInitialized]);
    // Helper function to insert content at the current selection or at the end
    const insertAtCursor = (html) => {
        if (!editorRef.current)
            return;
        // Focus the editor if not already focused
        editorRef.current.focus();
        // Get the current selection
        const selection = window.getSelection();
        // If there's no selection or it's not in our editor, append to the end
        if (!selection ||
            !selection.rangeCount ||
            !editorRef.current.contains(selection.anchorNode)) {
            editorRef.current.innerHTML += html;
            return;
        }
        // Insert at the current selection
        const range = selection.getRangeAt(0);
        // Create a temporary element to hold our HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        // Insert each child node from our temp div
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        // Insert the fragment and collapse the selection
        range.deleteContents();
        range.insertNode(fragment);
        range.collapse(false);
        // Force update content
        handleContentChange();
    };
    // Execute commands on the contentEditable element
    const execCommand = React.useCallback((command, value) => {
        if (readOnly)
            return; // Don't execute commands in readOnly mode
        // Handle source view differently
        if (sourceView) {
            console.log("Cannot execute commands in source view");
            return;
        }
        // Focus the element to ensure commands apply to our editor
        if (editorRef.current) {
            editorRef.current.focus();
        }
        if (document.execCommand) {
            try {
                // Execute the command and update content
                const success = document.execCommand(command, false, value);
                if (success) {
                    handleContentChange();
                }
                else {
                    console.warn(`Command ${command} failed`);
                }
            }
            catch (error) {
                console.error(`Error executing command ${command}:`, error);
            }
        }
        else {
            console.warn("document.execCommand is not available");
        }
    }, [sourceView, readOnly]);
    // Handle source view content changes
    const handleSourceChange = React.useCallback((e) => {
        setSourceContent(e.target.value);
        // Check if content is different from the original
        const isDifferent = !areHtmlEquivalent(originalContent, e.target.value);
        setIsContentModified(isDifferent);
    }, [originalContent]);
    // Handle toggling source view
    React.useEffect(() => {
        if (!editorRef.current)
            return;
        if (sourceView) {
            // Update source content with current HTML
            const content = editorRef.current.innerHTML;
            setSourceContent(content);
            setOriginalContent(content); // Store original when switching to source
            setIsContentModified(false);
        }
        else {
            // Update editor content from source (if changed)
            if (isContentModified && sourceContent !== editorRef.current.innerHTML) {
                const cleanHtml = sanitizeHtml(sourceContent);
                editorRef.current.innerHTML = cleanHtml;
                handleContentChange();
                setIsContentModified(false);
            }
        }
    }, [sourceView]);
    // Content change handler
    const handleContentChange = React.useCallback(() => {
        if (!editorRef.current)
            return;
        // Get the current content
        const content = sourceView ? sourceContent : editorRef.current.innerHTML;
        // Clean HTML before updating
        const cleanHtml = sanitizeHtml(content);
        // Update word count stats if needed
        if (showWordCount) {
            const textContent = editorRef.current.textContent || "";
            const words = textContent.trim().split(/\s+/).filter(Boolean).length;
            const characters = textContent.length;
            setWordStats({ words, characters });
        }
        // Call onChange with the cleaned HTML
        onChange(cleanHtml);
    }, [sourceView, sourceContent, onChange, showWordCount]);
    // Revert content in source view
    const handleRevertContent = React.useCallback(() => {
        if (sourceView) {
            setSourceContent(originalContent);
            setIsContentModified(false);
        }
    }, [sourceView, originalContent]);
    // Handle focus events
    const handleFocus = React.useCallback(() => {
        setFocus(true);
    }, []);
    // Handle blur events
    const handleBlur = React.useCallback(() => {
        setFocus(false);
    }, []);
    // Direct table insertion - bypassing execCommand for reliability
    const handleInsertTable = (rows, cols) => {
        if (editorRef.current) {
            try {
                // Create the table HTML
                const tableHtml = createTableElement(rows, cols);
                // Insert directly at cursor or end of editor
                insertAtCursor(tableHtml);
                // Force update with a small delay to ensure DOM is updated
                setTimeout(() => {
                    if (editorRef.current) {
                        // Make sure changes are registered
                        const event = new Event("input", { bubbles: true });
                        editorRef.current.dispatchEvent(event);
                        handleContentChange();
                        editorRef.current.focus();
                    }
                }, 10);
            }
            catch (error) {
                console.error("Error inserting table:", error);
                // Fallback to execCommand if direct insertion fails
                execCommand("insertHTML", createTableElement(rows, cols));
            }
        }
    };
    // Handle inserting an image (from file or URL)
    const handleInsertImage = (file, url) => {
        if (editorRef.current) {
            insertImage(file, url, execCommand);
        }
    };
    // Direct comment insertion
    const handleInsertComment = (comment) => {
        if (!comment || !editorRef.current)
            return;
        try {
            // Create comment HTML directly
            const commentHtml = `
        <div class="nc-comment my-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div class="text-sm text-gray-700">
            <span class="font-medium">Comment:</span> ${comment}
          </div>
        </div>
      `;
            // Insert directly at cursor or end of editor
            insertAtCursor(commentHtml);
            // Force update with a small delay to ensure DOM is updated
            setTimeout(() => {
                if (editorRef.current) {
                    // Make sure changes are registered
                    const event = new Event("input", { bubbles: true });
                    editorRef.current.dispatchEvent(event);
                    handleContentChange();
                    editorRef.current.focus();
                }
            }, 10);
        }
        catch (error) {
            console.error("Error inserting comment:", error);
            // Fallback to using the utility function with execCommand
            insertComment(comment, execCommand);
        }
    };
    // Handle inserting a code block
    const handleInsertCode = (code, language) => {
        if (editorRef.current) {
            insertCodeBlock(code, language, execCommand);
        }
    };
    // Handle table cell merging
    const handleMergeTableCells = (direction) => {
        if (editorRef.current) {
            mergeCells(editorRef.current, direction);
            handleContentChange();
        }
    };
    // Handle table row insertion
    const handleInsertTableRow = (position) => {
        if (editorRef.current) {
            insertTableRow(editorRef.current, position);
            handleContentChange();
        }
    };
    // Handle table column insertion
    const handleInsertTableColumn = (position) => {
        if (editorRef.current) {
            insertTableColumn(editorRef.current, position);
            handleContentChange();
        }
    };
    // Handle table row deletion
    const handleDeleteTableRow = () => {
        if (editorRef.current) {
            deleteTableRow(editorRef.current);
            handleContentChange();
        }
    };
    // Handle table column deletion
    const handleDeleteTableColumn = () => {
        if (editorRef.current) {
            deleteTableColumn(editorRef.current);
            handleContentChange();
        }
    };
    return (React.createElement("div", { ref: editorContainerRef, className: cn("nc-editor border rounded-md overflow-hidden relative", focus && "ring-2 ring-ring ring-offset-2", isFullscreen && "fixed inset-0 z-50 bg-white rounded-none border-none", className), style: isFullscreen ? { width: "100vw", height: "100vh" } : undefined },
        React.createElement(NCEditorToolbar, { execCommand: execCommand, editorRef: editorRef, insertTable: handleInsertTable, insertImage: handleInsertImage, insertComment: handleInsertComment, insertCode: handleInsertCode, sourceView: sourceView, setSourceView: setSourceView, readOnly: readOnly, onRevertContent: handleRevertContent, hasChanges: isContentModified && sourceView, isFullscreen: isFullscreen, toggleFullscreen: toggleFullscreen, mergeCells: handleMergeTableCells, insertTableRow: handleInsertTableRow, insertTableColumn: handleInsertTableColumn, deleteTableRow: handleDeleteTableRow, deleteTableColumn: handleDeleteTableColumn }),
        React.createElement(NCEditorContent, { editorRef: editorRef, sourceView: sourceView, sourceContent: sourceContent, handleSourceChange: handleSourceChange, handleContentChange: handleContentChange, handleFocus: handleFocus, handleBlur: handleBlur, placeholder: placeholder, direction: direction, readOnly: readOnly, isFullscreen: isFullscreen }),
        showWordCount && (React.createElement("div", { className: "p-2 text-xs text-gray-500 border-t" },
            wordStats.words,
            " words | ",
            wordStats.characters,
            " characters"))));
}

exports.NCEditor = NCEditor;
exports.NCEditorContent = NCEditorContent;
exports.NCEditorToolbar = NCEditorToolbar;
exports.areHtmlEquivalent = areHtmlEquivalent;
exports.createTableElement = createTableElement;
exports.deleteTableColumn = deleteTableColumn;
exports.deleteTableRow = deleteTableRow;
exports.initImageResizing = initImageResizing;
exports.insertCodeBlock = insertCodeBlock;
exports.insertComment = insertComment;
exports.insertImage = insertImage;
exports.insertTableColumn = insertTableColumn;
exports.insertTableRow = insertTableRow;
exports.mergeCells = mergeCells;
exports.sanitizeHtml = sanitizeHtml;
//# sourceMappingURL=index.js.map
