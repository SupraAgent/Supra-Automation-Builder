# CPO Node Expansion Plan: 20 New Nodes

**CPO Panel:** Figma (Builder UX) + n8n (Automation) + Perplexity (AI Intelligence)
**Date:** 2026-03-27

---

## Overview

The current palette has 14 nodes across 2 groups (Core: 5, Workflow: 9). This expansion adds 20 new nodes across 4 NEW groups, bringing the total to **34 nodes** organized in **6 groups**.

### New Groups

| Group | Focus | Nodes | Color Theme |
|-------|-------|-------|-------------|
| **Integration** | External service connectors | 5 | Cyan/Teal |
| **Data** | Data processing & manipulation | 5 | Amber/Yellow |
| **Logic** | Flow control & routing | 5 | Rose/Pink |
| **AI** | Intelligence & NLP tasks | 5 | Purple/Indigo |

---

## GROUP: INTEGRATION (5 nodes)

### 1. HTTP Request (🌐)
- **Type:** `httpNode`
- **Description:** Make API calls
- **Help:** Send HTTP requests to any API — GET, POST, PUT, DELETE with headers and body
- **Color:** `border-cyan-500/40 bg-cyan-500/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `method` — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **Data Fields:**
  - label: string = "HTTP Request"
  - method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET"
  - url: string = "https://api.example.com"
  - headers: string = "" // JSON string of key-value pairs
  - body: string = "" // Request body template with {{interpolation}}
  - timeout: number = 30000
  - authType: "none" | "bearer" | "basic" | "api-key" = "none"
  - authValue: string = ""
- **Inspector:** Method dropdown, URL text field, headers textarea, body textarea, auth type dropdown, auth value field, timeout number
- **Execution:** Performs real fetch() with interpolated URL/body, returns response text + status as structured output
- **Summary:** `[HTTP] "label" method=GET url="https://..."`

### 2. Webhook (🔗)
- **Type:** `webhookNode`
- **Description:** Receive HTTP calls
- **Help:** Listen for incoming webhook requests — use as a trigger or mid-flow receiver
- **Color:** `border-teal-500/40 bg-teal-500/10`
- **Handles:** source (right) only
- **Type Selector:** `webhookMethod` — `POST`, `GET`, `PUT`, `ANY`
- **Data Fields:**
  - label: string = "Webhook Listener"
  - webhookMethod: "POST" | "GET" | "PUT" | "ANY" = "POST"
  - path: string = "/webhook/my-flow"
  - secret: string = "" // HMAC validation secret
  - responseCode: number = 200
  - responseBody: string = '{"ok": true}'
- **Inspector:** Method dropdown, path text field, secret field, response code number, response body textarea
- **Execution:** Registers endpoint path, validates HMAC if secret provided, returns parsed request body
- **Summary:** `[Webhook] "label" POST /webhook/my-flow`

### 3. Email (📧)
- **Type:** `emailNode`
- **Description:** Send & read email
- **Help:** Send emails via SMTP or read from IMAP — supports HTML templates
- **Color:** `border-cyan-400/40 bg-cyan-400/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `emailAction` — `send`, `read`, `reply`, `forward`
- **Data Fields:**
  - label: string = "Send Email"
  - emailAction: "send" | "read" | "reply" | "forward" = "send"
  - to: string = ""
  - subject: string = ""
  - body: string = "" // Supports {{interpolation}}
  - format: "text" | "html" = "text"
  - provider: "smtp" | "sendgrid" | "resend" = "smtp"
- **Inspector:** Action dropdown, to/subject/body fields, format dropdown, provider dropdown
- **Execution:** Composes email with interpolated fields, returns send status or inbox messages
- **Summary:** `[Email] "label" send to="user@..." subject="..."`

