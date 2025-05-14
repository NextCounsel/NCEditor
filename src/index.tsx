import React, { useState, useCallback, useRef, useEffect } from "react";
import { NCEditorToolbar } from "./nc-editor-toolbar";
import { NCEditorContent } from "./nc-editor-content";
import { useDirection } from "@/lib/direction-context";
import { sanitizeHtml, areHtmlEquivalent } from "./utils/sanitize";
import {
  createTableElement,
  mergeCells,
  insertTableRow,
  insertTableColumn,
  deleteTableRow,
  deleteTableColumn,
} from "./utils/table";
import { insertImage, initImageResizing } from "./utils/image";
import { insertComment } from "./utils/comment";
import { insertCodeBlock } from "./utils/code";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, ArrowRightIcon, XIcon } from "lucide-react";

export interface NCEditorProps {
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

export function NCEditor({
  value,
  onChange,
  placeholder,
  className,
  readOnly = false,
  autoInsertTable = false,
  defaultFontFamily = "Arial, sans-serif",
  defaultFontSize = "16px",
  defaultTextColor = "#000000",
  defaultBackgroundColor = "",
  showWordCount = false,
}: NCEditorProps) {
  const { direction = "ltr" } = useDirection() || {};
  const editorRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [sourceView, setSourceView] = useState(false);
  const [sourceContent, setSourceContent] = useState("");
  const [focus, setFocus] = useState(false);
  const [originalContent, setOriginalContent] = useState(""); // Store original content
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isContentModified, setIsContentModified] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordStats, setWordStats] = useState({ words: 0, characters: 0 });
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findResults, setFindResults] = useState({ current: 0, total: 0 });

  // Initialize editor content
  useEffect(() => {
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
  useEffect(() => {
    if (editorRef.current && !sourceView && !readOnly) {
      // Initialize image resizing and store cleanup function
      const cleanupResizing = initImageResizing(editorRef.current);

      // Cleanup on unmount or when switching to source view
      return cleanupResizing;
    }
  }, [sourceView, readOnly]);

  // Handle fullscreen mode
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    // Prevent scrolling on body when fullscreen
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Auto-insert table if needed
  useEffect(() => {
    if (autoInsertTable && editorRef.current && !sourceView && hasInitialized) {
      setTimeout(() => {
        handleInsertTable(2, 2);
      }, 100); // Small delay to ensure editor is ready
    }
  }, [autoInsertTable, hasInitialized]);

  // Helper function to insert content at the current selection or at the end
  const insertAtCursor = (html: string) => {
    if (!editorRef.current) return;

    // Focus the editor if not already focused
    editorRef.current.focus();

    // Get the current selection
    const selection = window.getSelection();

    // If there's no selection or it's not in our editor, append to the end
    if (
      !selection ||
      !selection.rangeCount ||
      !editorRef.current.contains(selection.anchorNode)
    ) {
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

  // Apply styling to selected text
  const applyStyle = (property: string, value: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // If we have a valid selection range
      if (!range.collapsed) {
        try {
          // Create a span with the style
          const span = document.createElement("span");

          // Use type-safe way to set style
          if (property === "fontFamily") {
            span.style.fontFamily = value;
          } else if (property === "fontSize") {
            span.style.fontSize = value;
          } else if (property === "color") {
            span.style.color = value;
          } else if (property === "backgroundColor") {
            span.style.backgroundColor = value;
          }

          // Surround the selected content with our styled span
          range.surroundContents(span);
          handleContentChange();
        } catch (e) {
          console.error("Error applying style:", e);
          // Fallback to exec command
          execCommand("styleWithCSS", "true");
          execCommand("fontSize", value);
        }
      } else {
        // No selection, apply to the whole editor
        if (property === "fontFamily") {
          editorRef.current.style.fontFamily = value;
        } else if (property === "fontSize") {
          editorRef.current.style.fontSize = value;
        } else if (property === "color") {
          editorRef.current.style.color = value;
        } else if (property === "backgroundColor") {
          editorRef.current.style.backgroundColor = value;
        }
        handleContentChange();
      }
    }
  };

  // Handle the focus and blur states
  const handleFocus = useCallback(() => {
    setFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocus(false);
  }, []);

  // Toggle between visual and source views with improved content preservation
  useEffect(() => {
    if (sourceView && editorRef.current) {
      // Switching to source view - preserve original HTML without extra sanitization
      const currentHtml = editorRef.current.innerHTML;
      setSourceContent(currentHtml);
      setOriginalContent(currentHtml); // Store for potential recovery
    } else if (!sourceView && editorRef.current) {
      // Switching to visual view
      if (
        isContentModified &&
        !areHtmlEquivalent(sourceContent, originalContent)
      ) {
        // Only sanitize when source has been substantially modified
        try {
          const cleanHtml = sanitizeHtml(sourceContent);
          editorRef.current.innerHTML = cleanHtml;
          handleContentChange();
        } catch (error) {
          console.error("Error parsing HTML from source view:", error);
          // Recovery: use last known good content
          editorRef.current.innerHTML = originalContent;
          handleContentChange();
        }
      } else {
        // No significant changes in source view, use original content
        editorRef.current.innerHTML = originalContent;
      }
      setIsContentModified(false);
    }
  }, [sourceView, isContentModified, originalContent, sourceContent]);

  // Update content when in source view
  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceContent(e.target.value);
    setIsContentModified(true);
  };

  // Update parent component on content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setOriginalContent(newContent); // Store unsanitized content for view switching
      onChange(sanitizeHtml(newContent)); // Sanitize only when sending to parent
    }
  }, [onChange]);

  // Executes a command on the document
  const execCommand = useCallback(
    (command: string, value?: string) => {
      if (!command) return; // Skip empty commands

      // Special handling for formatBlock commands (headings, etc.)
      if (command === "formatBlock" && value) {
        try {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);

            // Remove any existing heading/block formatting from selected content
            const parentBlock = getParentBlock(range.startContainer);
            if (parentBlock) {
              // Get the parent block tag name
              const currentTag = parentBlock.tagName.toLowerCase();

              // If applying the same format, remove it (toggle behavior)
              if (currentTag === value.toLowerCase()) {
                // Replace with a paragraph instead
                document.execCommand("formatBlock", false, "p");
              } else {
                // Apply the new format
                document.execCommand(command, false, value);
              }
            } else {
              // No formatting yet, apply the new format
              document.execCommand(command, false, value);
            }
          }
        } catch (e) {
          console.error("Error applying block format:", e);
          // Fallback to standard execCommand
          document.execCommand(command, false, value);
        }
      } else {
        // Standard execution for other commands
        document.execCommand(command, false, value);
      }

      handleContentChange();
      editorRef.current?.focus();
    },
    [handleContentChange]
  );

  // Helper function to get the closest block-level parent element
  const getParentBlock = (node: Node | null): HTMLElement | null => {
    if (!node) return null;

    const blockElements = [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "div",
      "ul",
      "ol",
      "li",
    ];

    let current: Node | null = node;
    while (current && current !== editorRef.current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        if (blockElements.includes(tagName)) {
          return element;
        }
      }
      current = current.parentNode;
    }

    return null;
  };

  // Direct table insertion - bypassing execCommand for reliability
  const handleInsertTable = (rows: number, cols: number) => {
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
      } catch (error) {
        console.error("Error inserting table:", error);
        // Fallback to execCommand if direct insertion fails
        execCommand("insertHTML", createTableElement(rows, cols));
      }
    }
  };

  // Handle inserting an image (from file or URL)
  const handleInsertImage = (file: File | null, url: string | null) => {
    if (editorRef.current) {
      insertImage(file, url, execCommand);
    }
  };

  // Direct comment insertion - bypassing execCommand for reliability
  const handleInsertComment = (comment: string) => {
    if (!comment || !editorRef.current) return;

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
    } catch (error) {
      console.error("Error inserting comment:", error);
      // Fallback to using the utility function with execCommand
      insertComment(comment, execCommand);
    }
  };

  // Handle inserting a code block
  const handleInsertCode = (code: string, language: string) => {
    if (editorRef.current) {
      insertCodeBlock(code, language, execCommand);
    }
  };

  // Handle table cell merging
  const handleMergeTableCells = (direction: "horizontal" | "vertical") => {
    if (editorRef.current) {
      mergeCells(editorRef.current, direction);
      handleContentChange();
    }
  };

  // Handle table row insertion
  const handleInsertTableRow = (position: "before" | "after") => {
    if (editorRef.current) {
      insertTableRow(editorRef.current, position);
      handleContentChange();
    }
  };

  // Handle table column insertion
  const handleInsertTableColumn = (position: "before" | "after") => {
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

  // Method to revert to original content if needed
  const handleRevertContent = () => {
    if (editorRef.current && originalContent) {
      editorRef.current.innerHTML = originalContent;
      handleContentChange();
    }
  };

  // Apply font family to selection or whole editor
  const handleFontFamily = (fontFamily: string) => {
    applyStyle("fontFamily", fontFamily);
  };

  // Apply font size to selection or whole editor
  const handleFontSize = (fontSize: string) => {
    applyStyle("fontSize", fontSize);
  };

  // Apply text color to selection or whole editor
  const handleTextColor = (color: string) => {
    applyStyle("color", color);
  };

  // Apply background color to selection or whole editor
  const handleBackgroundColor = (color: string) => {
    if (color === "transparent") {
      // Handle removing background color
      const selection = window.getSelection();
      if (
        selection &&
        selection.rangeCount > 0 &&
        !selection.getRangeAt(0).collapsed
      ) {
        // For selected text, create a span with no background
        const range = selection.getRangeAt(0);
        const span = document.createElement("span");
        span.style.backgroundColor = "transparent";
        try {
          range.surroundContents(span);
          handleContentChange();
        } catch (e) {
          console.error("Error removing background color:", e);
          execCommand("hiliteColor", "transparent");
        }
      } else if (editorRef.current) {
        // For the whole editor
        editorRef.current.style.backgroundColor = "transparent";
        handleContentChange();
      }
    } else {
      // Normal background color application
      applyStyle("backgroundColor", color);
    }
  };

  // Handle text direction change
  const handleTextDirection = (direction: "ltr" | "rtl") => {
    if (!editorRef.current) return;

    // For LTR - apply to the whole editor
    if (direction === "ltr") {
      editorRef.current.setAttribute("dir", "ltr");
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.textAlign = "left";
      editorRef.current.style.unicodeBidi = "normal";
      editorRef.current.className =
        editorRef.current.className.replace(/nc-rtl-content/g, "") +
        " nc-ltr-content";
      handleContentChange();
      return;
    }

    // For RTL - create a special container for the current selection or paragraph
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);

    // If it's just a cursor position, find the current paragraph/block
    if (range.collapsed) {
      // Get the current block element
      let node = range.startContainer;
      while (node && node !== editorRef.current) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI"].includes(
            (node as Element).tagName
          )
        ) {
          // Found a block element, apply RTL to it
          const blockElement = node as HTMLElement;
          blockElement.setAttribute("dir", "rtl");
          blockElement.style.direction = "rtl";
          blockElement.style.textAlign = "right";
          blockElement.style.unicodeBidi = "embed";
          blockElement.className = blockElement.className + " nc-rtl-text";
          handleContentChange();
          return;
        }
        node = node.parentNode;
      }

      // If we didn't find a specific block, wrap the current text node in a span
      const span = document.createElement("span");
      span.setAttribute("dir", "rtl");
      span.style.direction = "rtl";
      span.style.textAlign = "right";
      span.style.unicodeBidi = "embed";
      span.className = "nc-rtl-text";

      try {
        range.surroundContents(span);
        handleContentChange();
      } catch (e) {
        console.error("Error applying RTL:", e);
      }

      return;
    }

    // We have a text selection, wrap it in an RTL container
    const span = document.createElement("span");
    span.setAttribute("dir", "rtl");
    span.style.direction = "rtl";
    span.style.textAlign = "right";
    span.style.unicodeBidi = "embed";
    span.className = "nc-rtl-text";

    try {
      // Extract the selection and wrap it
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      // Update selection to be around our new span
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);

      handleContentChange();
    } catch (e) {
      console.error("Error applying RTL to selection:", e);
    }
  };

  // Calculate word and character count
  useEffect(() => {
    if (showWordCount && editorRef.current) {
      const updateWordCount = () => {
        const text = editorRef.current?.textContent || "";
        const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
        const characters = text.length;
        setWordStats({ words, characters });
      };

      // Initial count
      updateWordCount();

      // Setup observer to watch for content changes
      const observer = new MutationObserver(updateWordCount);
      observer.observe(editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, [showWordCount]);

  // Toggle find/replace panel
  const toggleFindReplace = useCallback(() => {
    setShowFindReplace(!showFindReplace);
  }, [showFindReplace]);

  // Function to find text in editor content
  const findInContent = useCallback(() => {
    if (!editorRef.current || !findText) return;

    // Clear any existing selection
    window.getSelection()?.removeAllRanges();

    // Create a fake element with editor's content for searching
    const contentClone = document.createElement("div");
    contentClone.innerHTML = editorRef.current.innerHTML;

    // Get all text nodes within the clone
    const walker = document.createTreeWalker(
      contentClone,
      NodeFilter.SHOW_TEXT
    );

    const matches = [];
    let node;

    // Find all text nodes containing the search string
    while ((node = walker.nextNode())) {
      const content = node.textContent || "";
      let index = content.toLowerCase().indexOf(findText.toLowerCase());

      while (index !== -1) {
        matches.push({
          node: node,
          index: index,
        });
        index = content
          .toLowerCase()
          .indexOf(findText.toLowerCase(), index + 1);
      }
    }

    setFindResults({
      current: matches.length > 0 ? 1 : 0,
      total: matches.length,
    });

    // If there are matches, select the first one in the actual editor
    if (matches.length > 0) {
      // Find the corresponding node in the actual editor
      const firstMatch = matches[0];

      // Create range to select the text
      const range = document.createRange();
      const textNodes = [];

      // Get all text nodes in the actual editor
      const editorWalker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT
      );
      while (editorWalker.nextNode()) {
        textNodes.push(editorWalker.currentNode);
      }

      // Find the node at the same index as in our match
      if (textNodes[textNodes.indexOf(firstMatch.node)]) {
        const targetNode = textNodes[textNodes.indexOf(firstMatch.node)];
        range.setStart(targetNode, firstMatch.index);
        range.setEnd(targetNode, firstMatch.index + findText.length);

        // Apply the selection
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);

        // Scroll the selection into view
        const rect = range.getBoundingClientRect();
        editorRef.current.scrollTo({
          top: rect.top - editorRef.current.getBoundingClientRect().top - 50,
          behavior: "smooth",
        });
      }
    }
  }, [findText, editorRef]);

  // Function to find next occurrence
  const findNext = useCallback(() => {
    if (!editorRef.current || !findText) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      findInContent();
      return;
    }

    // Get the current range
    const currentRange = selection.getRangeAt(0);

    // Start searching from the end of current selection
    const startNode = currentRange.endContainer;
    const startOffset = currentRange.endOffset;

    // Create a TreeWalker to iterate through all text nodes
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT
    );

    // Position walker at the current node
    let node = startNode;
    while (walker.currentNode !== startNode) {
      if (walker.nextNode() === null) {
        // If we reach the end without finding the start node, start from beginning
        walker.currentNode = editorRef.current;
        walker.nextNode();
        break;
      }
    }

    // Search from current position
    let found = false;
    let loopedAround = false;
    const currentNodeContent = startNode.textContent || "";

    // Check current node first, from offset
    if (startNode.nodeType === Node.TEXT_NODE) {
      const remainingText = currentNodeContent.slice(startOffset);
      const indexInRemaining = remainingText
        .toLowerCase()
        .indexOf(findText.toLowerCase());

      if (indexInRemaining !== -1) {
        // Found in current node
        const range = document.createRange();
        range.setStart(startNode, startOffset + indexInRemaining);
        range.setEnd(
          startNode,
          startOffset + indexInRemaining + findText.length
        );

        selection.removeAllRanges();
        selection.addRange(range);

        // Update current match counter
        setFindResults((prev) => ({
          ...prev,
          current: prev.current < prev.total ? prev.current + 1 : 1,
        }));

        // Scroll into view
        const rect = range.getBoundingClientRect();
        editorRef.current.scrollTo({
          top: rect.top - editorRef.current.getBoundingClientRect().top - 50,
          behavior: "smooth",
        });

        found = true;
      }
    }

    // If not found in current node, continue with the walker
    if (!found) {
      while ((node = walker.nextNode())) {
        // Check if we've looped around
        if (node === startNode) {
          if (loopedAround) {
            break; // We've gone full circle, stop searching
          }
          loopedAround = true;
        }

        const content = node.textContent || "";
        const index = content.toLowerCase().indexOf(findText.toLowerCase());

        if (index !== -1) {
          // Found a match
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + findText.length);

          selection.removeAllRanges();
          selection.addRange(range);

          // Update current match counter
          setFindResults((prev) => ({
            ...prev,
            current: prev.current < prev.total ? prev.current + 1 : 1,
          }));

          // Scroll into view
          const rect = range.getBoundingClientRect();
          editorRef.current.scrollTo({
            top: rect.top - editorRef.current.getBoundingClientRect().top - 50,
            behavior: "smooth",
          });

          found = true;
          break;
        }
      }
    }

    // If still not found and we've wrapped around, restart from beginning
    if (!found && !loopedAround) {
      findInContent(); // Start over from the beginning
    }
  }, [findText, findInContent]);

  // Function to replace current selection with replace text
  const replaceSelection = useCallback(() => {
    if (!editorRef.current || !findText) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // Only replace if selected text matches find text (case insensitive)
    if (selectedText.toLowerCase() === findText.toLowerCase()) {
      // Create a text node with the replacement text
      const replacementNode = document.createTextNode(replaceText);

      // Replace the selected text
      range.deleteContents();
      range.insertNode(replacementNode);

      // Update selection to be after the inserted text
      range.setStartAfter(replacementNode);
      range.setEndAfter(replacementNode);
      selection.removeAllRanges();
      selection.addRange(range);

      // Update editor content and find next
      handleContentChange();
      findNext();
    } else {
      // If current selection doesn't match, find first match
      findInContent();
    }
  }, [findText, replaceText, findNext, handleContentChange, findInContent]);

  // Function to replace all occurrences
  const replaceAll = useCallback(() => {
    if (!editorRef.current || !findText) return;

    // Save original content to check if changes were made
    const originalContent = editorRef.current.innerHTML;

    // Create temporary div with editor content for manipulation
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = originalContent;

    // Get all text nodes
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;

    // Collect all text nodes
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // Process nodes in reverse order to avoid invalidating indices
    let replaced = 0;
    for (let i = textNodes.length - 1; i >= 0; i--) {
      const node = textNodes[i];
      const content = node.textContent || "";

      // Replace all occurrences in this node
      if (content.toLowerCase().includes(findText.toLowerCase())) {
        // Use regex for case-insensitive replacement
        const regex = new RegExp(
          findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi"
        );
        const newContent = content.replace(regex, () => {
          replaced++;
          return replaceText;
        });

        node.textContent = newContent;
      }
    }

    // Update editor content if changes were made
    if (replaced > 0) {
      editorRef.current.innerHTML = tempDiv.innerHTML;
      handleContentChange();

      // Update find results
      setFindResults({ current: 0, total: 0 });

      // Show a message or notification about replacements
      console.log(`Replaced ${replaced} occurrences`);
    }
  }, [findText, replaceText, handleContentChange]);

  return (
    <div
      ref={editorContainerRef}
      className={cn(
        "nc-editor border rounded-md overflow-hidden relative",
        focus && "ring-2 ring-ring ring-offset-2",
        isFullscreen && "fixed inset-0 z-50 bg-white rounded-none border-none",
        className
      )}
      style={isFullscreen ? { width: "100vw", height: "100vh" } : undefined}
    >
      <NCEditorToolbar
        execCommand={execCommand}
        editorRef={editorRef}
        insertTable={handleInsertTable}
        insertImage={handleInsertImage}
        insertComment={handleInsertComment}
        insertCode={handleInsertCode}
        sourceView={sourceView}
        setSourceView={setSourceView}
        readOnly={readOnly}
        onRevertContent={handleRevertContent}
        hasChanges={isContentModified && sourceView}
        onFontFamilyChange={handleFontFamily}
        onFontSizeChange={handleFontSize}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onTextColorChange={handleTextColor}
        onBackgroundColorChange={handleBackgroundColor}
        onToggleFindReplace={toggleFindReplace}
        mergeCells={handleMergeTableCells}
        insertTableRow={handleInsertTableRow}
        insertTableColumn={handleInsertTableColumn}
        deleteTableRow={handleDeleteTableRow}
        deleteTableColumn={handleDeleteTableColumn}
        onTextDirectionChange={handleTextDirection}
      />

      {/* Find and Replace UI */}
      {showFindReplace && (
        <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find text..."
                className="pl-8 h-8 w-40"
              />
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={findInContent}
              disabled={!findText}
            >
              Find
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={findNext}
              disabled={!findText || findResults.total === 0}
            >
              Next
            </Button>

            <span className="text-xs text-gray-500">
              {findResults.total > 0
                ? `${findResults.current} of ${findResults.total} matches`
                : "No matches"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="h-8 w-40"
            />

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={replaceSelection}
              disabled={!findText || findResults.total === 0}
            >
              Replace
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={replaceAll}
              disabled={!findText || findResults.total === 0}
            >
              Replace All
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowFindReplace(false)}
              className="ml-2"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <NCEditorContent
        editorRef={editorRef}
        sourceView={sourceView}
        sourceContent={sourceContent}
        handleSourceChange={handleSourceChange}
        handleContentChange={handleContentChange}
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        placeholder={placeholder}
        direction={direction}
        readOnly={readOnly}
        isFullscreen={isFullscreen}
      />

      {/* Word count display */}
      {showWordCount && (
        <div className="text-xs text-gray-500 p-1 text-right border-t bg-gray-50">
          {wordStats.words} words, {wordStats.characters} characters
        </div>
      )}
    </div>
  );
}
