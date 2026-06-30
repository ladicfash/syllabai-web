/**
 * Utility functions for downloading notes in various formats
 */

export function downloadNote(note: any, format: string) {
  const { title, content } = note;
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `${title || "note"}_${timestamp}`;

  switch (format) {
    case "markdown":
      downloadAsMarkdown(content, filename);
      break;
    case "json":
      downloadAsJSON(note, filename);
      break;
    case "txt":
      downloadAsText(content, filename);
      break;
    case "html":
      downloadAsHTML(content, filename);
      break;
    case "pdf":
      downloadAsPDF(content, filename);
      break;
    case "png":
      downloadAsPNG(content, filename);
      break;
    default:
      console.warn(`Unknown format: ${format}`);
  }
}

function downloadAsMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAsJSON(note: any, filename: string) {
  const json = JSON.stringify(note, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAsText(content: string, filename: string) {
  // Strip markdown if present
  const text = content
    .replace(/^#+\s+/gm, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italics
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .trim();

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAsHTML(content: string, filename: string) {
  // Convert markdown to HTML
  const htmlContent = content
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, "<br/>");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
      background: #f9f9f9;
    }
    h1, h2, h3 { color: #222; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 2px solid #007bff; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      border-left: 4px solid #007bff;
    }
    a { color: #007bff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    p { margin: 0.5em 0; }
  </style>
</head>
<body>
  <article>
    ${htmlContent}
  </article>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAsPDF(content: string, filename: string) {
  // For PDF, we recommend using a server-side endpoint
  // Client-side PDF generation requires jsPDF or similar
  // For now, provide a fallback to HTML download
  console.warn("PDF export requires server-side processing. Falling back to HTML export.");
  downloadAsHTML(content, filename);
}

async function downloadAsPNG(content: string, filename: string) {
  // For PNG, we would need html2canvas library
  // For now, provide a fallback to HTML export
  console.warn("PNG export requires html2canvas library. Falling back to HTML export.");
  downloadAsHTML(content, filename);
}

/**
 * Generate a text preview from note content (first 150 chars)
 */
export function generatePreview(content: string, maxLength: number = 150): string {
  if (typeof content !== "string") return "";
  return content
    .replace(/^#+\s+/gm, "") // Remove headers
    .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.+?)\*/g, "$1") // Remove italics
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
    .replace(/\n/g, " ") // Replace newlines with spaces
    .substring(0, maxLength)
    .trim();
}
