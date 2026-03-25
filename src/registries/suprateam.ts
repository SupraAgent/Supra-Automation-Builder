/**
 * SupraTeam node definitions.
 * Auto-synced from SupraAgent/SupraTeam — manual edits between
 * SYNC-START / SYNC-END markers will be overwritten.
 */
import type {
  NodePaletteItem,
  NodeRegistry,
  NodeTypeRegistration,
} from "../core/types";

// ── SYNC-START: triggers ────────────────────────────────────────

export const SUPRATEAM_TRIGGERS: NodePaletteItem[] = [
  { type: "trigger", subType: "deal_stage_change", label: "Deal Stage Change", description: "When a deal moves stages", icon: "ArrowRightLeft", defaultConfig: {} },
  { type: "trigger", subType: "deal_created", label: "Deal Created", description: "When a new deal is added", icon: "PlusCircle", defaultConfig: {} },
  { type: "trigger", subType: "deal_value_change", label: "Deal Value Change", description: "When a deal's value changes", icon: "DollarSign", defaultConfig: {} },
  { type: "trigger", subType: "email_received", label: "Email Received", description: "When an email arrives", icon: "Mail", defaultConfig: {} },
  { type: "trigger", subType: "tg_message", label: "Telegram Message", description: "When a TG message matches", icon: "MessageCircle", defaultConfig: {} },
  { type: "trigger", subType: "calendar_event", label: "Calendar Event", description: "Google Calendar trigger", icon: "Calendar", defaultConfig: {} },
  { type: "trigger", subType: "webhook", label: "Webhook", description: "Triggered by HTTP POST", icon: "Webhook", defaultConfig: {} },
  { type: "trigger", subType: "manual", label: "Manual Trigger", description: "Run manually", icon: "Play", defaultConfig: {} },
];

// ── SYNC-END: triggers ──────────────────────────────────────────

// ── SYNC-START: actions ─────────────────────────────────────────

export const SUPRATEAM_ACTIONS: NodePaletteItem[] = [
  { type: "action", subType: "send_telegram", label: "Send Telegram", description: "Send a Telegram message", icon: "Send", defaultConfig: { message: "" } },
  { type: "action", subType: "send_email", label: "Send Email", description: "Send an email", icon: "Mail", defaultConfig: { subject: "", body: "" } },
  { type: "action", subType: "send_slack", label: "Send Slack", description: "Send a Slack message", icon: "Hash", defaultConfig: { channel_id: "", message: "", mention_user_id: "" } },
  { type: "action", subType: "update_deal", label: "Update Deal", description: "Change a deal field", icon: "Pencil", defaultConfig: { field: "stage", value: "" } },
  { type: "action", subType: "update_contact", label: "Update Contact", description: "Change a contact field", icon: "UserCog", defaultConfig: { field: "company", value: "" } },
  { type: "action", subType: "assign_deal", label: "Assign Deal", description: "Reassign deal owner", icon: "UserPlus", defaultConfig: { assign_to: "" } },
  { type: "action", subType: "create_task", label: "Create Task", description: "Add a CRM task", icon: "CheckSquare", defaultConfig: { title: "" } },
];

// ── SYNC-END: actions ───────────────────────────────────────────

// ── SYNC-START: triggerConfigs ───────────────────────────────────

export const SUPRATEAM_TRIGGER_CONFIGS: Record<string, NodeTypeRegistration> = {
  deal_stage_change: {
    subType: "deal_stage_change",
    configFields: [
      { key: "from_stage", label: "From stage (optional)", type: "text", placeholder: "Any stage" },
      { key: "to_stage", label: "To stage (optional)", type: "text", placeholder: "Any stage" },
      { key: "board_type", label: "Board type (optional)", type: "select", options: [{ value: "", label: "Any" }, { value: "BD", label: "BD" }, { value: "Marketing", label: "Marketing" }, { value: "Admin", label: "Admin" }] },
    ],
  },
  deal_created: {
    subType: "deal_created",
    configFields: [
      { key: "board_type", label: "Board type (optional)", type: "select", options: [{ value: "", label: "Any" }, { value: "BD", label: "BD" }, { value: "Marketing", label: "Marketing" }, { value: "Admin", label: "Admin" }] },
    ],
  },
  deal_value_change: {
    subType: "deal_value_change",
    configFields: [],
  },
  email_received: {
    subType: "email_received",
    configFields: [
      { key: "from_contains", label: "From contains", type: "text", placeholder: "e.g. @supra.com" },
      { key: "subject_contains", label: "Subject contains", type: "text", placeholder: "e.g. Partnership" },
    ],
  },
  tg_message: {
    subType: "tg_message",
    configFields: [
      { key: "chat_id", label: "Chat ID (optional)", type: "text", placeholder: "Any chat" },
      { key: "keyword", label: "Keyword match", type: "text", placeholder: "e.g. interested" },
    ],
  },
  calendar_event: {
    subType: "calendar_event",
    configFields: [
      { key: "event_type", label: "Event type", type: "select", options: [{ value: "created", label: "Created" }, { value: "updated", label: "Updated" }, { value: "upcoming", label: "Upcoming" }] },
      { key: "minutes_before", label: "Minutes before (for upcoming)", type: "number", defaultValue: 15 },
    ],
  },
  webhook: {
    subType: "webhook",
    configFields: [],
    infoText: "Webhook URL will be generated after saving.",
  },
  manual: {
    subType: "manual",
    configFields: [],
    infoText: 'Click "Run" to trigger this workflow manually.',
  },
};

