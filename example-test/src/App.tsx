import React, { useState } from "react";
import { NCEditor } from "nc-editor";

function App() {
  const [content, setContent] = useState(
    "<p>Hello from NCEditor! Try editing this content.</p>"
  );

  return (
    <div className="container">
      <h1>NCEditor Demo</h1>

      <div className="editor-wrapper">
        <NCEditor
          value={content}
          onChange={setContent}
          placeholder="Start typing..."
          showWordCount={true}
        />
      </div>

      <div>
        <h3>Editor Output (HTML):</h3>
        <div className="output-container">
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {content}
          </pre>
        </div>

        <h3>Rendered Output:</h3>
        <div className="output-container">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}

export default App;
