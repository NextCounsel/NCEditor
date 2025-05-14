import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  FileCode,
  MessageSquare,
  Undo,
  Redo,
  Code2,
  Type,
  TextQuote,
  Trash2,
  Unlink,
  TypeIcon,
  MoveUpIcon,
  MoveDownIcon,
  Maximize2,
  Minimize2,
  Paintbrush,
  PaintBucket,
  Strikethrough,
  SearchIcon,
  ChevronDown,
  ArrowUpFromLine,
  ArrowDownToLine,
  ArrowRightFromLine,
  ArrowLeftToLine,
  MergeIcon,
  LayoutGrid,
  RotateCcw,
  RotateCw,
  AlignLeft as TextLeftIcon,
  AlignRight as TextRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROGRAMMING_LANGUAGES } from "./utils/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Font families available for selection
const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
  { label: "Impact", value: "Impact, sans-serif" },
  { label: "Comic Sans MS", value: "Comic Sans MS, cursive" },
];

// Font sizes available for selection
const FONT_SIZES = [
  { label: "10px (Tiny)", value: "10px" },
  { label: "12px (Small)", value: "12px" },
  { label: "14px (Normal)", value: "14px" },
  { label: "16px (Medium)", value: "16px" },
  { label: "20px (Large)", value: "20px" },
  { label: "24px (X-Large)", value: "24px" },
  { label: "32px (XX-Large)", value: "32px" },
  { label: "40px (Huge)", value: "40px" },
];

// Color palette for text and background colors
const COLOR_PALETTE = [
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#545454" },
  { label: "Gray", value: "#737373" },
  { label: "Light Gray", value: "#a6a6a6" },
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#e60000" },
  { label: "Orange", value: "#ff9900" },
  { label: "Yellow", value: "#ffff00" },
  { label: "Light Green", value: "#008a00" },
  { label: "Green", value: "#006500" },
  { label: "Blue", value: "#0066cc" },
  { label: "Light Blue", value: "#9cc2e5" },
  { label: "Purple", value: "#9900ff" },
  { label: "Pink", value: "#ff00ff" },
  { label: "Beige", value: "#fff2cc" },
];

