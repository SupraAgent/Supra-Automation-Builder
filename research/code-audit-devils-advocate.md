# Code Audit: Devil's Advocate

**15 production-breaking issues found (9 CRITICAL, 4 HIGH, 2 MEDIUM)**

---

## CRITICAL (9)

### 1. Silent Credential Decryption Failures
**File:** `packages/builder/src/lib/credential-store.ts:162-166`
**Risk:** User provides wrong passphrase → function returns null → app treats credential as missing.
**Impact:** SILENT FAILURE. User can't access their own credentials. Data effectively lost.

### 2. localStorage Quota Not Checked
**File:** `packages/builder/src/hooks/use-workspaces.ts:38-46, 65-82`
**Risk:** `saveAll()` returns false on quota exceeded. `createWorkspace()` ignores return value. User thinks workspace is saved, but it isn't.
**Impact:** DATA LOSS. User can lose hours of work silently.

### 3. Workspace Race Condition (Multi-Tab)
**File:** `packages/builder/src/hooks/use-workspaces.ts:86-112`
**Risk:** Two tabs call `saveWorkspace()` simultaneously. Both read, both modify, last-write-wins.
**Impact:** SILENT DATA LOSS. One tab's edits silently overwritten.

### 4. XSS via User Node Definitions
**File:** `packages/builder/src/components/builder-chat.tsx:45-83`
**Risk:** AI can craft node definitions with XSS payloads in field values. Stored and rendered without sanitization.
**Impact:** XSS. App-level code execution.

### 5. Missing Auth on 28+ API Routes
**Files:** `src/app/api/flow-execute-llm/route.ts`, `src/app/api/score/route.ts`, `src/app/api/ai-chat/route.ts`, +24 more
**Risk:** Unauthenticated users can trigger workflows, read execution history, drain API credits.
**Impact:** ACCOUNT TAKEOVER + COST DRAIN.

### 6. API Key Exposure in Error Messages
**File:** `src/app/api/flow-execute-llm/route.ts:83-88`
**Risk:** If Anthropic returns "Invalid API key: sk-ant-xxx...", full key appears in SSE stream, console, and error UI.
**Impact:** CREDENTIAL EXPOSURE.

### 7. API Key Stored Plaintext in localStorage
**File:** `packages/builder/src/components/builder-chat.tsx:160-164`, `workflow-builder.tsx:467`
**Risk:** Anthropic API key in `localStorage` unencrypted. Any XSS attack steals it.
**Impact:** CREDENTIAL THEFT.

### 8. saveCredentials() Not Error-Handled
**File:** `packages/builder/src/lib/credential-store.ts:112-114, 149-152`
**Risk:** `saveCredentials()` throws on localStorage full. No catch in `addCredential()`. UUID returned as if saved, but credential is lost.
**Impact:** DATA LOSS.

### 9. Corrupted JSON Silently Dropped
**File:** `packages/builder/src/lib/credential-store.ts:103-110`
**Risk:** If localStorage corruption (partial write, browser crash), `JSON.parse` fails → catch returns `[]` → all credentials vanish.
**Impact:** SILENT DATA LOSS of all credentials.

---

## HIGH (4)

### 10. Streaming Response Race Condition
**File:** `src/app/builder/page.tsx:19-40`
**Risk:** Function returns before stream is fully read. Two parallel LLM nodes can get a dead reader.
**Impact:** SILENT STREAM LOSS. Second LLM node produces empty result.

### 11. Unhandled Promise in executeNode()
**File:** `packages/builder/src/lib/workflow-engine.ts:1213-1218`
**Risk:** No `.catch()` on `executeNode()`. Unhandled rejection leaves node in `inFlightNodes` forever.
**Impact:** HUNG WORKFLOW. User can't cancel or recover.

### 12. Condition Node Crash on Invalid Expression
**File:** `packages/builder/src/lib/workflow-engine.ts:482-525`
**Risk:** `const [, , op, valStr] = numMatch;` crashes if regex doesn't match (numMatch is null).
**Impact:** CRASH during workflow execution.

### 13. No maxTokens Validation on LLM Nodes
**File:** `packages/builder/src/lib/workflow-engine.ts:359-375`
**Risk:** User sets maxTokens to 999999 → triggers multi-$1000 API call.
**Impact:** COST OVERRUN.

---

## MEDIUM (2)

### 14. Duplicate Execution IDs
**File:** `packages/builder/src/lib/workflow-engine.ts:272`
**Risk:** `exec-${Date.now()}` — two workflows starting in same millisecond get same ID.
**Impact:** SILENT STATE CORRUPTION.

### 15. Ollama Hardcoded, No Timeout
**File:** `packages/builder/src/lib/workflow-engine.ts:453-473`
**Risk:** `http://localhost:11434` with no timeout. Ollama not running = workflow hangs.
**Impact:** HUNG WORKFLOW.

---

## PRIORITY ACTIONS

1. Add error handling to ALL localStorage operations with user-visible feedback
2. Move API keys to encrypted credential store (not plaintext localStorage)
3. Add `requireAuth()` to ALL API routes
4. Sanitize all user-generated node definitions before rendering
5. Fix promise handling in execution engine and chat
6. Add maxTokens validation (cap at 100,000)
7. Fix race conditions with optimistic locks or version fields
