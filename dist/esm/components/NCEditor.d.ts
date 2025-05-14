import React from "react";
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
export declare function NCEditor({ value, onChange, placeholder, className, readOnly, autoInsertTable, defaultFontFamily, defaultFontSize, defaultTextColor, defaultBackgroundColor, showWordCount, }: NCEditorProps): React.JSX.Element;
