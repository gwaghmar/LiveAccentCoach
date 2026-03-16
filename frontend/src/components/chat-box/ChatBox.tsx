/**
 * ChatBox.tsx
 * ChatGPT-style text chat — sits below the video in the main area.
 * Sends text via client.send() and receives text via content events.
 * Requires responseModalities to include TEXT (Brain.tsx sets this).
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

export default function ChatBox() {
  const { client, connected } = useLiveAPIContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const aiBufferRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  // Listen for AI content (text parts) and turn completion
  useEffect(() => {
    const onContent = (content: any) => {
      const parts: any[] = content?.modelTurn?.parts || [];
      const text = parts.filter((p) => p.text).map((p) => p.text).join("");
      if (text) {
        aiBufferRef.current += text;
        setAiTyping(true);
      }
    };

    const onTurnComplete = () => {
      const buffered = aiBufferRef.current.trim();
      if (buffered) {
        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, role: "ai", text: buffered },
        ]);
        aiBufferRef.current = "";
      }
      setAiTyping(false);
    };

    const onInterrupted = () => {
      aiBufferRef.current = "";
      setAiTyping(false);
    };

    client.on("content", onContent);
    client.on("turncomplete", onTurnComplete);
    client.on("interrupted", onInterrupted);
    return () => {
      client.off("content", onContent);
      client.off("turncomplete", onTurnComplete);
      client.off("interrupted", onInterrupted);
    };
  }, [client]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !connected) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);
    setInput("");
    client.send([{ text }]);
    // Refocus input
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [input, connected, client]);

  return (
    <div className="chat-box">
      <div className="chat-box__messages">
        {messages.length === 0 && !aiTyping && (
          <div className="chat-box__empty">
            {connected
              ? "Start typing or speak to your AI agent…"
              : "Click Connect to start your session"}
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
            <div className="chat-msg__bubble">{msg.text}</div>
          </div>
        ))}
        {aiTyping && (
          <div className="chat-msg chat-msg--ai">
            <div className="chat-msg__bubble chat-msg__bubble--typing">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`chat-box__input-row${!connected ? " chat-box__input-row--disabled" : ""}`}>
        <textarea
          ref={inputRef}
          className="chat-box__input"
          placeholder={connected ? "Message your agent… (Enter to send)" : "Connect first to chat"}
          value={input}
          disabled={!connected}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="chat-box__send-btn"
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          title="Send"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  );
}
