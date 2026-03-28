/**
 * LLM Client — Abstraction over Anthropic API and Ollama (local GPU).
 *
 * Supports two backends:
 * 1. Anthropic API (cloud) — requires ANTHROPIC_API_KEY
 * 2. Ollama (local) — requires Ollama running at OLLAMA_BASE_URL
 *
 * Server-side only (uses env vars for keys).
 */

export type LLMBackend = "anthropic" | "ollama";

export type LLMMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LLMRequest = {
  backend: LLMBackend;
  model: string;
  systemPrompt: string;
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
};

export type LLMResponse = {
  content: string;
  model: string;
  backend: LLMBackend;
  tokensUsed?: number;
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  if (req.backend === "anthropic") {
    return callAnthropic(req);
  }
  return callOllama(req);
}

async function callAnthropic(req: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set. Add it to your .env.local file.");
  }

  const body = {
    model: req.model || DEFAULT_CLAUDE_MODEL,
    max_tokens: req.maxTokens || 2048,
    temperature: req.temperature ?? 0.7,
    system: req.systemPrompt,
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");

  return {
    content: textBlock?.text || "",
    model: data.model || req.model,
    backend: "anthropic",
    tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
  };
}

async function callOllama(req: LLMRequest): Promise<LLMResponse> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = req.model || "llama3.1";

  // Ollama chat endpoint
  const body = {
    model,
    stream: false,
    messages: [
      { role: "system", content: req.systemPrompt },
      ...req.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    options: {
      temperature: req.temperature ?? 0.7,
      num_predict: req.maxTokens || 2048,
    },
  };

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ollama error (${res.status}): ${errorText}`);
  }

  const data = await res.json();

  return {
    content: data.message?.content || "",
    model,
    backend: "ollama",
    tokensUsed: (data.eval_count || 0) + (data.prompt_eval_count || 0),
  };
}

/** Check which backends are available */
export function getAvailableBackends(): { anthropic: boolean; ollama: boolean } {
  return {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    ollama: Boolean(process.env.OLLAMA_BASE_URL),
  };
}

/** The default Claude model used across all API routes */
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-5-20250514";

/** Default models for each backend */
export const DEFAULT_MODELS: Record<LLMBackend, string> = {
  anthropic: DEFAULT_CLAUDE_MODEL,
  ollama: "llama3.1",
};

/** Recommended Ollama models for persona research */
export const OLLAMA_MODELS = [
  { id: "llama3.1", label: "Llama 3.1 8B", vram: "~6GB" },
  { id: "llama3.1:70b", label: "Llama 3.1 70B", vram: "~40GB" },
  { id: "mistral", label: "Mistral 7B", vram: "~5GB" },
  { id: "mixtral", label: "Mixtral 8x7B", vram: "~26GB" },
  { id: "deepseek-coder-v2", label: "DeepSeek Coder V2", vram: "~9GB" },
  { id: "qwen2.5", label: "Qwen 2.5 7B", vram: "~5GB" },
];