### 4. Database (🗄️)
- **Type:** `databaseNode`
- **Description:** Query databases
- **Help:** Read or write data from Postgres, MySQL, MongoDB, or Supabase
- **Color:** `border-teal-400/40 bg-teal-400/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `dbAction` — `query`, `insert`, `update`, `delete`, `upsert`
- **Data Fields:**
  - label: string = "Database Query"
  - dbAction: "query" | "insert" | "update" | "delete" | "upsert" = "query"
  - dbType: "postgres" | "mysql" | "mongodb" | "supabase" | "sqlite" = "postgres"
  - connectionString: string = "" // Credential reference
  - table: string = ""
  - query: string = "SELECT * FROM users LIMIT 10"
  - params: string = "[]" // JSON array of query params
- **Inspector:** Action dropdown, DB type dropdown, connection field, table field, query textarea, params textarea
- **Execution:** Executes query with parameterized inputs, returns rows as structured output
- **Summary:** `[DB] "label" query postgres table="users"`

### 5. Storage (💾)
- **Type:** `storageNode`
- **Description:** File & object storage
- **Help:** Read or write files to S3, R2, local filesystem, or Supabase Storage
- **Color:** `border-cyan-600/40 bg-cyan-600/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `storageAction` — `read`, `write`, `list`, `delete`, `copy`
- **Data Fields:**
  - label: string = "File Storage"
  - storageAction: "read" | "write" | "list" | "delete" | "copy" = "read"
  - provider: "s3" | "r2" | "supabase" | "local" = "local"
  - bucket: string = ""
  - path: string = "/data/output.json"
  - content: string = "" // For write operations, supports {{interpolation}}
- **Inspector:** Action dropdown, provider dropdown, bucket field, path field, content textarea
- **Execution:** Performs storage operation, returns file content or listing
- **Summary:** `[Storage] "label" read local path="/data/output.json"`

---

## GROUP: DATA (5 nodes)

### 6. JSON Parser (📋)
- **Type:** `jsonNode`
- **Description:** Parse & build JSON
- **Help:** Parse JSON strings, build JSON objects, or extract fields with JSONPath
- **Color:** `border-amber-500/40 bg-amber-500/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `jsonAction` — `parse`, `stringify`, `extract`, `build`, `validate`
- **Data Fields:**
  - label: string = "JSON Parser"
  - jsonAction: "parse" | "stringify" | "extract" | "build" | "validate" = "parse"
  - expression: string = "$.data.items" // JSONPath for extract
  - template: string = "" // JSON template for build mode
  - strict: boolean = true
- **Inspector:** Action dropdown, expression field, template textarea, strict checkbox
- **Execution:** Parses input text as JSON / extracts JSONPath / builds template / validates schema
- **Summary:** `[JSON] "label" parse expression="$.data.items"`

### 7. Text (✂️)
- **Type:** `textNode`
- **Description:** Text processing
- **Help:** Split, join, replace, truncate, or template text data
- **Color:** `border-yellow-500/40 bg-yellow-500/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `textAction` — `split`, `join`, `replace`, `truncate`, `template`, `regex`
- **Data Fields:**
  - label: string = "Text Processor"
  - textAction: "split" | "join" | "replace" | "truncate" | "template" | "regex" = "template"
  - delimiter: string = "\n"
  - pattern: string = ""
  - replacement: string = ""
  - maxLength: number = 0 // 0 = no limit
  - template: string = "Hello {{name}}, your score is {{score}}"
- **Inspector:** Action dropdown, delimiter field, pattern/replacement fields, maxLength number, template textarea
- **Execution:** Applies selected text operation to upstream input
- **Summary:** `[Text] "label" template "Hello {{name}}..."`

