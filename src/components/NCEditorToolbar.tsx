import React, { useState } from "react";
import { cn } from "../utils/cn";

export interface NCEditorToolbarProps {
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

export function NCEditorToolbar({
  execCommand,
  sourceView,
  setSourceView,
  readOnly = false,
  hasChanges = false,
  onRevertContent,
  isFullscreen = false,
  toggleFullscreen,
}: NCEditorToolbarProps) {
  // Only show a minimal toolbar for this example
  return (
    <div
      className={cn(
        "nc-editor-toolbar p-1 border-b flex flex-wrap gap-1 items-center bg-white sticky top-0 z-10",
        isFullscreen && "w-full"
      )}
    >
      {/* Basic formatting */}
      <button
        type="button"
        onClick={() => execCommand("bold")}
        className={cn(
          "px-2 py-1 rounded hover:bg-gray-100",
          readOnly && "opacity-50 cursor-not-allowed"
        )}
        disabled={readOnly}
        title="Bold"
      >
        B
      </button>

      <button
        type="button"
        onClick={() => execCommand("italic")}
        className={cn(
          "px-2 py-1 rounded hover:bg-gray-100",
          readOnly && "opacity-50 cursor-not-allowed"
        )}
        disabled={readOnly}
        title="Italic"
      >
        I
      </button>

      <button
        type="button"
        onClick={() => execCommand("underline")}
        className={cn(
          "px-2 py-1 rounded hover:bg-gray-100",
          readOnly && "opacity-50 cursor-not-allowed"
        )}
        disabled={readOnly}
        title="Underline"
      >
        U
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      {/* Source view toggle */}
      <button
        type="button"
        onClick={() => setSourceView(!sourceView)}
        className={cn(
          "px-2 py-1 rounded hover:bg-gray-100",
          sourceView && "bg-amber-100 text-amber-700",
          readOnly && "opacity-50 cursor-not-allowed"
        )}
        disabled={readOnly}
        title="HTML Source"
      >
        HTML
      </button>

      {/* Revert content button (only shown when there are changes in source view) */}
      {sourceView && hasChanges && onRevertContent && (
        <button
          type="button"
          onClick={onRevertContent}
          className="px-2 py-1 rounded hover:bg-gray-100 text-red-600"
          title="Revert changes"
        >
          Revert
        </button>
      )}

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Fullscreen toggle */}
      {toggleFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className={cn(
            "px-2 py-1 rounded hover:bg-gray-100",
            isFullscreen && "bg-blue-100 text-blue-700"
          )}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      )}
    </div>
  );
}
