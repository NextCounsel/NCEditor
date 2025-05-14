# nc-editor

A comprehensive rich text editor React component with advanced formatting features.

## Features

- Rich text formatting with font family, size, and color controls
- Visual and source view editing modes
- Insert tables, images, code blocks, and comments
- Table manipulation (merge cells, insert/delete rows/columns)
- Text direction support (LTR/RTL)
- Find and replace
- Fullscreen mode
- Word count

## Installation

```bash
npm install nc-editor
# or
yarn add nc-editor
```

## Dependencies

This component uses Tailwind CSS for styling. You need to set up Tailwind in your project:

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
# or
yarn add -D tailwindcss postcss autoprefixer @tailwindcss/typography
```

Configure your tailwind.config.js:

```js
module.exports = {
  content: [
    // Your project content paths
    "./node_modules/nc-editor/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("@tailwindcss/typography")],
};
```

## Basic Usage

```tsx
import { NCEditor } from "nc-editor";
import { DirectionProvider } from "nc-editor/dist/lib/direction-context";

// Basic usage
function MyEditor() {
  const [content, setContent] = useState("<p>Hello, world!</p>");

  return (
    <DirectionProvider>
      <NCEditor
        value={content}
        onChange={setContent}
        placeholder="Start typing..."
      />
    </DirectionProvider>
  );
}
```

## Props

| Prop                   | Type                    | Default             | Description                           |
| ---------------------- | ----------------------- | ------------------- | ------------------------------------- |
| value                  | string                  | ''                  | HTML content of the editor            |
| onChange               | (value: string) => void | required            | Called when content changes           |
| placeholder            | string                  | undefined           | Placeholder text when editor is empty |
| className              | string                  | undefined           | Additional CSS classes                |
| readOnly               | boolean                 | false               | Makes the editor read-only            |
| autoInsertTable        | boolean                 | false               | Auto-inserts a 2x2 table on init      |
| defaultFontFamily      | string                  | 'Arial, sans-serif' | Default font family                   |
| defaultFontSize        | string                  | '16px'              | Default font size                     |
| defaultTextColor       | string                  | '#000000'           | Default text color                    |
| defaultBackgroundColor | string                  | ''                  | Default background color              |
| showWordCount          | boolean                 | false               | Shows word and character count        |

## Advanced Usage

```tsx
import { NCEditor } from "nc-editor";
import { DirectionProvider } from "nc-editor/dist/lib/direction-context";

function AdvancedEditor() {
  const [content, setContent] = useState("<p>Hello, world!</p>");

  return (
    <DirectionProvider initialDirection="ltr">
      <NCEditor
        value={content}
        onChange={setContent}
        defaultFontFamily="Georgia, serif"
        defaultFontSize="18px"
        defaultTextColor="#333333"
        showWordCount={true}
      />
    </DirectionProvider>
  );
}
```

## License

MIT
