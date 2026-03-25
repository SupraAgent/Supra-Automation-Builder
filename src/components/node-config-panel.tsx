"use client";

import * as React from "react";
import type { Node } from "@xyflow/react";
import type {
  WorkflowNodeData,
  TriggerNodeData,
  ActionNodeData,
  ConditionNodeData,
  DelayNodeData,
  TryCatchNodeData,
  CodeNodeData,
  SwitchNodeData,
  LoopNodeData,
  ConfigFieldDef,
  NodeTypeRegistration,
} from "../core/types";
import { DEFAULT_OPERATORS } from "../core/types";
import { useBuilderContext } from "./builder-context";

interface NodeConfigPanelProps {
  node: Node;
  onDataChange: (nodeId: string, data: WorkflowNodeData) => void;
  onDelete: (nodeId: string) => void;
}

export function NodeConfigPanel({ node, onDataChange, onDelete }: NodeConfigPanelProps) {
  const data = node.data as unknown as WorkflowNodeData;
  const { registry } = useBuilderContext();

  function update(partial: Partial<WorkflowNodeData>) {
    onDataChange(node.id, { ...data, ...partial } as WorkflowNodeData);
  }

  function updateConfig(key: string, value: unknown) {
    onDataChange(node.id, {
      ...data,
      config: { ...(data.config as Record<string, unknown>), [key]: value },
    } as unknown as WorkflowNodeData);
  }

  const accentMap: Record<string, string> = {
    trigger: "text-purple-400",
    action: "text-blue-400",
    condition: "text-yellow-400",
    delay: "text-gray-400",
    try_catch: "text-orange-400",
    code: "text-violet-400",
    switch: "text-cyan-400",
    loop: "text-indigo-400",
  };

  // Look up registered config fields
  let registration: NodeTypeRegistration | undefined;
  if (data.nodeType === "trigger") {
    registration = registry.triggerConfigs?.[(data as TriggerNodeData).triggerType];
  } else if (data.nodeType === "action") {
    registration = registry.actionConfigs?.[(data as ActionNodeData).actionType];
  }

  return (
    <div className="w-72 shrink-0 border-l border-white/10 bg-white/[0.02] p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wider ${accentMap[data.nodeType] ?? "text-foreground"}`}>
          {data.nodeType} Config
        </p>
      </div>

      {/* Label */}
      <Field label="Label">
        <input
          value={data.label}
          onChange={(e) => update({ label: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder="Node label"
        />
      </Field>

      {/* Registered config fields for triggers/actions */}
      {registration && (
        <RegisteredConfig
          registration={registration}
          config={data.config as Record<string, unknown>}
          updateConfig={updateConfig}
        />
      )}

      {/* Built-in config for condition/delay */}
      {data.nodeType === "condition" && (
        <ConditionConfig data={data} updateConfig={updateConfig} />
      )}
      {data.nodeType === "delay" && (
        <DelayConfig data={data} updateConfig={updateConfig} />
      )}
      {data.nodeType === "try_catch" && (
        <TryCatchConfig data={data as TryCatchNodeData} />
      )}
      {data.nodeType === "code" && (
        <CodeConfig data={data as CodeNodeData} updateConfig={updateConfig} />
      )}
      {data.nodeType === "switch" && (
        <SwitchConfig
          data={data as SwitchNodeData}
          updateConfig={updateConfig}
          onDataChange={(newData) => onDataChange(node.id, newData)}
        />
      )}
      {data.nodeType === "loop" && (
        <LoopConfig data={data as LoopNodeData} updateConfig={updateConfig} />
      )}

      <div className="pt-3 border-t border-white/10">
        <button
          onClick={() => onDelete(node.id)}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full justify-start text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete Node
        </button>
      </div>
    </div>
  );
}

// ── Registered config fields (plugin-provided) ──────────────────

function RegisteredConfig({
  registration,
  config,
  updateConfig,
}: {
  registration: NodeTypeRegistration;
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      {registration.infoText && (
        <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
          <p className="text-[10px] text-muted-foreground">{registration.infoText}</p>
        </div>
      )}

      {registration.configFields.map((field) => (
        <ConfigField
          key={field.key}
          field={field}
          value={config[field.key]}
          onChange={(v) => updateConfig(field.key, v)}
        />
      ))}
    </div>
  );
}

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: ConfigFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const strVal = value == null ? "" : String(value);

  if (field.type === "secret") {
    return (
      <SecretField
        field={field}
        value={strVal}
        onChange={onChange}
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Field label={field.label}>
        <textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs resize-none outline-none focus:border-white/20"
          rows={4}
          placeholder={field.placeholder}
        />
      </Field>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <Field label={field.label}>
        <select
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs outline-none"
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (field.type === "number") {
    return (
      <Field label={field.label}>
        <input
          type="number"
          value={strVal}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder={field.placeholder}
        />
      </Field>
    );
  }

  return (
    <Field label={field.label}>
      <input
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
        placeholder={field.placeholder}
      />
    </Field>
  );
}

// ── Secret field (credential vault) ──────────────────────────────

function SecretField({
  field,
  value,
  onChange,
}: {
  field: ConfigFieldDef;
  value: string;
  onChange: (value: unknown) => void;
}) {
  const [revealed, setRevealed] = React.useState(false);

  // A credential reference looks like "credential:<id>"
  const isCredentialRef = value.startsWith("credential:");
  const displayValue = isCredentialRef
    ? `\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022 (${value.replace("credential:", "")})`
    : value;

  return (
    <Field label={field.label}>
      <div className="relative">
        <input
          type={revealed && !isCredentialRef ? "text" : "password"}
          value={isCredentialRef ? displayValue : value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isCredentialRef}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20 pr-16"
          placeholder={field.placeholder ?? "Secret value or credential:id"}
          autoComplete="off"
          data-1p-ignore="true"
          data-lpignore="true"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          {!isCredentialRef && (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded transition-colors"
              title={revealed ? "Hide" : "Reveal"}
            >
              {revealed ? "Hide" : "Show"}
            </button>
          )}
          {isCredentialRef && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded transition-colors"
              title="Clear credential reference"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {isCredentialRef && (
        <p className="text-[9px] text-muted-foreground mt-0.5">
          Linked to credential vault. Value resolved at execution time.
        </p>
      )}
    </Field>
  );
}

// ── Condition config ─────────────────────────────────────────────

function ConditionConfig({
  data,
  updateConfig,
}: {
  data: ConditionNodeData;
  updateConfig: (key: string, value: unknown) => void;
}) {
  const { registry } = useBuilderContext();
  const fields = registry.conditionFields ?? [
    { value: "status", label: "Status" },
    { value: "type", label: "Type" },
    { value: "value", label: "Value" },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 px-3 py-2">
        <p className="text-[10px] text-yellow-400/80">If / Else Branch</p>
      </div>

      <Field label="Field">
        <select
          value={data.config.field ?? ""}
          onChange={(e) => updateConfig("field", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs outline-none"
        >
          <option value="">Select field…</option>
          {fields.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Operator">
        <select
          value={data.config.operator ?? "equals"}
          onChange={(e) => updateConfig("operator", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs outline-none"
        >
          {DEFAULT_OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Value">
        <input
          value={data.config.value ?? ""}
          onChange={(e) => updateConfig("value", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder="Compare value…"
        />
      </Field>

      <div className="flex gap-2 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> True path
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" /> False path
        </span>
      </div>
    </div>
  );
}

// ── Delay config ─────────────────────────────────────────────────

function DelayConfig({
  data,
  updateConfig,
}: {
  data: DelayNodeData;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
        <p className="text-[10px] text-muted-foreground">Wait before continuing</p>
      </div>

      <Field label="Duration">
        <input
          type="number"
          value={String(data.config.duration ?? 1)}
          onChange={(e) => updateConfig("duration", Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          min={1}
        />
      </Field>

      <Field label="Unit">
        <select
          value={data.config.unit ?? "hours"}
          onChange={(e) => updateConfig("unit", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs outline-none"
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </Field>
    </div>
  );
}

// ── Try/Catch config ─────────────────────────────────────────────

function TryCatchConfig({ data }: { data: TryCatchNodeData }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-orange-500/5 border border-orange-500/10 px-3 py-2">
        <p className="text-[10px] text-orange-400/80">Try / Catch Error Handler</p>
      </div>

      <div className="text-[10px] text-muted-foreground space-y-1.5">
        <p>
          Connect nodes to the <span className="text-emerald-400 font-medium">Success</span> handle
          for the try path. If any node fails, execution routes to the{" "}
          <span className="text-red-400 font-medium">Error</span> handle.
        </p>
        <p>
          The caught error message is available as{" "}
          <code className="bg-white/5 px-1 rounded text-[9px]">_tryCatchError</code> in context variables.
        </p>
      </div>

      <div className="flex gap-2 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Success path
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" /> Error path
        </span>
      </div>
    </div>
  );
}

// ── Code config ──────────────────────────────────────────────────

function CodeConfig({
  data,
  updateConfig,
}: {
  data: CodeNodeData;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-violet-500/5 border border-violet-500/10 px-3 py-2">
        <p className="text-[10px] text-violet-400/80">Custom Code Execution</p>
      </div>

      <Field label="Language">
        <select
          value={data.config.language ?? "javascript"}
          onChange={(e) => updateConfig("language", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs outline-none"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
        </select>
      </Field>

      <Field label="Code">
        <textarea
          value={data.config.code ?? ""}
          onChange={(e) => updateConfig("code", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs resize-none outline-none focus:border-white/20 font-mono"
          rows={8}
          placeholder={`// Access upstream data via input\n// Access workflow vars via context\nconst result = input;\nreturn result;`}
          spellCheck={false}
        />
      </Field>

      <Field label="Timeout (ms)">
        <input
          type="number"
          value={String(data.config.timeout ?? 5000)}
          onChange={(e) => updateConfig("timeout", Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          min={100}
          max={60000}
        />
      </Field>

      <div className="text-[10px] text-muted-foreground space-y-1.5">
        <p>
          Code receives <code className="bg-white/5 px-1 rounded text-[9px]">input</code> (upstream outputs)
          and <code className="bg-white/5 px-1 rounded text-[9px]">context</code> (workflow vars).
        </p>
        <p>Must return a value. Use <code className="bg-white/5 px-1 rounded text-[9px]">return</code> to output results.</p>
      </div>
    </div>
  );
}

// ── Switch config ────────────────────────────────────────────────

function SwitchConfig({
  data,
  updateConfig,
  onDataChange,
}: {
  data: SwitchNodeData;
  updateConfig: (key: string, value: unknown) => void;
  onDataChange: (newData: WorkflowNodeData) => void;
}) {
  const cases = data.config.cases ?? [];

  function addCase() {
    const newCases = [...cases, { value: `case_${cases.length + 1}`, label: `Case ${cases.length + 1}` }];
    onDataChange({
      ...data,
      config: { ...data.config, cases: newCases },
    });
  }

  function removeCase(index: number) {
    const newCases = cases.filter((_, i) => i !== index);
    onDataChange({
      ...data,
      config: { ...data.config, cases: newCases },
    });
  }

  function updateCase(index: number, field: "value" | "label", val: string) {
    const newCases = cases.map((c, i) =>
      i === index ? { ...c, [field]: val } : c
    );
    onDataChange({
      ...data,
      config: { ...data.config, cases: newCases },
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 px-3 py-2">
        <p className="text-[10px] text-cyan-400/80">Multi-way Branch</p>
      </div>

      <Field label="Expression">
        <input
          value={data.config.expression ?? ""}
          onChange={(e) => updateConfig("expression", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder="{{variable}} or {{nodeId.output.field}}"
        />
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-muted-foreground">Cases</label>
          <button
            type="button"
            onClick={addCase}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            + Add case
          </button>
        </div>

        {cases.map((c, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <input
              value={c.value}
              onChange={(e) => updateCase(i, "value", e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-[10px] outline-none focus:border-white/20"
              placeholder="Value"
            />
            <input
              value={c.label}
              onChange={(e) => updateCase(i, "label", e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-[10px] outline-none focus:border-white/20"
              placeholder="Label"
            />
            <button
              type="button"
              onClick={() => removeCase(i)}
              className="text-red-400/70 hover:text-red-400 text-[10px] shrink-0 px-1"
              title="Remove case"
            >
              x
            </button>
          </div>
        ))}

        {cases.length === 0 && (
          <p className="text-[10px] text-muted-foreground/50 italic">No cases defined</p>
        )}
      </div>

      <Field label="Default Case">
        <input
          value={data.config.defaultCase ?? ""}
          onChange={(e) => updateConfig("defaultCase", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder="default"
        />
      </Field>

      <div className="text-[10px] text-muted-foreground">
        <p>
          Expression is evaluated and compared to each case value.
          Connect edges from each case handle to the target nodes.
        </p>
      </div>
    </div>
  );
}

// ── Loop config ──────────────────────────────────────────────────

function LoopConfig({
  data,
  updateConfig,
}: {
  data: LoopNodeData;
  updateConfig: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 px-3 py-2">
        <p className="text-[10px] text-indigo-400/80">Loop / Iteration</p>
      </div>

      <Field label="Array Expression">
        <input
          value={data.config.arrayExpression ?? ""}
          onChange={(e) => updateConfig("arrayExpression", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder="{{nodeId.output.items}}"
        />
      </Field>

      <Field label="Item Variable Name">
        <input
          value={data.config.itemVariable ?? "item"}
          onChange={(e) => updateConfig("itemVariable", e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          placeholder="item"
        />
      </Field>

      <Field label="Max Iterations">
        <input
          type="number"
          value={String(data.config.maxIterations ?? 100)}
          onChange={(e) => updateConfig("maxIterations", Number(e.target.value))}
          className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs h-8 outline-none focus:border-white/20"
          min={1}
          max={10000}
        />
      </Field>

      <div className="flex gap-2 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-400" /> Body (each item)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Complete
        </span>
      </div>

      <div className="text-[10px] text-muted-foreground space-y-1.5">
        <p>
          Each iteration sets{" "}
          <code className="bg-white/5 px-1 rounded text-[9px]">{data.config.itemVariable || "item"}</code>,{" "}
          <code className="bg-white/5 px-1 rounded text-[9px]">_loopIndex</code>, and{" "}
          <code className="bg-white/5 px-1 rounded text-[9px]">_loopLength</code> in context vars.
        </p>
      </div>
    </div>
  );
}

// ── Shared field wrapper ─────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
