# Sherlock Holmes: Unsolved Codebase Mysteries

---

## MYSTERY #1: The Twin Chat Components (Most Critical)

**Evidence:**
- `packages/builder/src/components/builder-chat.tsx` (498 lines)
- `packages/builder/src/components/ai-flow-chat.tsx` (261 lines)
- Both exported from `packages/builder/src/index.ts`
- `AIFlowChat` is marked `@deprecated` but `BuilderChat` is not
- `improvement-shell.tsx` imports only `AIFlowChat`; `workflow-builder.tsx` imports `BuilderChat`

**Deduction:** `BuilderChat` has 237 extra lines for custom node creation/management (2 tabs: "Chat" + "My Nodes"). `AIFlowChat` is stripped-down chat only. The deprecation message is misleading because the "deprecated" version is actively used in the main app.

**Verdict:** REFACTOR. Merge into single `BuilderChat` with optional `showCustomNodePanel?: boolean` prop. Delete `AIFlowChat`. Update `improvement-shell.tsx`.

---

## MYSTERY #2: Domain-Specific Nodes in a "Generic" Builder

**Evidence:**
- 7 domain nodes hardcoded in builder: `PersonaNode`, `AppNode`, `CompetitorNode`, `ConsensusNode`, `AffinityCategoryNode`, `StepNode`, `ConfigNode`
- These are registered directly in `flow-canvas.tsx` nodeTypes
- They have handlers in `workflow-engine.ts` (lines 758-867) but are NOT in `RETRYABLE_TYPES`
- They're data containers/visualizations, not executable workflow steps

**Deduction:** The builder claims to be self-contained and generic, but ships with SupraLoop-specific nodes hardcoded. A user importing `@supra/builder` for their own app will see "Persona" and "Competitor" nodes that are meaningless outside SupraLoop context.

**Verdict:** INVESTIGATE. Either:
- A) Move domain nodes to host app as `customNodeTypes` (correct architecture)
- B) Document explicitly that the builder is pre-specialized for SupraLoop

---

## MYSTERY #3: Templates vs. Workspaces Confusion

**Evidence:**
- **FlowTemplate**: Named, searchable, categorized flow snapshots. Stored at `supraloop:custom-templates`
- **Workspace**: Working session state. Stored at `supraloop:workspaces`
- Both store `nodes[]` and `edges[]`
- UI has "Save as template" button AND "Workspace manager" dropdown — no guidance on when to use which

**Deduction:** Semantic redundancy creating UX confusion. Both are named canvas snapshots with different metadata.

**Verdict:** KEEP BUT CLARIFY. Templates = shareable/publishable. Workspaces = personal working sessions. Add UI copy explaining the distinction, or merge with a `visibility: private | public` flag.

---

## MYSTERY #4: Missing Node Summaries in Canvas Summary

**Evidence:**
- `canvas-summary.ts` has explicit handlers for: persona, app, competitor, llm, trigger, condition, transform, output, action, note
- Missing: `consensusNode`, `affinityCategoryNode`, `stepNode`, `configNode`
- These fall through to generic `[${node.type}]` format

**Deduction:** When the AI chat reads the canvas for context, it gets rich summaries for some nodes but generic labels for others. The AI loses context for consensus/affinity/step/config nodes, degrading chat quality.

**Verdict:** FIX IMMEDIATELY (15 minutes). Add 4 missing switch cases:
```typescript
case "consensusNode":
  lines.push(`  - [Consensus] "${label}" personas=${d.personas?.length || 0}`);
case "affinityCategoryNode":
  lines.push(`  - [Category] "${label}" weight=${d.weight} score=${d.score}`);
case "stepNode":
  lines.push(`  - [Step ${d.stepIndex + 1}] "${label}" ${d.status}`);
case "configNode":
  lines.push(`  - [Config] "${label}" type=${d.configType} path="${d.filePath}"`);
```

---

## MYSTERY #5: Builder Package Doesn't Import @anthropic-ai/sdk

**Evidence:**
- `packages/builder/package.json` has NO dependency on `@anthropic-ai/sdk`
- Builder exports `FlowChatHandler` and `LLMExecuteHandler` types
- Host app implements these handlers and passes them as props

**Deduction:** This is actually **correct architecture** — clean dependency inversion. The builder doesn't care about Claude/OpenAI/Ollama. It just defines interfaces.

**Verdict:** NO ISSUE. Keep as-is. This is well-designed.

---

## MYSTERY #6: The ConfigNode — The Strangest Thing in the Codebase

**Evidence:**
- `ConfigNode` (144 lines) visualizes `.claude/` config files
- Has NO execution logic, NO templates using it except "Claude Code Config Structure"
- That template is a 27-node graph showing `.claude/settings.json`, `.claude/commands/review.md`, `.claude/skills/deploy/` etc.
- Not executable, not reusable outside Claude Code context, not in retryable types

**Deduction:** This appears to be an internal documentation flowchart that accidentally got shipped as a node type. It's neither a workflow primitive nor a domain-specific business node — it's a visualization of Claude Code's file structure.

**Verdict:** DELETE or DOCUMENT. If it serves an educational purpose, move it to a separate "examples" directory. If not, remove it from the builder package entirely.

---

## SUMMARY

| Mystery | Severity | Action | Effort |
|---------|----------|--------|--------|
| Twin chat components | Critical | Merge into one | 2 hours |
| Domain nodes in generic builder | High | Move to customNodeTypes | 3-4 hours |
| Templates vs. Workspaces | Medium | Add UX clarity | 1 hour |
| Missing node summaries | Critical | Add 4 switch cases | 15 min |
| No @anthropic-ai/sdk in builder | None | Perfect design | — |
| ConfigNode mystery | High | Delete or document | 30 min |

**Recommendations (priority order):**
1. Today: Fix canvas-summary.ts (15 min)
2. This sprint: Merge chat components (2 hours)
3. This sprint: Move domain nodes to host app customNodeTypes (3-4 hours)
4. Document: Templates vs. Workspaces distinction
5. Investigate: ConfigNode — delete if unused
