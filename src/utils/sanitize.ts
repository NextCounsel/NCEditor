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

  // Recursively sanitize the element and its children
  sanitizeNode(tempElement, allowedTags, allowedAttributes);

  return tempElement.innerHTML;
}

/**
 * Sanitize a DOM node and its children
 */
function sanitizeNode(
  node: Element,
  allowedTags: string[],
  allowedAttributes: Record<string, string[]>
): void {
  // Process all child nodes recursively
  const childNodes = Array.from(node.childNodes);
  for (const child of childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const childElement = child as Element;
      const tagName = childElement.tagName.toLowerCase();

      // If this tag is not allowed, replace it with its contents
      if (!allowedTags.includes(tagName)) {
        // Create a document fragment to hold the child's contents
        const fragment = document.createDocumentFragment();
        while (childElement.firstChild) {
          fragment.appendChild(childElement.firstChild);
        }

        // Replace the element with its children
        node.replaceChild(fragment, childElement);
        continue;
      }

      // Filter attributes
      const attributesToRemove: string[] = [];
      for (const attr of Array.from(childElement.attributes)) {
        const attrName = attr.name;

        // Check if this attribute is allowed for this tag
        const allowedForTag = allowedAttributes[tagName] || [];
        const allowedForAll = allowedAttributes.all || [];

        // Special case for data-* attributes on divs
        const isDataAttrOnDiv =
          tagName === "div" &&
          allowedAttributes.div.includes("data-*") &&
          attrName.startsWith("data-");

        if (
          !allowedForAll.includes(attrName) &&
          !allowedForTag.includes(attrName) &&
          !isDataAttrOnDiv
        ) {
          attributesToRemove.push(attrName);
        }
      }

      // Remove disallowed attributes
      for (const attrName of attributesToRemove) {
        childElement.removeAttribute(attrName);
      }

      // Process this element's children
      sanitizeNode(childElement, allowedTags, allowedAttributes);
    }
  }
}

/**
 * Compares two HTML strings for semantic equivalence
 * This is useful for determining if the content has changed meaningfully
 *
 * @param html1 First HTML string to compare
 * @param html2 Second HTML string to compare
 * @returns true if the HTML strings are semantically equivalent
 */
export function areHtmlEquivalent(html1: string, html2: string): boolean {
  if (html1 === html2) return true;

  // Create DOM elements to compare their content
  const div1 = document.createElement("div");
  const div2 = document.createElement("div");

  div1.innerHTML = sanitizeHtml(html1);
  div2.innerHTML = sanitizeHtml(html2);

  // Normalize both elements to remove inconsistencies
  normalizeElement(div1);
  normalizeElement(div2);

  // Compare the normalized HTML
  return div1.innerHTML === div2.innerHTML;
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
