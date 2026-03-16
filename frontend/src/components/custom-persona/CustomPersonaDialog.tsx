/**
 * CustomPersonaDialog.tsx
 * Dialog for creating a custom AI persona.
 * User describes their agent → AI generates the system prompt → saved as a persona.
 */
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CustomPersona {
  id: string;
  label: string;
  icon: string;
  isCustom: true;
}

interface Props {
  onClose: () => void;
  onCreated: (persona: CustomPersona) => void;
}

export default function CustomPersonaDialog({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/persona/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), personality: personality.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create persona");
      const data = await res.json();
      const persona: CustomPersona = {
        id: data.role_id,
        label: name.trim(),
        icon: "auto_awesome",
        isCustom: true,
      };
      // Save to localStorage
      const stored = JSON.parse(localStorage.getItem("customPersonas") || "[]");
      stored.push(persona);
      localStorage.setItem("customPersonas", JSON.stringify(stored));
      onCreated(persona);
    } catch (e) {
      setError("Failed to create persona. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="persona-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="persona-dialog">
        <div className="persona-dialog__header">
          <span className="material-symbols-outlined" style={{ color: "var(--Blue-400)", fontSize: 22 }}>auto_awesome</span>
          <span className="persona-dialog__title">Create Your Persona</span>
          <button className="persona-dialog__close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="persona-dialog__body">
          <p className="persona-dialog__hint">
            Describe your agent and AI will build the brain for it — Gemini will then use it to answer everything in that role.
          </p>

          <label className="persona-dialog__label">Agent Name *</label>
          <input
            className="persona-dialog__input"
            placeholder="e.g. Legal Assistant, Sales Coach, Python Expert…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />

          <label className="persona-dialog__label">What kind of agent is this? *</label>
          <textarea
            className="persona-dialog__textarea"
            placeholder="e.g. An expert in contract law who helps review agreements, spot risks, and suggest improvements."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={400}
          />

          <label className="persona-dialog__label">Personality & Tone (optional)</label>
          <textarea
            className="persona-dialog__textarea"
            placeholder="e.g. Professional but friendly. Uses simple language, avoids jargon. Always asks clarifying questions."
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            maxLength={300}
          />

          {error && <p className="persona-dialog__error">{error}</p>}
        </div>

        <div className="persona-dialog__footer">
          <button className="persona-dialog__btn persona-dialog__btn--cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="persona-dialog__btn persona-dialog__btn--create" onClick={handleCreate} disabled={loading || !name.trim() || !description.trim()}>
            {loading ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16, animation: "spin 1s linear infinite" }}>sync</span>
                Building…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                Create Persona
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