interface NCEditorToolbarProps {
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
  editorRef,
  insertTable,
  insertImage,
  insertComment,
  insertCode,
  sourceView,
  setSourceView,
  readOnly = false,
  onRevertContent,
  hasChanges = false,
  onFontFamilyChange,
  onFontSizeChange,
  isFullscreen = false,
  toggleFullscreen,
  onTextColorChange,
  onBackgroundColorChange,
  onToggleFindReplace,
  mergeCells,
  insertTableRow,
  insertTableColumn,
  deleteTableRow,
  deleteTableColumn,
  onTextDirectionChange,
}: NCEditorToolbarProps) {
  // State for various popover contents
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [commentText, setCommentText] = useState("");
  const [codeText, setCodeText] = useState("");
  const [codeLang, setCodeLang] = useState("text");
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentBgColor, setCurrentBgColor] = useState("");

  // State for all popovers
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  const [commentPopoverOpen, setCommentPopoverOpen] = useState(false);
  const [codePopoverOpen, setCodePopoverOpen] = useState(false);

  // File input reference
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // State for current block format
  const [currentBlockFormat, setCurrentBlockFormat] = useState<string>("p");

  // Format commands
  const formatCommand = (command: string) => {
    execCommand(command);
  };

  // Alignment commands
  const alignCommand = (alignment: string) => {
    execCommand("justify" + alignment);
  };

  // Heading commands
  const headingCommand = (level: string) => {
    execCommand("formatBlock", level);
  };

  // Direction commands
  const directionCommand = (direction: "ltr" | "rtl") => {
    if (onTextDirectionChange) {
      // Use the provided handler
      onTextDirectionChange(direction);
    } else {
      // Fallback to basic implementation
      if (editorRef.current) {
        // Apply to the whole editor
        editorRef.current.setAttribute("dir", direction);

        // Focus the editor after changing direction
        editorRef.current.focus();

        // Trigger content update
        execCommand("", "");
      }
    }
  };

  // Apply font family
  const applyFontFamily = (fontFamily: string) => {
    execCommand("fontName", fontFamily);
    setFontFamilyOpen(false);
    if (onFontFamilyChange) {
      onFontFamilyChange(fontFamily);
    }
  };

  // Apply font size
  const applyFontSize = (fontSize: string) => {
    // We'll use inline style instead of fontSize command for better control
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = fontSize;
      range.surroundContents(span);
      execCommand("", ""); // Trigger content update
    } else {
      // Fallback to old method if selection is not available
      execCommand("fontSize", fontSize);
    }
    setFontSizeOpen(false);
    if (onFontSizeChange) {
      onFontSizeChange(fontSize);
    }
  };

  // Apply text color
  const applyTextColor = (color: string) => {
    execCommand("foreColor", color);
    setCurrentTextColor(color);
    setTextColorOpen(false);
    if (onTextColorChange) {
      onTextColorChange(color);
    }
  };

  // Apply background color
  const applyBackgroundColor = (color: string) => {
    execCommand("hiliteColor", color);
    setCurrentBgColor(color);
    setBgColorOpen(false);
    if (onBackgroundColorChange) {
      onBackgroundColorChange(color);
    }
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      execCommand("createLink", linkUrl);
      setLinkUrl("");
      setLinkPopoverOpen(false);
    }
  };

  // Remove link
  const removeLink = () => {
    execCommand("unlink");
  };

  // Handle image select
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      insertImage(file, null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Insert image from URL
  const handleImageUrl = () => {
    if (imageUrl) {
      insertImage(null, imageUrl);
      setImageUrl("");
      setImagePopoverOpen(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle table insert
  const handleTableInsert = () => {
    insertTable(tableRows, tableCols);
    setTablePopoverOpen(false);
  };

  // Handle default 2x2 table insert
  const handleDefaultTableInsert = () => {
    insertTable(2, 2);
  };

  // Handle comment insert
  const handleCommentInsert = () => {
    if (commentText) {
      insertComment(commentText);
      setCommentText("");
      setCommentPopoverOpen(false);
    }
  };

  // Handle code block insert
  const handleCodeInsert = () => {
    if (codeText) {
      insertCode(codeText, codeLang);
      setCodeText("");
      setCodePopoverOpen(false);
    }
  };

  // Monitor current block format
  useEffect(() => {
    if (editorRef.current && !sourceView) {
      const checkFormat = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const node = selection.getRangeAt(0).startContainer;

          // Find the closest block element
          let current: Node | null = node;
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
          ];

          while (current && current !== editorRef.current) {
            if (current.nodeType === Node.ELEMENT_NODE) {
              const tagName = (current as HTMLElement).tagName.toLowerCase();
              if (blockElements.includes(tagName)) {
                setCurrentBlockFormat(tagName);
                return;
              }
            }
            current = current.parentNode;
          }

          // Default to paragraph if no block element found
          setCurrentBlockFormat("p");
        }
      };

      // Check format on selection change
      const handleSelectionChange = () => {
        checkFormat();
      };

      document.addEventListener("selectionchange", handleSelectionChange);

      // Initial check
      checkFormat();

      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }
  }, [editorRef, sourceView]);

  if (readOnly) {
    return null;
  }

  return (
    <div className="nc-editor-toolbar flex flex-wrap gap-1 p-2 bg-gray-50 border-b overflow-x-auto">
      {/* Source/Visual toggle */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={sourceView ? "default" : "outline"}
          size="sm"
          onClick={() => setSourceView(!sourceView)}
        >
          {sourceView ? "Visual" : "Source"}
        </Button>

        {/* Revert button - shown only in source view when there are changes */}
        {sourceView && hasChanges && onRevertContent && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRevertContent}
            className="text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            Revert Changes
          </Button>
        )}
      </div>

      {/* Fullscreen toggle */}
      {toggleFullscreen && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          className="ml-auto"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      )}

      {!sourceView && (
        <>
          {/* Font Family Selector */}
          <Popover open={fontFamilyOpen} onOpenChange={setFontFamilyOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-w-[110px] justify-start font-normal"
              >
                <TypeIcon className="h-4 w-4 mr-2" />
                <span className="truncate">Font Family</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0">
              <div className="max-h-80 overflow-auto">
                {FONT_FAMILIES.map((font) => (
                  <Button
                    key={font.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none h-9"
                    onClick={() => applyFontFamily(font.value)}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Font Size Selector */}
          <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-w-[90px] justify-start font-normal"
              >
                <span className="flex items-center">
                  <TypeIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs mr-0.5">A</span>
                  <span className="text-sm mr-0.5">A</span>
                  <span className="text-base">A</span>
                </span>
                <span className="ml-1 truncate">Font Size</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <div className="max-h-80 overflow-auto">
                {FONT_SIZES.map((size) => (
                  <Button
                    key={size.value}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none h-9"
                    onClick={() => applyFontSize(size.value)}
                  >
                    <span style={{ fontSize: size.value }}>{size.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Text Color Selector */}
          <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative"
                title="Text Color"
              >
                <Paintbrush className="h-4 w-4" />
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-sm mx-1"
                  style={{ backgroundColor: currentTextColor }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
              <div className="p-2">
                <div className="font-medium text-sm mb-2">Text Color</div>
                <div className="grid grid-cols-5 gap-1">
                  {COLOR_PALETTE.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant="ghost"
                      className="w-10 h-10 p-0 rounded-md relative"
                      onClick={() => applyTextColor(color.value)}
                      title={color.label}
                    >
                      <div
                        className="absolute inset-1 rounded"
                        style={{
                          backgroundColor: color.value,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      {currentTextColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Background Color Selector */}
          <Popover open={bgColorOpen} onOpenChange={setBgColorOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative"
                title="Background Color"
              >
                <PaintBucket className="h-4 w-4" />
                {currentBgColor && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-sm mx-1"
                    style={{ backgroundColor: currentBgColor }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
              <div className="p-2">
                <div className="font-medium text-sm mb-2">Background Color</div>
                <div className="grid grid-cols-5 gap-1">
                  {COLOR_PALETTE.map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant="ghost"
                      className="w-10 h-10 p-0 rounded-md relative"
                      onClick={() => applyBackgroundColor(color.value)}
                      title={color.label}
                    >
                      <div
                        className="absolute inset-1 rounded"
                        style={{
                          backgroundColor: color.value,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      {currentBgColor === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => applyBackgroundColor("transparent")}
                  >
                    Remove Background
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarDivider />

          {/* Text formatting */}
          <ToolbarButton
            onClick={() => formatCommand("bold")}
            tooltip="Bold"
            icon={<Bold className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => formatCommand("italic")}
            tooltip="Italic"
            icon={<Italic className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => formatCommand("underline")}
            tooltip="Underline"
            icon={<Underline className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => formatCommand("strikeThrough")}
            tooltip="Strikethrough"
            icon={<Strikethrough className="h-4 w-4" />}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => formatCommand("subscript")}
                className="h-8 w-8"
              >
                <span className="relative">
                  x
                  <span className="absolute -bottom-0.5 -right-1 text-[10px]">
                    2
                  </span>
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Subscript</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => formatCommand("superscript")}
                className="h-8 w-8"
              >
                <span className="relative">
                  x
                  <span className="absolute -top-1 -right-1 text-[10px]">
                    2
                  </span>
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Superscript</TooltipContent>
          </Tooltip>

          <ToolbarDivider />

          {/* Text alignment */}
          <ToolbarButton
            onClick={() => alignCommand("Left")}
            tooltip="Align Left"
            icon={<AlignLeft className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => alignCommand("Center")}
            tooltip="Align Center"
            icon={<AlignCenter className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => alignCommand("Right")}
            tooltip="Align Right"
            icon={<AlignRight className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => alignCommand("Full")}
            tooltip="Justify"
            icon={<AlignJustify className="h-4 w-4" />}
          />

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => formatCommand("insertUnorderedList")}
            tooltip="Bullet List"
            icon={<List className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => formatCommand("insertOrderedList")}
            tooltip="Numbered List"
            icon={<ListOrdered className="h-4 w-4" />}
          />

          <ToolbarDivider />

          {/* Headings and Block styles */}
          <ToolbarButton
            onClick={() => headingCommand("h1")}
            tooltip="Heading 1"
            icon={<Heading1 className="h-4 w-4" />}
            active={currentBlockFormat === "h1"}
          />
          <ToolbarButton
            onClick={() => headingCommand("h2")}
            tooltip="Heading 2"
            icon={<Heading2 className="h-4 w-4" />}
            active={currentBlockFormat === "h2"}
          />
          <ToolbarButton
            onClick={() => headingCommand("h3")}
            tooltip="Heading 3"
            icon={<Heading3 className="h-4 w-4" />}
            active={currentBlockFormat === "h3"}
          />
          <ToolbarButton
            onClick={() => headingCommand("p")}
            tooltip="Paragraph"
            icon={<Type className="h-4 w-4" />}
            active={currentBlockFormat === "p"}
          />
          <ToolbarButton
            onClick={() => headingCommand("blockquote")}
            tooltip="Quote"
            icon={<TextQuote className="h-4 w-4" />}
            active={currentBlockFormat === "blockquote"}
          />

          <ToolbarDivider />

          {/* Text Direction */}
          <ToolbarButton
            onClick={() => directionCommand("ltr")}
            tooltip="Left to Right"
            icon={<TextLeftIcon className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => directionCommand("rtl")}
            tooltip="Right to Left"
            icon={<TextRightIcon className="h-4 w-4" />}
          />

          <ToolbarDivider />

          {/* Advanced inserts */}
          {/* Link */}
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <Link className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Insert Link</h4>
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeLink}
                    className="flex items-center"
                  >
                    <Unlink className="h-4 w-4 mr-1" /> Remove Link
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLinkPopoverOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={insertLink}>
                      Insert
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Image */}
          <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Insert Image</h4>

                <Tabs defaultValue="upload">
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" className="flex-1">
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex-1">
                      URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload">
                    <div className="space-y-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={triggerFileInput}
                      >
                        Choose Image
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        The image will be embedded as Base64 directly in the
                        content
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="url">
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="image-url">Image URL</Label>
                      <Input
                        id="image-url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setImagePopoverOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleImageUrl}
                        >
                          Insert
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>

          {/* Table */}
          <Popover open={tablePopoverOpen} onOpenChange={setTablePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  // Direct insert on Shift+Click
                  if (e.shiftKey) {
                    e.preventDefault();
                    handleDefaultTableInsert();
                    return;
                  }

                  // Double-clicking the table button inserts a default table immediately
                  if (tablePopoverOpen) {
                    handleDefaultTableInsert();
                    setTablePopoverOpen(false);
                  }
                }}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Insert Table</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="table-rows">Rows</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="table-rows"
                        type="number"
                        min="1"
                        max="20"
                        value={tableRows}
                        onChange={(e) =>
                          setTableRows(parseInt(e.target.value) || 1)
                        }
                        className="w-20"
                      />
                      <Slider
                        value={[tableRows]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setTableRows(value[0])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="table-cols">Columns</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="table-cols"
                        type="number"
                        min="1"
                        max="10"
                        value={tableCols}
                        onChange={(e) =>
                          setTableCols(parseInt(e.target.value) || 1)
                        }
                        className="w-20"
                      />
                      <Slider
                        value={[tableCols]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setTableCols(value[0])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden border rounded-md">
                  <div className="p-2 bg-slate-100 text-center text-xs">
                    Preview ({tableRows}×{tableCols})
                  </div>
                  <div className="p-2 bg-white">
                    <div
                      className="grid"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(
                          tableCols,
                          10
                        )}, 1fr)`,
                        gap: "2px",
                      }}
                    >
                      {Array.from({
                        length:
                          Math.min(tableRows, 10) * Math.min(tableCols, 10),
                      }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-200 h-4 rounded-sm"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTableRows(2);
                      setTableCols(2);
                      handleTableInsert();
                    }}
                  >
                    Default 2×2
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTablePopoverOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={handleTableInsert}>
                      Insert
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Insert 2x2 Table button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Quick Insert 2x2 Table"
            onClick={handleDefaultTableInsert}
          >
            <div className="flex flex-col items-center justify-center w-4 h-4">
              <div className="grid grid-cols-2 gap-[1px] w-full h-full">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </div>
          </Button>

          {/* Table Actions Menu */}
          {(mergeCells ||
            insertTableRow ||
            insertTableColumn ||
            deleteTableRow ||
            deleteTableColumn) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                >
                  <TableIcon className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Table</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Table Operations</DropdownMenuLabel>

                {/* Cell operations */}
                {mergeCells && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Cells
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => mergeCells("horizontal")}>
                      <MergeIcon className="h-4 w-4 mr-2 rotate-90" />
                      Merge Cells Horizontally
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => mergeCells("vertical")}>
                      <MergeIcon className="h-4 w-4 mr-2" />
                      Merge Cells Vertically
                    </DropdownMenuItem>
                  </>
                )}

                {/* Row operations */}
                {(insertTableRow || deleteTableRow) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Rows
                    </DropdownMenuLabel>
                    {insertTableRow && (
                      <>
                        <DropdownMenuItem
                          onClick={() => insertTableRow("before")}
                        >
                          <ArrowUpFromLine className="h-4 w-4 mr-2" />
                          Insert Row Above
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => insertTableRow("after")}
                        >
                          <ArrowDownToLine className="h-4 w-4 mr-2" />
                          Insert Row Below
                        </DropdownMenuItem>
                      </>
                    )}
                    {deleteTableRow && (
                      <DropdownMenuItem onClick={deleteTableRow}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Row
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {/* Column operations */}
                {(insertTableColumn || deleteTableColumn) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      Columns
                    </DropdownMenuLabel>
                    {insertTableColumn && (
                      <>
                        <DropdownMenuItem
                          onClick={() => insertTableColumn("before")}
                        >
                          <ArrowLeftToLine className="h-4 w-4 mr-2" />
                          Insert Column Before
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => insertTableColumn("after")}
                        >
                          <ArrowRightFromLine className="h-4 w-4 mr-2" />
                          Insert Column After
                        </DropdownMenuItem>
                      </>
                    )}
                    {deleteTableColumn && (
                      <DropdownMenuItem onClick={deleteTableColumn}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Column
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Comment */}
          <Popover
            open={commentPopoverOpen}
            onOpenChange={setCommentPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  // Direct insert on Shift+Click
                  if (e.shiftKey) {
                    e.preventDefault();
                    // Insert a default comment
                    insertComment("Add your comment here");
                    return;
                  }
                }}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Add Comment</h4>

                <div className="space-y-2">
                  <Label htmlFor="comment-text">Comment</Label>
                  <Textarea
                    id="comment-text"
                    placeholder="Enter your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCommentPopoverOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleCommentInsert}>
                    Insert
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Code Block */}
          <Popover open={codePopoverOpen} onOpenChange={setCodePopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon">
                <FileCode className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <div className="space-y-4">
                <h4 className="font-medium">Insert Code Block</h4>

                <div className="space-y-2">
                  <Label htmlFor="code-language">Language</Label>
                  <Select value={codeLang} onValueChange={setCodeLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMMING_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code-content">Code</Label>
                  <Textarea
                    id="code-content"
                    placeholder="Paste your code here..."
                    value={codeText}
                    onChange={(e) => setCodeText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCodePopoverOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleCodeInsert}>
                    Insert
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Inline Code */}
          <ToolbarButton
            onClick={() => {
              const selection = window.getSelection();
              if (selection && selection.toString()) {
                // Wrap selected text in <code> tags
                const codeHTML = `<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">${selection.toString()}</code>`;
                execCommand("insertHTML", codeHTML);
              } else {
                // Insert empty code tag and position cursor inside
                execCommand(
                  "insertHTML",
                  '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">code</code>'
                );
              }
            }}
            tooltip="Inline Code"
            icon={<Code className="h-4 w-4" />}
          />

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => execCommand("undo")}
            tooltip="Undo"
            icon={<Undo className="h-4 w-4" />}
          />
          <ToolbarButton
            onClick={() => execCommand("redo")}
            tooltip="Redo"
            icon={<Redo className="h-4 w-4" />}
          />

          <ToolbarDivider />

          {/* Clear formatting */}
          <ToolbarButton
            onClick={() => execCommand("removeFormat")}
            tooltip="Clear Formatting"
            icon={<Trash2 className="h-4 w-4" />}
          />

          {/* Find/Replace */}
          {onToggleFindReplace && (
            <>
              <ToolbarDivider />
              <ToolbarButton
                onClick={onToggleFindReplace}
                tooltip="Find and Replace"
                icon={<SearchIcon className="h-4 w-4" />}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

// Helper components for the toolbar
function ToolbarButton({
  onClick,
  tooltip,
  icon,
  active = false,
}: {
  onClick: () => void;
  tooltip: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "default" : "ghost"}
          size="icon"
          onClick={onClick}
          className={`h-8 w-8 ${
            active ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 mx-1 bg-gray-300" />;
}
