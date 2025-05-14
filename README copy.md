# NC-Editor

A customizable rich text editor component for React applications.

## Features

- Rich text editing with a user-friendly interface
- HTML source view mode
- Table management (create, edit, merge cells)
- Image insertion and resizing
- Code block insertion with language support
- Comment insertion
- Fullscreen mode
- Word count
- Customizable appearance

## Installation

```bash
npm install nc-editor
# or
yarn add nc-editor
```

## Usage

```jsx
import React, { useState } from "react";
import { NCEditor } from "nc-editor";
import "nc-editor/dist/styles.css"; // Import styles

function App() {
  const [content, setContent] = useState("<p>Hello World!</p>");

  const handleChange = (newContent) => {
    setContent(newContent);
  };

  return (
    <div className="app">
      <h1>My Editor</h1>
      <NCEditor
        value={content}
        onChange={handleChange}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;
```

## Props

| Prop                   | Type     | Default             | Description                                                 |
| ---------------------- | -------- | ------------------- | ----------------------------------------------------------- |
| value                  | string   | ""                  | The HTML content of the editor                              |
| onChange               | function | required            | Callback function that is called when the content changes   |
| placeholder            | string   | undefined           | Placeholder text when the editor is empty                   |
| className              | string   | undefined           | Additional CSS class for the editor container               |
| readOnly               | boolean  | false               | Whether the editor is in read-only mode                     |
| autoInsertTable        | boolean  | false               | Automatically insert a table when the editor is initialized |
| defaultFontFamily      | string   | "Arial, sans-serif" | Default font family for the editor content                  |
| defaultFontSize        | string   | "16px"              | Default font size for the editor content                    |
| defaultTextColor       | string   | "#000000"           | Default text color for the editor content                   |
| defaultBackgroundColor | string   | ""                  | Default background color for the editor content             |
| showWordCount          | boolean  | false               | Whether to show word and character count                    |

## Advanced Usage

For advanced usage, you can import individual components and utilities:

```jsx
import { NCEditor, sanitizeHtml } from "nc-editor";
```

## License

MIT
