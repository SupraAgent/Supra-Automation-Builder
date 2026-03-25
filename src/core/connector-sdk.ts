/**
 * Connector SDK — a builder API for community-authored integrations.
 *
 * `defineConnector()` takes a single ConnectorDefinition object and produces
 * all artifacts the automation builder needs: palette items, registry
 * entries, config fields, action executors, and credential definitions.
 */
import type {
  ConfigFieldDef,
  NodePaletteItem,
  NodeTypeRegistration,
  ActionExecutor,
  ActionResult,
} from "./types";

// ── Auth ────────────────────────────────────────────────────────

export type ConnectorAuthType = "api_key" | "oauth2" | "basic" | "bearer" | "none";

export interface ConnectorAuthField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface ConnectorAuthConfig {
  type: ConnectorAuthType;
  fields: ConnectorAuthField[];
}

// ── Triggers ────────────────────────────────────────────────────

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  config: ConfigFieldDef[];
  outputSchema?: Record<string, string>;
}

// ── Actions ─────────────────────────────────────────────────────

export interface ConnectorActionExecutorResult {
  success: boolean;
  output: Record<string, unknown>;
  error?: string;
}

export type ConnectorActionExecutor = (
  config: Record<string, string>,
  context: Record<string, unknown>,
) => Promise<ConnectorActionExecutorResult>;

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  config: ConfigFieldDef[];
  executor: ConnectorActionExecutor;
  outputSchema?: Record<string, string>;
}

// ── Definition ──────────────────────────────────────────────────

export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  icon?: string;
  category?: string;
  auth: ConnectorAuthConfig;
  triggers?: ConnectorTrigger[];
  actions: ConnectorAction[];
}

// ── Credential definition (generated) ───────────────────────────

export interface CredentialDefinition {
  service: string;
  authType: ConnectorAuthType;
  fields: ConnectorAuthField[];
}

// ── Output of defineConnector() ─────────────────────────────────

export interface ConnectorOutput {
  /** Unique connector identifier (mirrors definition.id) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Semver version string */
  version: string;
  /** Palette items ready for the sidebar */
  paletteItems: NodePaletteItem[];
  /** NodeTypeRegistration entries keyed by subType */
  triggerConfigs: Record<string, NodeTypeRegistration>;
  actionConfigs: Record<string, NodeTypeRegistration>;
  /** Condition fields the connector contributes */
  conditionFields: { value: string; label: string }[];
  /** Action executors keyed by action ID (subType) */
  executors: Record<string, ConnectorActionExecutor>;
  /** A unified ActionExecutor that dispatches by actionType */
  actionExecutor: ActionExecutor;
  /** Credential definition for the credential vault */
  credential: CredentialDefinition;
}

// ── Helpers ─────────────────────────────────────────────────────

/**
 * Build auth-related config fields from the connector's auth config.
 * These fields are prepended to every action/trigger config so the
 * user can wire up credentials.
 */
function buildAuthFields(auth: ConnectorAuthConfig): ConfigFieldDef[] {
  if (auth.type === "none") return [];

  return auth.fields.map((f): ConfigFieldDef => ({
    key: f.key,
    label: f.label,
    type: "secret",
    placeholder: f.placeholder ?? `credential:<id>`,
  }));
}

/**
 * Prefix a subType with the connector ID to guarantee uniqueness
 * across connectors in a merged registry.
 */
function scopeSubType(connectorId: string, localId: string): string {
  return `${connectorId}:${localId}`;
}

// ── defineConnector ─────────────────────────────────────────────

/**
 * Transform a declarative ConnectorDefinition into all the artifacts
 * needed by the automation builder runtime and UI.
 */
