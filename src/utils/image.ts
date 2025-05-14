/**
 * Handles inserting images into the editor content
 *
 * @param file Optional file to insert as base64
 * @param url Optional URL to insert
 * @param execCommand Function to execute editor commands
 */
export function insertImage(
  file: File | null,
  url: string | null,
  execCommand: (command: string, value?: string) => void
): void {
  if (!file && !url) return;

  if (file) {
    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const dataUrl = e.target.result.toString();
        const imageHtml = createResizableImageHtml(dataUrl, file.name);
        execCommand("insertHTML", imageHtml);
      }
    };
    reader.readAsDataURL(file);
  } else if (url) {
    const imageHtml = createResizableImageHtml(url, "image");
    execCommand("insertHTML", imageHtml);
  }
}

/**
 * Creates HTML for a resizable image
 *
 * @param src Image source (URL or data URL)
 * @param alt Alternative text for the image
 * @returns HTML string for the resizable image
 */
function createResizableImageHtml(src: string, alt: string): string {
  return `
    <div class="nc-image-container" contenteditable="false" style="display: inline-block; position: relative; margin: 5px;">
      <img src="${src}" alt="${alt}" class="nc-image" style="display: block; max-width: 100%;" />
      <div class="nc-image-resize-handle" contenteditable="false" style="
        position: absolute;
        right: -6px;
        bottom: -6px;
        width: 12px;
        height: 12px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: nwse-resize;
        z-index: 100;
      "></div>
      <div class="nc-image-size-indicator" style="
        position: absolute;
        bottom: -20px;
        right: 0;
        background-color: rgba(0,0,0,0.6);
        color: white;
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 3px;
        display: none;
      "></div>
    </div>
  `;
}

/**
 * Initialize image resizing functionality for all images in the editor
 *
 * @param editorElement The editor DOM element
 * @returns A cleanup function to remove event listeners
 */
export function initImageResizing(editorElement: HTMLElement): () => void {
  let activeResizeHandle: HTMLElement | null = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let currentImage: HTMLImageElement | null = null;
  let sizeIndicator: HTMLElement | null = null;

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("nc-image-resize-handle")) {
      e.preventDefault();
      e.stopPropagation();

      // Get the parent container and image
      const container = target.closest(".nc-image-container") as HTMLElement;
      currentImage = container.querySelector(".nc-image") as HTMLImageElement;
      sizeIndicator = container.querySelector(
        ".nc-image-size-indicator"
      ) as HTMLElement;

      if (currentImage) {
        activeResizeHandle = target;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = currentImage.offsetWidth;
        startHeight = currentImage.offsetHeight;

        // Show size indicator
        if (sizeIndicator) {
          sizeIndicator.style.display = "block";
          updateSizeIndicator(
            currentImage.offsetWidth,
            currentImage.offsetHeight
          );
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!activeResizeHandle || !currentImage) return;

    e.preventDefault();

    // Calculate the new width and height
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Maintain aspect ratio while resizing (optional)
    const aspectRatio = startWidth / startHeight;

    // Calculate new dimensions (you can modify this logic based on your needs)
    const newWidth = Math.max(30, startWidth + deltaX);
    const newHeight = Math.max(30, newWidth / aspectRatio);

    // Apply the new dimensions to the image
    currentImage.style.width = `${newWidth}px`;
    currentImage.style.height = `${newHeight}px`;

    // Update size indicator if present
    if (sizeIndicator) {
      updateSizeIndicator(newWidth, newHeight);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (activeResizeHandle) {
      e.preventDefault();

      // Hide size indicator
      if (sizeIndicator) {
        sizeIndicator.style.display = "none";
      }

      // Reset state
      activeResizeHandle = null;
      currentImage = null;
      sizeIndicator = null;

      // Remove event listeners
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  };

  // Helper function to update the size indicator text
  const updateSizeIndicator = (width: number, height: number) => {
    if (sizeIndicator) {
      sizeIndicator.textContent = `${Math.round(width)} × ${Math.round(
        height
      )}`;
    }
  };

  // Add event listener for mousedown to detect resize handle clicks
  editorElement.addEventListener("mousedown", handleMouseDown);

  // Return a cleanup function
  return () => {
    editorElement.removeEventListener("mousedown", handleMouseDown);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
}
