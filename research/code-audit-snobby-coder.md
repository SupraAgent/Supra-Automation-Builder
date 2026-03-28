# Code Audit: Snobby Coder

**Score: 23 issues found (4 CRITICAL, 8 HIGH, 6 MEDIUM, 5 LOW)**

---

## CRITICAL ISSUES (4)

### 1. Unhandled Promise Rejection in Execution Engine
**File:** `packages/builder/src/lib/workflow-engine.ts:1213`
**Category:** Bug / Unhandled Promise

`executeNode(nodeId).then()` has no `.catch()` handler. If executeNode throws unexpectedly, the node stays in `inFlightNodes` forever and the workflow hangs indefinitely.

**Fix:** Add `.finally()` to always clean up:
```typescript
executeNode(nodeId).finally(() => {
  inFlightNodes.delete(nodeId);
  checkAndLaunch();
});
```

### 2. Unsafe Base64 Decoding in Credential Store
**File:** `packages/builder/src/lib/credential-store.ts:26-32, 83-92`
**Category:** Security / Type Safety

`atob().split("").map(c => c.charCodeAt(0))` doesn't handle Unicode properly and can truncate/corrupt binary data. If a corrupted salt is stored, decryption silently fails.

**Fix:** Pre-validate base64 input and throw on corruption instead of silent failure.

### 3. ReDoS Vulnerability via User-Provided Regex
**File:** `packages/builder/src/lib/workflow-engine.ts:580, 638, 687`
**Category:** Bug / Unsafe Regex

User-provided regex patterns are passed directly to `new RegExp(expr, "gi")`. Invalid regex crashes the workflow. Crafted regex like `(a|a)*b` causes catastrophic backtracking (ReDoS), hanging the entire execution.

**Fix:** Add `safeRegex()` wrapper with pattern length limit, timeout, and try-catch.

### 4. Promise Swallowing in Builder Chat
**File:** `packages/builder/src/components/builder-chat.tsx:226`
**Category:** Bug / Unhandled Promise

Empty catch block swallows all errors in `handleSend()`. If `onChat()` throws, `setLoading(false)` is never reached, leaving UI permanently in "Loading..." state.

**Fix:** Use `finally { setLoading(false); }` pattern.

---

## HIGH SEVERITY (8)

### 5. Stream Reading with No Error Recovery
**File:** `packages/builder/src/lib/workflow-engine.ts:404-416`

If `reader.read()` rejects mid-stream, error propagates without cleanup. `finalContent` may be incomplete with no indication to the user.

### 6. Silent Credential Decryption Failures
**File:** `packages/builder/src/lib/credential-store.ts:162-166, 176-180`

Decryption errors return `null` without logging. User can't tell if passphrase is wrong vs. credential doesn't exist.

### 7. Hardcoded Ollama Localhost with No Timeout
**File:** `packages/builder/src/lib/workflow-engine.ts:455-473`

Calls `http://localhost:11434` with no timeout, no retry, no fallback. If Ollama isn't running, workflow hangs indefinitely.

### 8. Weak ID Generation in Clipboard
**File:** `packages/builder/src/hooks/use-clipboard.ts:52-54`

Group remapping uses `Date.now()` + `.slice(2, 6)` — only ~26 bits of entropy. Collisions possible within a single session.

### 9. Dangerous String Parsing in Condition Node
**File:** `packages/builder/src/lib/workflow-engine.ts:507-521`

Naive regex matching is too permissive — matches ANY word followed by operators in upstream text, not just the condition expression.

### 10. Module-level Mutable Storage Prefix
**File:** `packages/builder/src/lib/credential-store.ts:14, 54`

`STORAGE_PREFIX` is module-level state. Multiple `WorkflowBuilder` instances share the same prefix (last one wins), leaking credentials between instances.

### 11. Unsafe JSON Parsing / Prototype Pollution
**File:** `packages/builder/src/lib/workflow-engine.ts:432-437`

Parses structured LLM output without validating for `__proto__` or `constructor` keys. Potential prototype pollution risk.

### 12. No Validation of Parsed numMatch
**File:** `packages/builder/src/lib/workflow-engine.ts:507-521`

`const [, , op, valStr] = numMatch;` crashes if regex doesn't match (numMatch is null). No null check.

---

## MEDIUM SEVERITY (6)

### 13. Massive Template Duplication
**File:** `packages/builder/src/lib/flow-templates.ts`

"Balanced Team", "Design-Led Team", and "Eng-Heavy Team" templates are 80% identical. Should use a factory function.

### 14. Repeated Logic in Canvas Summary
**File:** `packages/builder/src/lib/canvas-summary.ts:14-57`

Massive switch statement with similar output patterns copy-pasted 12 times.

### 15. Inline Utility Functions
**File:** `packages/builder/src/components/workflow-builder.tsx:82-104`

`formatCost()`, `formatTokens()`, `relativeTime()` defined inline but needed elsewhere. Should be in `lib/utils.ts`.

### 16. Incomplete Dependency Checking
**File:** `packages/builder/src/lib/workflow-engine.ts:1032-1041`

`isReady()` doesn't account for `userNode` types that may not be in `executableIds`.

### 17. Alignment Snap Math Error
**File:** `packages/builder/src/components/flow-canvas.tsx:233-234, 257-258`

`Math.abs()` comparison may be backward, causing nodes to snap to worse positions.

### 18. Missing Node Summaries
**File:** `packages/builder/src/lib/canvas-summary.ts`

`consensusNode`, `affinityCategoryNode`, `stepNode`, `configNode` fall through to generic default case. AI loses context for these nodes.

---

## LOW SEVERITY (5)

### 19. Unsafe Array Access
**File:** `packages/builder/src/lib/workflow-engine.ts:821`

`numbers[numbers.length - 1]` without explicit null check.

### 20. Unnecessary JSON Serialization in Undo/Redo
**File:** `packages/builder/src/hooks/use-undo-redo.ts:34-35`

Uses `JSON.stringify()`/`JSON.parse()` instead of `structuredClone()`.

### 21. Arbitrary Chat History Limit
**File:** `packages/builder/src/components/builder-chat.tsx:175`

`messages.slice(-8)` truncates history with no user indication.

### 22. Note Nodes Excluded from Execution Plan
**File:** `packages/builder/src/lib/workflow-engine.ts:275`

`createExecution()` filters out noteNodes entirely. They don't appear in execution history, confusing users.

### 23. Awkward Base64 Encoding
**File:** `packages/builder/src/lib/credential-store.ts:42, 45-46`

Uses `atob()`/`btoa()` instead of modern `TextEncoder`/`TextDecoder`.

---

## SUMMARY

| Severity | Count |
|----------|-------|
| CRITICAL | 4 |
| HIGH | 8 |
| MEDIUM | 6 |
| LOW | 5 |
| **TOTAL** | **23** |

**Top 3 priorities:**
1. Fix unhandled promise at workflow-engine.ts:1213 (workflow hangs)
2. Add ReDoS protection for user-provided regex patterns
3. Fix builder-chat.tsx catch blocks (permanent loading state)
