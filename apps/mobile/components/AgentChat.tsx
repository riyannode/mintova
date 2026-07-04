"use client";

import { useState, useRef, useEffect } from "react";
import { ConfirmationSheet } from "./ConfirmationSheet";
import { executeBridge, type BridgeParams } from "@/lib/bridge";
import { saveActivity, updateActivity, generateLocalId, type ActivityEntry, type BridgeStep } from "@/lib/activity-store";

type Message = {
  role: "user" | "agent";
  content: string;
  type?: string;
  intent?: any;
  confirmation?: { title: string; rows: [string, string][] };
};

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState<{
    title: string;
    rows: [string, string][];
    intent: any;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      const agentMsg: Message = {
        role: "agent",
        content: data.message || (data.type === "intent_ready" ? "Ready to execute." : "I need more info."),
        type: data.type,
        intent: data.intent,
        confirmation: data.confirmation,
      };
      setMessages((prev) => [...prev, agentMsg]);

      // Auto-show confirmation if intent is ready
      if (data.type === "intent_ready" && data.confirmation && data.intent) {
        setConfirmData({
          title: data.confirmation.title,
          rows: data.confirmation.rows,
          intent: data.intent,
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Failed to process request.", type: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!confirmData?.intent) return;

    const intent = confirmData.intent;
    const params: BridgeParams = {
      sourceChain: intent.sourceChain,
      destinationChain: intent.destinationChain,
      amount: intent.amount,
      recipient: intent.recipient,
    };

    setConfirmData(null);
    setMessages((prev) => [
      ...prev,
      { role: "agent", content: "Executing bridge...", type: "executing" },
    ]);

    const localId = generateLocalId();
    const entry: ActivityEntry = {
      localId,
      createdAt: new Date().toISOString(),
      action: "bridge",
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      amount: params.amount,
      recipient: params.recipient,
      status: "pending",
      steps: [
        { name: "approve", state: "pending" },
        { name: "burn", state: "pending" },
        { name: "fetchAttestation", state: "pending" },
        { name: "mint", state: "pending" },
      ],
      explorerLinks: [],
      retryable: false,
    };
    saveActivity(entry);

    const result = await executeBridge(params);

    if (result.success) {
      updateActivity(localId, { status: "complete", steps: result.steps });
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: `Bridge complete! ${params.amount} USDC sent.`, type: "success" },
      ]);
    } else {
      updateActivity(localId, { status: "failed", steps: result.steps, error: result.error, retryable: true });
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: `Bridge failed: ${result.error}`, type: "error" },
      ]);
    }
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col h-[65vh]">
      <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Mintova Agent</h2>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
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
            <div className="text-center space-y-1">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Try: &quot;Send 3 USDC to Base to 0x...&quot;
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                or &quot;Bridge 10 USDC from Sepolia to Base&quot;
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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

              {/* Show intent preview if ready */}
              {msg.type === "intent_ready" && msg.intent && (
                <div className="mt-2 pt-2 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-[11px] font-medium" style={{ color: "var(--mint)" }}>Ready to execute:</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {msg.intent.amount} USDC → {msg.intent.destinationChain?.replace(/_/g, " ")}
                  </p>
                </div>
              )}

              {/* Show missing fields */}
              {msg.type === "need_clarification" && msg.intent?.missingFields?.length > 0 && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-[11px]" style={{ color: "var(--warning)" }}>
                    Missing: {msg.intent.missingFields.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 text-sm"
              style={{
                borderRadius: "var(--radius-sm) var(--radius-sm) var(--radius-sm) 4px",
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                <span style={{ color: "var(--text-muted)" }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Send 3 USDC to Base..."
          disabled={loading}
          className="flex-1 text-sm px-4 py-3 outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            background: "var(--surface-elevated)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-3 transition-all duration-200 active:scale-95 disabled:opacity-30"
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

      {/* Confirmation Sheet */}
      {confirmData && (
        <ConfirmationSheet
          title={confirmData.title}
          rows={confirmData.rows}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}
