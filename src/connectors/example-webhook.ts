/**
 * Example Webhook Connector — built with the Connector SDK.
 *
 * Demonstrates how to use `defineConnector()` to create a complete
 * integration from a single definition object. This connector provides:
 *
 * - **Trigger**: "Webhook Received" — listens for incoming HTTP POSTs
 * - **Action**: "Send Webhook" — POSTs a JSON body to a URL
 *
 * Usage:
 * ```ts
 * import { registerConnector, mergeRegistries } from "../registries";
 * import { webhookConnector } from "../connectors/example-webhook";
 *
 * const registry = registerConnector(SUPRALOOP_REGISTRY, webhookConnector);
 * ```
 */
import { defineConnector } from "../core/connector-sdk";

export const webhookConnector = defineConnector({
  id: "webhook",
  name: "Webhook",
  description: "Send and receive HTTP webhooks for integrating with external services.",
  version: "1.0.0",
  icon: "Webhook",
  category: "Integration",

  auth: {
    type: "bearer",
    fields: [
      {
        key: "auth_token",
        label: "Auth Token",
        placeholder: "Bearer token for outgoing requests (optional)",
        required: false,
      },
    ],
  },

  triggers: [
    {
      id: "webhook_received",
      name: "Webhook Received",
      description: "Fires when an incoming HTTP POST is received at the generated endpoint.",
      config: [
        {
          key: "path_suffix",
          label: "Path Suffix",
          type: "text",
          placeholder: "e.g. /my-hook (auto-generated if empty)",
        },
        {
          key: "secret",
          label: "Webhook Secret",
          type: "secret",
          placeholder: "HMAC secret for signature verification (optional)",
        },
        {
          key: "allowed_methods",
          label: "Allowed Methods",
          type: "select",
          options: [
            { value: "POST", label: "POST only" },
            { value: "POST,PUT", label: "POST + PUT" },
            { value: "ANY", label: "Any method" },
          ],
          defaultValue: "POST",
        },
      ],
      outputSchema: {
        body: "object",
        headers: "object",
        method: "string",
        path: "string",
        query: "object",
        timestamp: "string",
      },
    },
  ],

  actions: [
    {
      id: "send_webhook",
      name: "Send Webhook",
      description: "Send an HTTP POST request with a JSON body to an external URL.",
      config: [
        {
          key: "url",
          label: "Destination URL",
          type: "text",
          placeholder: "https://example.com/webhook",
        },
        {
          key: "method",
          label: "HTTP Method",
          type: "select",
          options: [
            { value: "POST", label: "POST" },
            { value: "PUT", label: "PUT" },
            { value: "PATCH", label: "PATCH" },
          ],
          defaultValue: "POST",
        },
        {
          key: "headers_json",
          label: "Extra Headers (JSON)",
          type: "textarea",
          placeholder: '{"X-Custom-Header": "value"}',
        },
        {
          key: "body_template",
          label: "Body (JSON template)",
          type: "textarea",
          placeholder: '{"event": "{{trigger.type}}", "data": "{{trigger.body}}"}',
        },
        {
          key: "timeout_ms",
          label: "Timeout (ms)",
          type: "number",
          defaultValue: 5000,
        },
      ],
      outputSchema: {
        status_code: "number",
        response_body: "string",
        response_headers: "object",
        duration_ms: "number",
      },
      executor: async (config, context) => {
        const url = config.url;
        if (!url) {
          return { success: false, output: {}, error: "Destination URL is required" };
        }

        const method = config.method || "POST";
        const timeoutMs = parseInt(config.timeout_ms || "5000", 10);

        // Build headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add auth token if present
        const authToken = config.auth_token;
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        // Parse extra headers
        if (config.headers_json) {
          try {
            const extra = JSON.parse(config.headers_json) as Record<string, string>;
            for (const [k, v] of Object.entries(extra)) {
              headers[k] = v;
            }
          } catch {
            return {
              success: false,
              output: {},
              error: `Invalid JSON in Extra Headers: ${config.headers_json}`,
            };
          }
        }

        // Resolve body template — replace {{key}} with context values
        let body = config.body_template || "{}";
        const contextRecord = context as Record<string, unknown>;
        body = body.replace(/\{\{([^}]+)\}\}/g, (_match: string, key: string) => {
          const trimmed = key.trim();
          const parts = trimmed.split(".");
          let current: unknown = contextRecord;
          for (const part of parts) {
            if (current !== null && typeof current === "object") {
              current = (current as Record<string, unknown>)[part];
            } else {
              return "";
            }
          }
          return typeof current === "string" ? current : JSON.stringify(current ?? "");
        });

        // Make the request
        const startTime = Date.now();
        try {
          const controller = new AbortController();
          const timer = setTimeout(
            () => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)),
            timeoutMs,
          );

          const response = await fetch(url, {
            method,
            headers,
            body,
            signal: controller.signal,
          });

          clearTimeout(timer);
          const durationMs = Date.now() - startTime;
          const responseBody = await response.text();

          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((v, k) => {
            responseHeaders[k] = v;
          });

          return {
            success: response.ok,
            output: {
              status_code: response.status,
              response_body: responseBody,
              response_headers: responseHeaders,
              duration_ms: durationMs,
            },
            error: response.ok ? undefined : `HTTP ${response.status}: ${responseBody}`,
          };
        } catch (err) {
          const durationMs = Date.now() - startTime;
          const message = err instanceof Error ? err.message : String(err);
          return {
            success: false,
            output: { duration_ms: durationMs },
            error: `Request failed: ${message}`,
          };
        }
      },
    },
  ],
});
