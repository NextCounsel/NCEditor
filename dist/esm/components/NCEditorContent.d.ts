import React from "react";
export interface NCEditorContentProps {
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
export declare function NCEditorContent({ editorRef, sourceView, sourceContent, handleSourceChange, handleContentChange, handleFocus, handleBlur, placeholder, direction, readOnly, isFullscreen, }: NCEditorContentProps): React.JSX.Element;
