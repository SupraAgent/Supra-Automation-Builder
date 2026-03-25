/**
 * Consumer registries — node definitions synced from consuming repos.
 * Import individual registries or use mergeRegistries() to combine them.
 */
import type { NodeRegistry } from "../core/types";
import type { ConnectorOutput } from "../core/connector-sdk";

export {
  SUPRATEAM_REGISTRY,
  SUPRATEAM_TRIGGERS,
  SUPRATEAM_ACTIONS,
  SUPRATEAM_TRIGGER_CONFIGS,
  SUPRATEAM_ACTION_CONFIGS,
  SUPRATEAM_CONDITION_FIELDS,
} from "./suprateam";

export {
  SUPRALOOP_REGISTRY,
  SUPRALOOP_TRIGGERS,
  SUPRALOOP_ACTIONS,
  SUPRALOOP_TRIGGER_CONFIGS,
  SUPRALOOP_ACTION_CONFIGS,
  SUPRALOOP_CONDITION_FIELDS,
} from "./supraloop";

export {
  AUTOPURCHASER_REGISTRY,
  AUTOPURCHASER_TRIGGERS,
  AUTOPURCHASER_ACTIONS,
  AUTOPURCHASER_TRIGGER_CONFIGS,
  AUTOPURCHASER_ACTION_CONFIGS,
  AUTOPURCHASER_CONDITION_FIELDS,
} from "./autopurchaser";

/**
 * Merge multiple NodeRegistry objects into one.
 * Useful when a consumer wants to combine registries from multiple sources.
 */
export function mergeRegistries(...registries: NodeRegistry[]): NodeRegistry {
  return {
    triggers: registries.flatMap((r) => r.triggers),
    actions: registries.flatMap((r) => r.actions),
    logic: registries.flatMap((r) => r.logic ?? []),
    triggerConfigs: Object.assign({}, ...registries.map((r) => r.triggerConfigs ?? {})),
    actionConfigs: Object.assign({}, ...registries.map((r) => r.actionConfigs ?? {})),
    conditionFields: registries.flatMap((r) => r.conditionFields ?? []),
  };
}

/**
 * Register a connector (produced by `defineConnector()`) into an existing
 * NodeRegistry. Validates that no duplicate subType IDs exist and returns
 * a new registry with the connector's nodes, configs, and condition fields
 * merged in.
 *
 * Throws if any of the connector's subTypes already exist in the registry.
 */
export function registerConnector(
  registry: NodeRegistry,
  connector: ConnectorOutput,
): NodeRegistry {
  // ── Validate connector ID is not already registered ─────────
  const connectorPrefix = `${connector.id}:`;
  const allExistingSubTypes = [
    ...registry.triggers.map((t) => t.subType),
    ...registry.actions.map((a) => a.subType),
  ];
  if (allExistingSubTypes.some((st) => st.startsWith(connectorPrefix))) {
    throw new Error(
      `registerConnector: connector "${connector.id}" is already registered (found existing subTypes with prefix "${connectorPrefix}")`,
    );
  }

  // ── Validate no duplicate trigger subTypes ──────────────────
  const existingTriggerSubTypes = new Set(registry.triggers.map((t) => t.subType));
  const existingActionSubTypes = new Set(registry.actions.map((a) => a.subType));
  const existingConfigSubTypes = new Set([
    ...Object.keys(registry.triggerConfigs ?? {}),
    ...Object.keys(registry.actionConfigs ?? {}),
  ]);

  for (const item of connector.paletteItems) {
    if (item.type === "trigger" && existingTriggerSubTypes.has(item.subType)) {
      throw new Error(
        `registerConnector: duplicate trigger subType "${item.subType}" from connector "${connector.id}"`,
      );
    }
    if (item.type === "action" && existingActionSubTypes.has(item.subType)) {
      throw new Error(
        `registerConnector: duplicate action subType "${item.subType}" from connector "${connector.id}"`,
      );
    }
  }

  for (const subType of Object.keys(connector.triggerConfigs)) {
    if (existingConfigSubTypes.has(subType)) {
      throw new Error(
        `registerConnector: duplicate trigger config subType "${subType}" from connector "${connector.id}"`,
      );
    }
  }

  for (const subType of Object.keys(connector.actionConfigs)) {
    if (existingConfigSubTypes.has(subType)) {
      throw new Error(
        `registerConnector: duplicate action config subType "${subType}" from connector "${connector.id}"`,
      );
    }
  }

  // ── Merge ───────────────────────────────────────────────────
  const triggerItems = connector.paletteItems.filter((p) => p.type === "trigger");
  const actionItems = connector.paletteItems.filter((p) => p.type === "action");

  return {
    triggers: [...registry.triggers, ...triggerItems],
    actions: [...registry.actions, ...actionItems],
    logic: registry.logic ?? [],
    triggerConfigs: {
      ...(registry.triggerConfigs ?? {}),
      ...connector.triggerConfigs,
    },
    actionConfigs: {
      ...(registry.actionConfigs ?? {}),
      ...connector.actionConfigs,
    },
    conditionFields: [
      ...(registry.conditionFields ?? []),
      ...connector.conditionFields,
    ],
  };
}
