"use client";

import * as React from "react";
import type { Node, Edge } from "@xyflow/react";

// ── Types ────────────────────────────────────────────────────────

export interface AIFlowMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  flowUpdate?: { nodes: Node[]; edges: Edge[] };
}

export interface AIFlowChatProps {
  /** Current canvas nodes (sent with each request for context) */
  currentNodes: Node[];
  /** Current canvas edges (sent with each request for context) */
  currentEdges: Edge[];
  /** Called when user clicks "Apply to Canvas" on a flow update */
  onApplyFlow: (nodes: Node[], edges: Edge[]) => void;
  /**
   * Handler that processes user messages and returns AI responses.
   * Consuming apps implement this to connect to their own AI backend.
   */
  onSendMessage: (request: AIFlowChatRequest) => Promise<AIFlowChatResponse>;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Title displayed in the chat header */
  title?: string;
  /** Subtitle displayed under the title */
  subtitle?: string;
  /** Welcome message shown when the chat opens */
  welcomeMessage?: string;
  /** Button emoji/icon */
  buttonIcon?: string;
}

export interface AIFlowChatRequest {
  message: string;
  currentNodes: Node[];
  currentEdges: Edge[];
  history: { role: string; content: string }[];
}

export interface AIFlowChatResponse {
  message: string;
  flowUpdate?: { nodes: Node[]; edges: Edge[] };
  error?: string;
}

// ── Component ────────────────────────────────────────────────────

export function AIFlowChat({
  currentNodes,
  currentEdges,
  onApplyFlow,
  onSendMessage,
  placeholder = "Describe what to build...",
  title = "Flow Assistant",
  subtitle = "Build workflows with AI",
  welcomeMessage = 'I can help you build and modify workflows. Try:\n\n- "Create a workflow with 3 steps"\n- "Add a condition node"\n- "Connect the trigger to the action"',
  buttonIcon = "🤖",
}: AIFlowChatProps) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<AIFlowMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMsg: AIFlowMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await onSendMessage({
        message: userMsg.content,
        currentNodes,
        currentEdges,
        history: messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (response.error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `Error: ${response.error}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: response.message,
            flowUpdate: response.flowUpdate,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Failed to connect to AI service.",
        },
      ]);
    }

    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:brightness-110 transition active:scale-95"
        title={title}
      >
        <span className="text-xl">{buttonIcon}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{buttonIcon}</span>
          <div>
            <div className="text-sm font-semibold text-foreground">{title}</div>
            <div className="text-[10px] text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground transition"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-500/15 text-foreground"
                  : "bg-white/5 text-foreground border border-white/10"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.flowUpdate && (
                <button
                  onClick={() =>
                    onApplyFlow(msg.flowUpdate!.nodes, msg.flowUpdate!.edges)
                  }
                  className="mt-2 w-full rounded-lg bg-blue-500/20 px-3 py-1.5 text-[11px] font-medium text-blue-400 hover:bg-blue-500/30 transition"
                >
                  Apply to Canvas ({msg.flowUpdate.nodes.length} nodes,{" "}
                  {msg.flowUpdate.edges.length} edges)
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-muted-foreground">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-white/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-blue-500/15 px-3 py-2 text-xs font-medium text-blue-400 hover:bg-blue-500/25 border border-blue-500/20 transition disabled:opacity-30"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
