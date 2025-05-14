import React from "react";
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
export declare function NCEditorToolbar({ execCommand, sourceView, setSourceView, readOnly, hasChanges, onRevertContent, isFullscreen, toggleFullscreen, }: NCEditorToolbarProps): React.JSX.Element;