export function defineConnector(definition: ConnectorDefinition): ConnectorOutput {
  const { id, name, version, icon, auth, triggers, actions } = definition;
  const authFields = buildAuthFields(auth);
  const defaultIcon = icon ?? "Plug";

  // ── Palette items ───────────────────────────────────────────
  const triggerPaletteItems: NodePaletteItem[] = (triggers ?? []).map((t) => ({
    type: "trigger" as const,
    subType: scopeSubType(id, t.id),
    label: t.name,
    description: t.description,
    icon: defaultIcon,
    defaultConfig: t.config.reduce<Record<string, unknown>>((acc, f) => {
      if (f.defaultValue !== undefined) {
        acc[f.key] = f.defaultValue;
      }
      return acc;
    }, {}),
  }));

  const actionPaletteItems: NodePaletteItem[] = actions.map((a) => ({
    type: "action" as const,
    subType: scopeSubType(id, a.id),
    label: a.name,
    description: a.description,
    icon: defaultIcon,
    defaultConfig: a.config.reduce<Record<string, unknown>>((acc, f) => {
      if (f.defaultValue !== undefined) {
        acc[f.key] = f.defaultValue;
      }
      return acc;
    }, {}),
  }));

  const paletteItems: NodePaletteItem[] = [...triggerPaletteItems, ...actionPaletteItems];

  // ── Trigger configs ─────────────────────────────────────────
  const triggerConfigs: Record<string, NodeTypeRegistration> = {};
  for (const t of triggers ?? []) {
    const subType = scopeSubType(id, t.id);
    triggerConfigs[subType] = {
      subType,
      configFields: [...authFields, ...t.config],
      infoText: t.outputSchema
        ? `Outputs: ${Object.entries(t.outputSchema).map(([k, v]) => `${k} (${v})`).join(", ")}`
        : undefined,
    };
  }

  // ── Action configs ──────────────────────────────────────────
  const actionConfigs: Record<string, NodeTypeRegistration> = {};
  for (const a of actions) {
    const subType = scopeSubType(id, a.id);
    actionConfigs[subType] = {
      subType,
      configFields: [...authFields, ...a.config],
      infoText: a.outputSchema
        ? `Outputs: ${Object.entries(a.outputSchema).map(([k, v]) => `${k} (${v})`).join(", ")}`
        : undefined,
    };
  }

  // ── Condition fields ────────────────────────────────────────
  // Collect all output schema keys across triggers and actions
  // so they can be used in condition nodes.
  const conditionFieldSet = new Set<string>();
  for (const t of triggers ?? []) {
    if (t.outputSchema) {
      for (const key of Object.keys(t.outputSchema)) {
        conditionFieldSet.add(key);
      }
    }
  }
  for (const a of actions) {
    if (a.outputSchema) {
      for (const key of Object.keys(a.outputSchema)) {
        conditionFieldSet.add(key);
      }
    }
  }
  const conditionFields = Array.from(conditionFieldSet).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
  }));

  // ── Executors ───────────────────────────────────────────────
  const executors: Record<string, ConnectorActionExecutor> = {};
  for (const a of actions) {
    executors[scopeSubType(id, a.id)] = a.executor;
  }

  /**
   * Unified ActionExecutor compatible with the engine's dispatch signature.
   * Routes by actionType to the correct connector action executor.
   */
  const actionExecutor: ActionExecutor = async (
    actionType: string,
    config: Record<string, unknown>,
    context,
  ): Promise<ActionResult> => {
    const executor = executors[actionType];
    if (!executor) {
      return { success: false, error: `Unknown action type: ${actionType}` };
    }
    // Coerce config values to strings for the connector executor contract
    const stringConfig: Record<string, string> = {};
    for (const [k, v] of Object.entries(config)) {
      stringConfig[k] = v == null ? "" : String(v);
    }
    const result = await executor(stringConfig, context as Record<string, unknown>);
    return {
      success: result.success,
      output: result.output,
      error: result.error,
    };
  };

  // ── Credential definition ───────────────────────────────────
  const credential: CredentialDefinition = {
    service: id,
    authType: auth.type,
    fields: auth.fields,
  };

  return {
    id,
    name,
    version,
    paletteItems,
    triggerConfigs,
    actionConfigs,
    conditionFields,
    executors,
    actionExecutor,
    credential,
  };
}