### 8. Aggregator (📊)
- **Type:** `aggregatorNode`
- **Description:** Combine & reduce
- **Help:** Collect outputs from multiple upstream nodes and aggregate them
- **Color:** `border-amber-400/40 bg-amber-400/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `aggregateType` — `concat`, `sum`, `average`, `min`, `max`, `count`
- **Data Fields:**
  - label: string = "Aggregator"
  - aggregateType: "concat" | "sum" | "average" | "min" | "max" | "count" = "concat"
  - separator: string = "\n---\n"
  - field: string = "" // Specific field to aggregate from structured data
- **Inspector:** Aggregate type dropdown, separator field, field path field
- **Execution:** Collects all upstream inputs, applies aggregation function
- **Summary:** `[Aggregate] "label" concat separator="\n---\n"`

### 9. Validator (✅)
- **Type:** `validatorNode`
- **Description:** Validate data
- **Help:** Check data against rules — required fields, types, ranges, regex patterns
- **Color:** `border-yellow-400/40 bg-yellow-400/10`
- **Handles:** target (left) + 2 sources: "pass" (right-top), "fail" (right-bottom)
- **Type Selector:** `validationType` — `required`, `type-check`, `range`, `regex`, `schema`, `custom`
- **Data Fields:**
  - label: string = "Validator"
  - validationType: "required" | "type-check" | "range" | "regex" | "schema" | "custom" = "required"
  - field: string = "" // Field to validate
  - rule: string = "" // Rule expression (regex pattern, range "1-100", JSON schema)
  - errorMessage: string = "Validation failed"
- **Inspector:** Validation type dropdown, field name, rule textarea, error message field
- **Execution:** Validates upstream data, routes to pass/fail handles (like condition node)
- **Summary:** `[Validate] "label" required field="email"`

### 10. Formatter (🎨)
- **Type:** `formatterNode`
- **Description:** Format output
- **Help:** Format data as Markdown, HTML, CSV, table, or custom template
- **Color:** `border-amber-600/40 bg-amber-600/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `formatType` — `markdown`, `html`, `csv`, `table`, `yaml`, `xml`
- **Data Fields:**
  - label: string = "Formatter"
  - formatType: "markdown" | "html" | "csv" | "table" | "yaml" | "xml" = "markdown"
  - template: string = "" // Custom template with {{field}} placeholders
  - includeHeaders: boolean = true
- **Inspector:** Format type dropdown, template textarea, include headers checkbox
- **Execution:** Converts structured data into specified output format
- **Summary:** `[Format] "label" markdown includeHeaders=true`

---

## GROUP: LOGIC (5 nodes)

### 11. Loop (🔁)
- **Type:** `loopNode`
- **Description:** Iterate over items
- **Help:** Loop through arrays or repeat N times — processes each item through connected nodes
- **Color:** `border-rose-500/40 bg-rose-500/10`
- **Handles:** target (left) + source "item" (right-top) + source "done" (right-bottom)
- **Type Selector:** `loopType` — `forEach`, `times`, `while`, `map`
- **Data Fields:**
  - label: string = "Loop"
  - loopType: "forEach" | "times" | "while" | "map" = "forEach"
  - maxIterations: number = 100
  - field: string = "" // Array field to iterate, or count for times
  - condition: string = "" // For while loops
- **Inspector:** Loop type dropdown, max iterations number, field path, condition field
- **Execution:** Iterates input array/count, emits each item on "item" handle, emits collected results on "done"
- **Summary:** `[Loop] "label" forEach maxIterations=100`

### 12. Switch (🔀)
- **Type:** `switchNode`
- **Description:** Multi-way routing
- **Help:** Route to different branches based on value matching — like a switch/case statement
- **Color:** `border-pink-500/40 bg-pink-500/10`
- **Handles:** target (left) + multiple sources (right, one per case + default)
- **Type Selector:** `matchType` — `exact`, `contains`, `regex`, `range`, `type`
- **Data Fields:**
  - label: string = "Switch"
  - matchType: "exact" | "contains" | "regex" | "range" | "type" = "exact"
  - field: string = "" // Field to match on
  - cases: string = '["case1", "case2", "default"]' // JSON array of case values
- **Inspector:** Match type dropdown, field path, cases textarea (JSON array)
- **Execution:** Evaluates field against cases, routes to matching output handle
- **Summary:** `[Switch] "label" exact field="status" cases=3`

