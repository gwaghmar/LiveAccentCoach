/**
 * FileUpload.tsx
 * Upload button for PDF, images, and CSV files.
 * Sends file content directly to Gemini Live via the client.
 * Placed outside ControlTray — does NOT touch audio/video logic.
 */
import { useRef } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";

const ACCEPTED = "image/*,application/pdf,text/csv,.csv";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:image/png;base64,")
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function FileUpload() {
  const { client, connected } = useLiveAPIContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !connected) return;

    const mime = file.type;

    try {
      if (mime.startsWith("image/")) {
        // Send image inline
        const data = await fileToBase64(file);
        client.send([{ inlineData: { mimeType: mime, data } }]);
      } else if (mime === "application/pdf") {
        // Send PDF inline — Gemini natively reads PDFs
        const data = await fileToBase64(file);
        client.send([
          { text: `I'm sharing a PDF file named "${file.name}". Please analyze it.` },
          { inlineData: { mimeType: "application/pdf", data } },
        ]);
      } else if (mime === "text/csv" || file.name.endsWith(".csv")) {
        // Send CSV as text
        const text = await fileToText(file);
        client.send([
          { text: `I'm sharing a CSV file named "${file.name}":\n\`\`\`\n${text}\n\`\`\`\nPlease analyze it.` },
        ]);
      } else {
        alert(`Unsupported file type: ${mime}. Please use images, PDFs, or CSV files.`);
        return;
      }
    } catch (err) {
      console.error("FileUpload error:", err);
    }

    // Reset so same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <button
        className="action-button"
        title={connected ? "Upload file (PDF, image, CSV)" : "Connect first to upload files"}
        disabled={!connected}
        onClick={() => inputRef.current?.click()}
        style={{ opacity: connected ? 1 : 0.4, cursor: connected ? "pointer" : "not-allowed" }}
      >
        <span className="material-symbols-outlined">attach_file</span>
      </button>
    </div>
  );
}
