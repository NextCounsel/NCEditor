import React, { useState, useCallback, useRef, useEffect } from "react";
import { NCEditorToolbar } from "./NCEditorToolbar";
import { NCEditorContent } from "./NCEditorContent";
import { sanitizeHtml, areHtmlEquivalent } from "../utils/sanitize";
import {
  createTableElement,
  mergeCells,
  insertTableRow,
  insertTableColumn,
  deleteTableRow,
  deleteTableColumn,
} from "../utils/table";
import { insertImage, initImageResizing } from "../utils/image";
import { insertComment } from "../utils/comment";
import { insertCodeBlock } from "../utils/code";
import { cn } from "../utils/cn";

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
  const direction = "ltr"; // Set default direction
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

  // Execute commands on the contentEditable element
  const execCommand = useCallback(
    (command: string, value?: string) => {
      if (readOnly) return; // Don't execute commands in readOnly mode

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
          } else {
            console.warn(`Command ${command} failed`);
          }
        } catch (error) {
          console.error(`Error executing command ${command}:`, error);
        }
      } else {
        console.warn("document.execCommand is not available");
      }
    },
    [sourceView, readOnly]
  );

  // Handle source view content changes
  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSourceContent(e.target.value);

      // Check if content is different from the original
      const isDifferent = !areHtmlEquivalent(originalContent, e.target.value);
      setIsContentModified(isDifferent);
    },
    [originalContent]
  );

  // Handle toggling source view
  useEffect(() => {
    if (!editorRef.current) return;

    if (sourceView) {
      // Update source content with current HTML
      const content = editorRef.current.innerHTML;
      setSourceContent(content);
      setOriginalContent(content); // Store original when switching to source
      setIsContentModified(false);
    } else {
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
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;

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
  const handleRevertContent = useCallback(() => {
    if (sourceView) {
      setSourceContent(originalContent);
      setIsContentModified(false);
    }
  }, [sourceView, originalContent]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setFocus(true);
  }, []);

  // Handle blur events
  const handleBlur = useCallback(() => {
    setFocus(false);
  }, []);

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

  // Direct comment insertion
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
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        mergeCells={handleMergeTableCells}
        insertTableRow={handleInsertTableRow}
        insertTableColumn={handleInsertTableColumn}
        deleteTableRow={handleDeleteTableRow}
        deleteTableColumn={handleDeleteTableColumn}
      />

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
        <div className="p-2 text-xs text-gray-500 border-t">
          {wordStats.words} words | {wordStats.characters} characters
        </div>
      )}
    </div>
  );
}