### 13. Delay (⏱️)
- **Type:** `delayNode`
- **Description:** Wait & throttle
- **Help:** Pause execution for a duration, throttle rate, or wait for a condition
- **Color:** `border-rose-400/40 bg-rose-400/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `delayType` — `fixed`, `random`, `throttle`, `debounce`, `cron`
- **Data Fields:**
  - label: string = "Delay"
  - delayType: "fixed" | "random" | "throttle" | "debounce" | "cron" = "fixed"
  - duration: number = 1000 // milliseconds
  - maxDuration: number = 5000 // for random range
  - schedule: string = "" // For cron type
- **Inspector:** Delay type dropdown, duration number (ms), max duration number, schedule field
- **Execution:** Pauses for specified duration before passing data through
- **Summary:** `[Delay] "label" fixed 1000ms`

### 14. Error Handler (🛡️)
- **Type:** `errorHandlerNode`
- **Description:** Catch errors
- **Help:** Wrap nodes in try/catch — handle failures with fallbacks or retries
- **Color:** `border-pink-400/40 bg-pink-400/10`
- **Handles:** target (left) + source "success" (right-top) + source "error" (right-bottom)
- **Type Selector:** `errorAction` — `catch`, `retry`, `fallback`, `log`, `ignore`
- **Data Fields:**
  - label: string = "Error Handler"
  - errorAction: "catch" | "retry" | "fallback" | "log" | "ignore" = "catch"
  - maxRetries: number = 3
  - fallbackValue: string = "" // Default value on error
  - logLevel: "error" | "warn" | "info" = "error"
- **Inspector:** Error action dropdown, max retries number, fallback value textarea, log level dropdown
- **Execution:** Wraps upstream, routes success/error to different handles
- **Summary:** `[ErrorHandler] "label" catch maxRetries=3`

### 15. Merge (🔗)
- **Type:** `mergeNode`
- **Description:** Join branches
- **Help:** Wait for multiple upstream branches and combine their outputs
- **Color:** `border-rose-600/40 bg-rose-600/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `mergeStrategy` — `waitAll`, `firstComplete`, `combine`, `zip`, `append`
- **Data Fields:**
  - label: string = "Merge"
  - mergeStrategy: "waitAll" | "firstComplete" | "combine" | "zip" | "append" = "waitAll"
  - outputFormat: "array" | "object" | "text" = "object"
  - separator: string = "\n"
- **Inspector:** Strategy dropdown, output format dropdown, separator field
- **Execution:** Collects from all upstream nodes based on strategy, outputs merged result
- **Summary:** `[Merge] "label" waitAll outputFormat=object`

---

## GROUP: AI (5 nodes)

### 16. Classifier (🏷️)
- **Type:** `classifierNode`
- **Description:** Categorize text
- **Help:** Use AI to classify text into categories — sentiment, topic, intent, or custom labels
- **Color:** `border-indigo-500/40 bg-indigo-500/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `classifyType` — `sentiment`, `topic`, `intent`, `spam`, `language`, `custom`
- **Data Fields:**
  - label: string = "Classifier"
  - classifyType: "sentiment" | "topic" | "intent" | "spam" | "language" | "custom" = "sentiment"
  - categories: string = "" // Comma-separated custom categories
  - confidence: number = 0.7 // Minimum confidence threshold
  - multiLabel: boolean = false
- **Inspector:** Classify type dropdown, categories CSV field, confidence slider, multi-label checkbox
- **Execution:** Sends upstream text to LLM with classification prompt, returns label + confidence
- **Summary:** `[Classify] "label" sentiment confidence=0.7`

### 17. Summarizer (📝)
- **Type:** `summarizerNode`
- **Description:** Summarize text
- **Help:** AI-powered summarization — bullet points, abstract, TL;DR, or key takeaways
- **Color:** `border-violet-500/40 bg-violet-500/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `summaryStyle` — `bullets`, `abstract`, `tldr`, `takeaways`, `headline`, `custom`
- **Data Fields:**
  - label: string = "Summarizer"
  - summaryStyle: "bullets" | "abstract" | "tldr" | "takeaways" | "headline" | "custom" = "bullets"
  - maxLength: number = 200 // Target output length in words
  - language: string = "en"
  - customPrompt: string = "" // For custom style
