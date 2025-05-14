import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

export function NCEditorContent({
  editorRef,
  sourceView,
  sourceContent,
  handleSourceChange,
  handleContentChange,
  handleFocus,
  handleBlur,
  placeholder,
  direction = "ltr",
  readOnly = false,
  isFullscreen = false,
}: NCEditorContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when switching to source view
  useEffect(() => {
    if (sourceView && textareaRef.current) {
      // Small delay to allow for DOM updates
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [sourceView]);

  // Track selection position in editable div
  const handleBeforeSourceView = () => {
    // Future enhancement: save selection position
  };

  // Parse HTML tags to provide basic syntax highlighting
  const renderHtmlPreview = (html: string) => {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(".*?")/g, '<span class="text-green-600">$1</span>')
      .replace(
        /(&lt;[/]?[a-zA-Z0-9]+)/g,
        '<span class="text-blue-600">$1</span>'
      )
      .replace(/([a-zA-Z0-9-]+=)/g, '<span class="text-purple-600">$1</span>');
  };

  // Ensure we capture all input events for content changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Delay to ensure DOM is fully updated
    setTimeout(() => {
      handleContentChange();
    }, 0);
  };

  const fullscreenHeight = isFullscreen ? "calc(100vh - 50px)" : undefined;

  return (
    <div className="relative">
      {sourceView ? (
        <div className="source-editor-container relative">
          <Textarea
            ref={textareaRef}
            value={sourceContent}
            onChange={handleSourceChange}
            className={cn(
              "min-h-[350px] font-mono text-sm p-4 rounded-none border-0 focus-visible:ring-0 resize-y font-mono",
              isFullscreen && "h-[calc(100vh-50px)]"
            )}
            spellCheck={false}
            dir={direction}
            onFocus={handleFocus}
            onBlur={handleBlur}
            readOnly={readOnly}
            style={{
              tabSize: 2,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              height: fullscreenHeight,
            }}
          />
          {/* Visual indicator for source mode */}
          <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-bl">
            HTML Source
          </div>
        </div>
      ) : (
        <div
          ref={editorRef}
          className={cn(
            "nc-editor-content min-h-[350px] p-4 focus:outline-none overflow-auto prose prose-sm max-w-none",
            !sourceContent && placeholder ? "empty-editor" : "",
            isFullscreen && "h-[calc(100vh-50px)]",
            "nc-ltr-content"
          )}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyUp={handleInput}
          onKeyDown={(e) => {
            // Special handling for enter key to ensure we capture paragraph creation
            if (e.key === "Enter") {
              setTimeout(handleContentChange, 0);
            }
          }}
          onPaste={(e) => {
            // Make sure we update after paste operations
            setTimeout(handleContentChange, 0);
          }}
          data-placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          dir="ltr"
          data-text-direction="ltr"
          style={{
            position: "relative",
            height: fullscreenHeight,
            direction: "ltr",
            textAlign: "left",
            unicodeBidi: "normal",
          }}
        />
      )}

      <style>
        {`
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
        `}
      </style>
    </div>
  );
}
