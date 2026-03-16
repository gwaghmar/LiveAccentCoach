/**
 * Brain.tsx
 * Sets Gemini Live config with: memory, knowledge base, system prompt,
 * Google Search, render_altair, and save_to_memory tools.
 * Handles the save_to_memory tool call → saves to backend.
 * Accepts a role prop to load role-specific knowledge and system prompt.
 * Does NOT touch audio, video, screenshare, or ControlTray.
 */
import { useEffect, useRef } from "react";
import { Modality, LiveServerToolCall, FunctionDeclaration, Type } from "@google/genai";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import { RENDER_ALTAIR_DECLARATION } from "@/components/altair/Altair";
import { RENDER_VISUAL_DECLARATION } from "@/components/visual-canvas/VisualCanvas";

const MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SAVE_MEMORY_DECLARATION: FunctionDeclaration = {
  name: "save_to_memory",
  description:
    "Save important information the user shares so it can be remembered in future sessions. Use this proactively when the user mentions preferences, facts about themselves, or anything worth remembering long-term.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      entry: {
        type: Type.STRING,
        description: "The information to save. Be concise and specific.",
      },
    },
    required: ["entry"],
  },
};

const ROLE_LABELS: Record<string, string> = {
  analyst: "Data Analyst",
  accent_coach: "Accent Coach",
  workout: "Workout Coach",
  finance_dashboard: "Finance Dashboard",
  meeting_assistant: "Meeting Assistant",
  tax_rep: "Tax Representative",
};

function buildSystemPrompt(memory: string, knowledge: string, roleKnowledge: string, role?: string): string {
  const roleLabel = role ? ROLE_LABELS[role] || role : null;

  const parts: string[] = [];

  if (roleLabel) {
    parts.push(`You are an expert ${roleLabel} AI assistant with real-time voice, video, and screen capabilities.`);
  } else {
    parts.push("You are a powerful general-purpose AI assistant with real-time voice, video, and screen capabilities.");
  }

  parts.push(
    "You can search the web with Google Search, render charts with render_altair, create interactive HTML visuals with render_visual, and save important things to memory with save_to_memory.",
    "When the user asks you to 'show', 'visualize', 'draw', 'explain visually', 'create a diagram', or 'make a chart', call render_visual with a complete self-contained HTML page.",
    "render_visual HTML must be self-contained (inline styles, CDN scripts like Chart.js/D3/Tailwind). Make visuals dark-themed, interactive, and rich.",
    "When the user shares something worth remembering across sessions, call save_to_memory immediately.",
    "Be concise, direct, and helpful."
  );

  if (roleKnowledge.trim()) {
    parts.push(`\n## Your Role\n${roleKnowledge.trim()}`);
  }

  if (memory.trim()) {
    parts.push(`\n## Your Memory (from previous sessions)\n${memory.trim()}`);
  }

  if (knowledge.trim()) {
    parts.push(`\n## Knowledge Base\n${knowledge.trim()}`);
  }

  return parts.join("\n");
}

function buildConfig(systemPrompt: string) {
  return {
    responseModalities: [Modality.AUDIO],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } },
    systemInstruction: { parts: [{ text: systemPrompt }] },
    tools: [
      { googleSearch: {} },
      { functionDeclarations: [RENDER_ALTAIR_DECLARATION, RENDER_VISUAL_DECLARATION, SAVE_MEMORY_DECLARATION] },
    ],
  };
}

export default function Brain({ role }: { role?: string }) {
  const { setConfig, setModel, client, connected, disconnect } = useLiveAPIContext();

  // Use refs so we can read current values inside effects without adding them as deps
  const connectedRef = useRef(connected);
  useEffect(() => { connectedRef.current = connected; }, [connected]);
  const disconnectRef = useRef(disconnect);
  useEffect(() => { disconnectRef.current = disconnect; }, [disconnect]);

  // On mount or role change: update config. If already connected, disconnect so the
  // new system prompt takes effect when the user reconnects.
  useEffect(() => {
    setModel(MODEL);
    setConfig(buildConfig(buildSystemPrompt("", "", "", role)));

    // Force reconnect so Gemini picks up the new system prompt
    if (connectedRef.current) {
      disconnectRef.current();
    }

    const fetches: Promise<{ content: string }>[] = [
      fetch(`${API_URL}/memory`).then((r) => r.json()).catch(() => ({ content: "" })),
      fetch(`${API_URL}/knowledge`).then((r) => r.json()).catch(() => ({ content: "" })),
    ];

    if (role) {
      fetches.push(
        fetch(`${API_URL}/knowledge/role/${role}`).then((r) => r.json()).catch(() => ({ content: "" }))
      );
    }

    Promise.all(fetches).then(([mem, know, roleKnow]) => {
      setConfig(
        buildConfig(
          buildSystemPrompt(
            mem.content || "",
            know.content || "",
            roleKnow?.content || "",
            role
          )
        )
      );
    });
  }, [setConfig, setModel, role]);

  // Handle save_to_memory tool calls
  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      const fc = toolCall.functionCalls?.find((fc) => fc.name === "save_to_memory");
      if (!fc) return;

      const entry = (fc.args as any)?.entry || "";
      fetch(`${API_URL}/memory/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry }),
      }).catch(console.error);

      client.sendToolResponse({
        functionResponses: [
          { response: { output: { success: true } }, id: fc.id, name: fc.name },
        ],
      });
    };

    client.on("toolcall", onToolCall);
    return () => { client.off("toolcall", onToolCall); };
  }, [client]);

  return null; // Brain is invisible — pure logic
}