- **Inspector:** Style dropdown, max length number, language field, custom prompt textarea
- **Execution:** Sends text to LLM with summarization prompt, returns summary in requested style
- **Summary:** `[Summarize] "label" bullets maxLength=200`

### 18. Web Search (🔍)
- **Type:** `searchNode`
- **Description:** Search the web
- **Help:** Query web search APIs and return results with URLs and snippets — the Perplexity DNA
- **Color:** `border-indigo-400/40 bg-indigo-400/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `searchProvider` — `brave`, `serper`, `tavily`, `google`, `bing`
- **Data Fields:**
  - label: string = "Web Search"
  - searchProvider: "brave" | "serper" | "tavily" | "google" | "bing" = "brave"
  - query: string = "" // Supports {{interpolation}}
  - maxResults: number = 5
  - includeSnippets: boolean = true
  - safeSearch: boolean = true
- **Inspector:** Provider dropdown, query textarea, max results number, snippets checkbox, safe search checkbox
- **Execution:** Calls search API, returns array of {title, url, snippet} as structured output
- **Summary:** `[Search] "label" brave query="..." maxResults=5`

### 19. Embeddings (🧬)
- **Type:** `embeddingNode`
- **Description:** Vector embeddings
- **Help:** Generate text embeddings for similarity search, clustering, or RAG pipelines
- **Color:** `border-purple-500/40 bg-purple-500/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `embeddingAction` — `embed`, `similarity`, `cluster`, `nearest`, `store`
- **Data Fields:**
  - label: string = "Embeddings"
  - embeddingAction: "embed" | "similarity" | "cluster" | "nearest" | "store" = "embed"
  - provider: "openai" | "cohere" | "voyage" | "ollama" = "openai"
  - model: string = "text-embedding-3-small"
  - dimensions: number = 1536
- **Inspector:** Action dropdown, provider dropdown, model field, dimensions number
- **Execution:** Generates embeddings or performs vector operations on upstream text
- **Summary:** `[Embed] "label" embed openai model="text-embedding-3-small"`

### 20. Extractor (🔬)
- **Type:** `extractorNode`
- **Description:** Extract structured data
- **Help:** Use AI to extract entities, dates, amounts, contacts, or custom fields from text
- **Color:** `border-purple-400/40 bg-purple-400/10`
- **Handles:** target (left) + source (right)
- **Type Selector:** `extractType` — `entities`, `dates`, `amounts`, `contacts`, `table`, `custom`
- **Data Fields:**
  - label: string = "Extractor"
  - extractType: "entities" | "dates" | "amounts" | "contacts" | "table" | "custom" = "entities"
  - fields: string = "" // Comma-separated fields for custom extraction
  - outputFormat: "json" | "csv" | "text" = "json"
  - instructions: string = "" // Additional extraction instructions
- **Inspector:** Extract type dropdown, fields CSV, output format dropdown, instructions textarea
- **Execution:** Sends text to LLM with extraction prompt, returns structured data
- **Summary:** `[Extract] "label" entities outputFormat=json`

---

## Updated Palette Structure

| Group | Count | Nodes |
|-------|-------|-------|
| **Core** | 5 | Persona, App, Competitor, Action, Note |
| **Workflow** | 9 | Trigger, Condition, Transform, Output, LLM, Step, Consensus, Category, Config |
| **Integration** | 5 | HTTP Request, Webhook, Email, Database, Storage |
| **Data** | 5 | JSON Parser, Text, Aggregator, Validator, Formatter |
| **Logic** | 5 | Loop, Switch, Delay, Error Handler, Merge |
| **AI** | 5 | Classifier, Summarizer, Web Search, Embeddings, Extractor |
| **Total** | **34** | |

---

## Priority Order for Implementation

**Sprint 1 (highest value):** HTTP Request, Web Search, JSON Parser, Loop, Classifier
**Sprint 2 (core automation):** Database, Email, Switch, Text, Summarizer
**Sprint 3 (complete the set):** Webhook, Storage, Aggregator, Delay, Extractor
**Sprint 4 (polish):** Validator, Formatter, Error Handler, Merge, Embeddings
