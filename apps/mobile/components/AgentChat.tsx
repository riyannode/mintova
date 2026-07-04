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
      content: "Agent not connected yet. This will parse your intent and show a confirmation sheet.",
    };
    setMessages((prev) => [...prev, agentMsg]);
  }

  return (
    <div className="w-full max-w-sm flex flex-col h-[70vh]">
      <h2 className="text-lg font-semibold mb-4">Mintova Agent</h2>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-sm text-[#8E929C] text-center mt-8">
            Ask Mintova: &quot;Send 3 USDC to Base&quot;
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-[#7CFFB2]/20 text-[#7CFFB2]"
                  : "bg-[#20242D] text-[#F7F2E8]"
              }`}
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
          placeholder="Send 3 USDC to Base"
          className="flex-1 bg-[#20242D] text-[#F7F2E8] text-sm px-4 py-3 rounded-xl border border-[#2A2E38] outline-none focus:border-[#7CFFB2] transition"
        />
        <button
          onClick={handleSend}
          className="px-4 py-3 rounded-xl bg-[#7CFFB2] text-[#0E1014] font-semibold hover:bg-[#7CFFB2]/90 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
