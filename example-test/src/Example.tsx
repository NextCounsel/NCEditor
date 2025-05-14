import React, { useState } from "react";
import { NCEditor } from "nc-editor";

export default function Example() {
  const [content, setContent] = useState("<p>Hello from NCEditor!</p>");

  return (
    <div className="container">
      <h2>NCEditor Example</h2>

      <div className="editor-wrapper">
        <NCEditor
          value={content}
          onChange={setContent}
          placeholder="Start typing..."
          showWordCount={true}
        />
      </div>

      <div className="output">
        <h3>HTML Output:</h3>
        <pre>{content}</pre>

        <h3>Rendered Output:</h3>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
