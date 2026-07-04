"use client";

import { useState } from "react";

type Message = {
  role: "user" | "agent";
  content: string;
};

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // TODO: Call /api/agent/chat
    const agentMsg: Message = {
      role: "agent",
      content: "Agent not connected yet.",
    };
    setMessages((prev) => [...prev, agentMsg]);
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col h-[65vh]">
      <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Mintova Agent</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "var(--violet-glow)", border: "1px solid rgba(139, 92, 246, 0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              &quot;Send 3 USDC to Base&quot;
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-2.5 text-sm"
              style={{
                borderRadius: msg.role === "user" ? "var(--radius-sm) var(--radius-sm) 4px var(--radius-sm)" : "var(--radius-sm) var(--radius-sm) var(--radius-sm) 4px",
                background: msg.role === "user" ? "var(--accent-glow)" : "var(--surface-elevated)",
                color: msg.role === "user" ? "var(--accent)" : "var(--text-primary)",
                border: `1px solid ${msg.role === "user" ? "rgba(255, 106, 85, 0.2)" : "var(--border)"}`,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Mintova..."
          className="flex-1 text-sm px-4 py-3 outline-none transition-all duration-200"
          style={{
            background: "var(--surface-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}
        />
        <button
          onClick={handleSend}
          className="px-4 py-3 transition-all duration-200 active:scale-95"
          style={{
            background: "var(--accent)",
            color: "var(--bg)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
