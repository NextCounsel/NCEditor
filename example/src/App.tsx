import { useState } from "react";
import { NCEditor } from "nc-editor";
import { TooltipProvider } from "@radix-ui/react-tooltip";
// replace directional context

function App() {
  const [content, setContent] = useState("<p>Start editing here...</p>");

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">NCEditor Example</h1>

        <div className="mb-8">
          <NCEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing..."
            showWordCount={true}
          />
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Editor Content (HTML):</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
            {content}
          </pre>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;
