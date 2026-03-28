import { NextResponse } from "next/server";

/**
 * Webhook Trigger Endpoint
 *
 * Receives external POST requests and stores them for consumption
 * by webhook-triggered workflows. Uses an in-memory queue that
 * the builder polls via GET.
 *
 * POST /api/flow-webhook?id=<trigger-id> — Push a webhook event
 * GET  /api/flow-webhook?id=<trigger-id> — Poll for pending events
 * DELETE /api/flow-webhook?id=<trigger-id> — Clear pending events
 */

type WebhookEvent = {
  id: string;
  triggerId: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  receivedAt: string;
  query: Record<string, string>;
};

// In-memory queue (per trigger ID). In production, use Redis or a database.
const webhookQueues = new Map<string, WebhookEvent[]>();
const MAX_QUEUE_SIZE = 100;

export async function POST(request: Request) {
  const url = new URL(request.url);
  const triggerId = url.searchParams.get("id");

  if (!triggerId) {
    return NextResponse.json(
      { error: "Missing trigger ID. Use ?id=<trigger-id>" },
      { status: 400 }
    );
  }

  // Parse body
  let body: unknown;
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      body = await request.text();
    }
  } else {
    body = await request.text();
  }

  // Extract headers (skip internal ones)
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!key.startsWith("x-next") && !key.startsWith("x-forwarded") && key !== "host") {
      headers[key] = value;
    }
  });

  // Extract query params
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (key !== "id") query[key] = value;
  });

  const event: WebhookEvent = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    triggerId,
    method: "POST",
    headers,
    body,
    receivedAt: new Date().toISOString(),
    query,
  };

  // Add to queue
  if (!webhookQueues.has(triggerId)) {
    webhookQueues.set(triggerId, []);
  }
  const queue = webhookQueues.get(triggerId)!;
  queue.push(event);

  // Trim queue
  if (queue.length > MAX_QUEUE_SIZE) {
    queue.splice(0, queue.length - MAX_QUEUE_SIZE);
  }

  return NextResponse.json({
    received: true,
    eventId: event.id,
    triggerId,
    queueDepth: queue.length,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const triggerId = url.searchParams.get("id");

  if (!triggerId) {
    // List all trigger IDs with queue depths
    const summary: Record<string, number> = {};
    webhookQueues.forEach((queue, id) => {
      summary[id] = queue.length;
    });
    return NextResponse.json({ triggers: summary });
  }

  const queue = webhookQueues.get(triggerId) ?? [];

  // peek=true returns events without draining (safe for retries)
  const peek = url.searchParams.get("peek") === "true";
  if (!peek) {
    webhookQueues.set(triggerId, []);
  }

  return NextResponse.json({
    triggerId,
    events: queue,
    count: queue.length,
    drained: !peek,
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const triggerId = url.searchParams.get("id");

  if (triggerId) {
    webhookQueues.delete(triggerId);
    return NextResponse.json({ cleared: triggerId });
  }

  // Clear all
  webhookQueues.clear();
  return NextResponse.json({ cleared: "all" });
}
