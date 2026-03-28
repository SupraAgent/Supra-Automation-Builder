import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { DEFAULT_CLAUDE_MODEL } from "@/lib/llm-client";
import { sanitizeErrorMessage } from "@supra/builder";

function humanizeApiError(err: unknown): { message: string; status: number } {
  const rawMsg = err instanceof Error ? err.message : String(err);
  const lower = rawMsg.toLowerCase();

  if (lower.includes("401") || lower.includes("unauthorized") || lower.includes("invalid")) {
    return { message: "Invalid API key. Check your Anthropic API key in Settings.", status: 401 };
  }
  if (lower.includes("429") || lower.includes("rate limit")) {
    return { message: "Rate limit exceeded. Wait a moment and try again.", status: 429 };
  }
  if (lower.includes("403") || lower.includes("forbidden")) {
    return { message: "Access denied. Your API key may not have permission for this model.", status: 403 };
  }
  if (lower.includes("404") || lower.includes("not found")) {
    return { message: "Model not found. Check the model name in your LLM node settings.", status: 404 };
  }
  if (lower.includes("529") || lower.includes("overloaded")) {
    return { message: "AI provider is overloaded. Wait a moment and retry.", status: 529 };
  }
  if (lower.includes("credit") || lower.includes("billing")) {
    return { message: "Billing issue. Your API account may be out of credits.", status: 402 };
  }

  // Sanitize any credential patterns from the fallback error message
  return { message: sanitizeErrorMessage(rawMsg), status: 500 };
}

export async function POST(request: Request) {
  const body = await request.json();
  const { apiKey, systemPrompt, userMessage, temperature, maxTokens, model, stream } =
    body;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key required. Set your Anthropic API key in Settings." },
      { status: 400 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    // ── Streaming mode ──────────────────────────────────────
    if (stream) {
      const encoder = new TextEncoder();
      let inputTokens = 0;
      let outputTokens = 0;

      const readable = new ReadableStream({
        async start(controller) {
          try {
            const streamResponse = client.messages.stream({
              model: model || DEFAULT_CLAUDE_MODEL,
              max_tokens: maxTokens || 2048,
              temperature: temperature ?? 0.7,
              system: systemPrompt || "You are a helpful assistant.",
              messages: [{ role: "user", content: userMessage }],
            });

            streamResponse.on("text", (text) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "text", text })}\n\n`)
              );
            });

            const finalMessage = await streamResponse.finalMessage();
            inputTokens = finalMessage.usage?.input_tokens ?? 0;
            outputTokens = finalMessage.usage?.output_tokens ?? 0;

            // Send usage data as final event
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "done",
                  usage: { input_tokens: inputTokens, output_tokens: outputTokens },
                })}\n\n`
              )
            );
            controller.close();
          } catch (err) {
            const { message } = humanizeApiError(err);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", error: message })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Non-streaming mode ──────────────────────────────────
    const response = await client.messages.create({
      model: model || DEFAULT_CLAUDE_MODEL,
      max_tokens: maxTokens || 2048,
      temperature: temperature ?? 0.7,
      system: systemPrompt || "You are a helpful assistant.",
      messages: [{ role: "user", content: userMessage }],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({
      content,
      usage: {
        input_tokens: response.usage?.input_tokens ?? 0,
        output_tokens: response.usage?.output_tokens ?? 0,
      },
    });
  } catch (err) {
    const { message, status } = humanizeApiError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
