import React, { useState } from "react";
import { NCEditor } from "nc-editor";

function App() {
  const [content, setContent] = useState("<p>Hello from NCEditor!</p>");

  return (
    <div className="container">
      <h1>NCEditor Demo</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <NCEditor
          value={content}
          onChange={setContent}
          placeholder="Start typing..."
          showWordCount={true}
        />
      </div>

      <div>
        <h3>Editor Output:</h3>
        <div
          style={{
            border: "1px solid #eee",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
}

export default App;
