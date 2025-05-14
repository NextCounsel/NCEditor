/**
 * Sanitizes HTML to ensure it's safe and standards-compliant
 *
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  // For a production application, you would use a proper sanitization library
  // such as DOMPurify. This is a simple placeholder implementation.

  if (!html) return "";

  // Create a temporary DOM element to parse and sanitize the HTML
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;
  tempElement.dir = "ltr"; // Set default direction to LTR

  // Define allowed tags and attributes
  const allowedTags = [
    "p",
    "br",
    "div",
    "span",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "pre",
    "code",
  ];

  const allowedAttributes = {
    all: ["class", "style", "id", "dir"],
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    div: ["contenteditable", "data-*", "dir"],
    table: ["contenteditable"],
    pre: ["data-language"],
    code: ["data-language"],
  };

  // Function to clean an element
  const cleanElement = (element: Element) => {
    // Skip text nodes
    if (element.nodeType === Node.TEXT_NODE) {
      return;
    }

    // Check if this element's tag is allowed
    const tagName = element.tagName.toLowerCase();
    if (!allowedTags.includes(tagName)) {
      // Replace disallowed elements with their inner content
      const fragment = document.createDocumentFragment();
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
      }
      element.parentNode?.replaceChild(fragment, element);
      return;
    }

    // Clean attributes
    Array.from(element.attributes).forEach((attr) => {
      // Remove on* events (security)
      if (attr.name.startsWith("on") || attr.value.includes("javascript:")) {
        element.removeAttribute(attr.name);
        return;
      }

      // Check if this attribute is allowed for this tag or for all tags
      const tagSpecificAttrs =
        allowedAttributes[tagName as keyof typeof allowedAttributes];
      const globalAttrs = allowedAttributes.all;

      // Allow data-* attributes for specific elements that support them
      const isDataAttr = attr.name.startsWith("data-");
      const supportsDataAttrs = ["div", "pre", "code"].includes(tagName);

      const isAttrAllowed =
        (tagSpecificAttrs && tagSpecificAttrs.includes(attr.name)) ||
        globalAttrs.includes(attr.name) ||
        (isDataAttr && supportsDataAttrs);

      if (!isAttrAllowed) {
        element.removeAttribute(attr.name);
      }
    });

    // Recursively clean child elements
    Array.from(element.children).forEach((child) => {
      cleanElement(child);
    });
  };

  // Clean the DOM tree
  cleanElement(tempElement);

  // Clean up any empty paragraphs that only contain <br> or &nbsp;
  const paragraphs = tempElement.querySelectorAll("p");
  paragraphs.forEach((p) => {
    if (
      p.innerHTML.trim() === "" ||
      p.innerHTML.trim() === "<br>" ||
      p.innerHTML.trim() === "&nbsp;"
    ) {
      p.innerHTML = "<br>";
    }
  });

  // Return the cleaned HTML
  return tempElement.innerHTML;
}

/**
 * Compares two HTML strings to check if they are semantically equivalent
 * Ignores whitespace differences and minor formatting changes
 *
 * @param html1 First HTML string
 * @param html2 Second HTML string
 * @returns True if the HTML strings are semantically equivalent
 */
export function areHtmlEquivalent(html1: string, html2: string): boolean {
  if (html1 === html2) return true;

  // Create temporary DOM elements to normalize the HTML
  const temp1 = document.createElement("div");
  const temp2 = document.createElement("div");

  temp1.innerHTML = html1.trim();
  temp2.innerHTML = html2.trim();

  // Normalize text nodes and remove unnecessary whitespace
  normalizeElement(temp1);
  normalizeElement(temp2);

  // Compare the normalized HTML
  return temp1.innerHTML === temp2.innerHTML;
}

/**
 * Normalize an element by removing unnecessary whitespace
 * and normalizing text nodes
 *
 * @param element Element to normalize
 */
function normalizeElement(element: Element): void {
  // Handle text nodes
  if (element.childNodes) {
    Array.from(element.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Normalize text nodes by collapsing whitespace
        node.textContent = node.textContent?.replace(/\s+/g, " ").trim() || "";
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recursively normalize child elements
        normalizeElement(node as Element);
      }
    });
  }

  // Remove empty text nodes
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === "") {
      element.removeChild(node);
    }
  });
}