// ── SYNC-END: triggerConfigs ────────────────────────────────────

// ── SYNC-START: actionConfigs ───────────────────────────────────

export const SUPRATEAM_ACTION_CONFIGS: Record<string, NodeTypeRegistration> = {
  send_telegram: {
    subType: "send_telegram",
    configFields: [
      { key: "bot_token", label: "Bot Token", type: "secret", placeholder: "credential:<id>" },
      { key: "message", label: "Message template", type: "textarea", placeholder: "Use {{deal_name}}, {{stage}}, {{value}}" },
      { key: "chat_id", label: "Chat ID override (optional)", type: "text", placeholder: "Default: deal's linked chat" },
    ],
  },
  send_email: {
    subType: "send_email",
    configFields: [
      { key: "to", label: "To (optional override)", type: "text", placeholder: "Default: contact email" },
      { key: "subject", label: "Subject", type: "text", placeholder: "Email subject" },
      { key: "body", label: "Body", type: "textarea", placeholder: "Email body..." },
    ],
  },
  send_slack: {
    subType: "send_slack",
    configFields: [
      { key: "bot_token", label: "Bot Token", type: "secret", placeholder: "credential:<id>" },
      { key: "channel_id", label: "Slack Channel", type: "text", placeholder: "Channel ID" },
      { key: "mention_user_id", label: "@Mention User (optional)", type: "text", placeholder: "Slack user ID" },
      { key: "message", label: "Message template", type: "textarea", placeholder: "{{sender_name}}: {{message_text}}" },
    ],
    infoText: "Variables: {{sender_name}}, {{message_text}}, {{group_name}}, {{message_link}}",
  },
  update_deal: {
    subType: "update_deal",
    configFields: [
      { key: "field", label: "Field", type: "select", options: [{ value: "stage", label: "Stage" }, { value: "value", label: "Value" }, { value: "board_type", label: "Board Type" }, { value: "assigned_to", label: "Assigned To" }] },
      { key: "value", label: "New value", type: "text", placeholder: "Value..." },
    ],
  },
  update_contact: {
    subType: "update_contact",
    configFields: [
      { key: "field", label: "Field", type: "select", options: [{ value: "company", label: "Company" }, { value: "title", label: "Title" }, { value: "phone", label: "Phone" }, { value: "email", label: "Email" }, { value: "name", label: "Name" }] },
      { key: "value", label: "New value", type: "text", placeholder: "Value..." },
    ],
  },
  assign_deal: {
    subType: "assign_deal",
    configFields: [
      { key: "assign_to", label: "Assign to (user ID)", type: "text", placeholder: "User ID" },
    ],
  },
  create_task: {
    subType: "create_task",
    configFields: [
      { key: "title", label: "Task title", type: "text", placeholder: "e.g. Follow up on {{deal_name}}" },
      { key: "description", label: "Description (optional)", type: "textarea", placeholder: "Task details..." },
      { key: "due_hours", label: "Due in (hours)", type: "number", defaultValue: 24 },
    ],
  },
};

// ── SYNC-END: actionConfigs ─────────────────────────────────────

// ── SYNC-START: conditionFields ─────────────────────────────────

export const SUPRATEAM_CONDITION_FIELDS = [
  { value: "board_type", label: "Board Type" },
  { value: "stage", label: "Stage" },
  { value: "value", label: "Value" },
  { value: "assigned_to", label: "Assigned To" },
  { value: "company", label: "Company" },
  { value: "tags", label: "Tags" },
];

// ── SYNC-END: conditionFields ───────────────────────────────────

/** Full SupraTeam registry — ready to pass to BuilderProvider. */
export const SUPRATEAM_REGISTRY: NodeRegistry = {
  triggers: SUPRATEAM_TRIGGERS,
  actions: SUPRATEAM_ACTIONS,
  triggerConfigs: SUPRATEAM_TRIGGER_CONFIGS,
  actionConfigs: SUPRATEAM_ACTION_CONFIGS,
  conditionFields: SUPRATEAM_CONDITION_FIELDS,
};
