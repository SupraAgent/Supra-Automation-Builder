/** Agent Persona Builder types and constants */

export type AgentRole = {
  id: string;
  title: string;
  shortDescription: string;
  icon: string;
  category: "leadership" | "product" | "engineering" | "growth" | "operations";
};

export const AGENT_ROLES: AgentRole[] = [
  // Leadership
  { id: "ceo", title: "Chief Executive Officer", shortDescription: "Vision, strategy, company direction", icon: "crown", category: "leadership" },
  { id: "cto", title: "Chief Technology Officer", shortDescription: "Tech stack, architecture, engineering culture", icon: "cpu", category: "leadership" },
  { id: "cpo", title: "Chief Product Officer", shortDescription: "Product vision, roadmap, user value", icon: "compass", category: "leadership" },
  { id: "cmo", title: "Chief Marketing Officer", shortDescription: "Brand, positioning, go-to-market", icon: "megaphone", category: "leadership" },
  { id: "cfo", title: "Chief Financial Officer", shortDescription: "Unit economics, runway, pricing", icon: "chart", category: "leadership" },
  { id: "cro", title: "Chief Revenue Officer", shortDescription: "Revenue growth, sales strategy, monetization", icon: "trending", category: "leadership" },
  { id: "cdo", title: "Chief Design Officer", shortDescription: "Design systems, UX vision, brand identity", icon: "palette", category: "leadership" },
  { id: "retention", title: "Chief Retention Officer", shortDescription: "User retention, engagement loops, churn reduction", icon: "magnet", category: "leadership" },

  // Product
  { id: "pm", title: "Product Manager", shortDescription: "Feature prioritization, user stories, shipping", icon: "clipboard", category: "product" },
  { id: "ux_researcher", title: "UX Researcher", shortDescription: "User interviews, usability, behavioral insights", icon: "search", category: "product" },
  { id: "product_analyst", title: "Product Analyst", shortDescription: "Metrics, funnels, A/B testing", icon: "bar-chart", category: "product" },

  // Engineering
  { id: "staff_eng", title: "Staff Engineer", shortDescription: "System design, code quality, technical leadership", icon: "code", category: "engineering" },
  { id: "qa_lead", title: "QA Lead", shortDescription: "Test strategy, quality gates, regression prevention", icon: "shield", category: "engineering" },
  { id: "devops", title: "DevOps Engineer", shortDescription: "CI/CD, infra, deployment reliability", icon: "server", category: "engineering" },
  { id: "security", title: "Security Engineer", shortDescription: "Threat modeling, audits, vulnerability management", icon: "lock", category: "engineering" },

  // Growth
  { id: "growth_lead", title: "Growth Lead", shortDescription: "Acquisition, activation, viral loops", icon: "rocket", category: "growth" },
  { id: "content", title: "Content Strategist", shortDescription: "Content marketing, SEO, developer relations", icon: "pen", category: "growth" },
  { id: "community", title: "Community Manager", shortDescription: "Developer community, feedback loops, advocacy", icon: "users", category: "growth" },

  // Operations
  { id: "ops", title: "Operations Manager", shortDescription: "Process efficiency, team velocity, bottleneck removal", icon: "settings", category: "operations" },
  { id: "data_analyst", title: "Data Analyst", shortDescription: "Dashboards, KPIs, data-driven decisions", icon: "database", category: "operations" },
];

export const ROLE_CATEGORIES: { id: AgentRole["category"]; label: string }[] = [
  { id: "leadership", label: "Leadership" },
  { id: "product", label: "Product" },
  { id: "engineering", label: "Engineering" },
  { id: "growth", label: "Growth" },
  { id: "operations", label: "Operations" },
];

export type CommunicationStyle = {
  id: string;
  label: string;
  description: string;
};

export const COMMUNICATION_STYLES: CommunicationStyle[] = [
  { id: "data_driven", label: "Data-Driven", description: "Leads with metrics and evidence. Every recommendation backed by numbers." },
  { id: "first_principles", label: "First Principles", description: "Breaks problems down to fundamentals. Questions assumptions." },
  { id: "user_obsessed", label: "User-Obsessed", description: "Everything starts and ends with the user experience." },
  { id: "move_fast", label: "Move Fast", description: "Bias for action. Ship, measure, iterate. Perfect is the enemy of done." },
  { id: "systems_thinker", label: "Systems Thinker", description: "Sees interconnections and second-order effects. Optimizes the whole." },
  { id: "creative", label: "Creative", description: "Lateral thinking, novel approaches, challenges conventional wisdom." },
  { id: "methodical", label: "Methodical", description: "Structured, thorough, process-oriented. Minimizes risk through rigor." },
  { id: "collaborative", label: "Collaborative", description: "Cross-functional alignment, consensus building, team empowerment." },
];

/* ------------------------------------------------------------------ */
/*  Agent Visibility                                                   */
/* ------------------------------------------------------------------ */

export type AgentVisibility = "personal" | "company";

export const VISIBILITY_OPTIONS: {
  id: AgentVisibility;
  label: string;
  description: string;
  cloneRules: string;
}[] = [
  {
    id: "personal",
    label: "Personal",
    description: "Only visible to you. Tokens and API keys stay private. Others can clone the persona but never the credentials or skill connections.",
    cloneRules: "Persona only (role, focus, inspirations, principles, north star). Tokens and skill connections are never copied.",
  },
  {
    id: "company",
    label: "Company",
    description: "Visible to all team members. Anyone on the team can view, configure, and run this agent. Shared identity across the org.",
    cloneRules: "Full persona including skills. Tokens still require separate configuration by the new owner.",
  },
];

/* ------------------------------------------------------------------ */
/*  Agent Skills                                                       */
/* ------------------------------------------------------------------ */

export type AgentSkill = {
  id: string;
  label: string;
  description: string;
  requiredTokens: ("github" | "vercel" | "anthropic")[];
  category: "code" | "deploy" | "review" | "communicate" | "analyze" | "blockchain";
};

export const AGENT_SKILLS: AgentSkill[] = [
  // Code
  { id: "code_review", label: "Code Review", description: "Read PRs and commits, leave inline review comments", requiredTokens: ["github", "anthropic"], category: "code" },
  { id: "write_code", label: "Write Code", description: "Create branches, commit code changes, open PRs", requiredTokens: ["github", "anthropic"], category: "code" },
  { id: "refactor", label: "Refactor", description: "Identify and execute code refactoring opportunities", requiredTokens: ["github", "anthropic"], category: "code" },

  // Deploy
  { id: "deploy", label: "Deploy", description: "Trigger deployments and monitor build status", requiredTokens: ["vercel"], category: "deploy" },
  { id: "rollback", label: "Rollback", description: "Revert to previous deployments when issues are detected", requiredTokens: ["vercel"], category: "deploy" },
  { id: "preview", label: "Preview Builds", description: "Create and manage preview deployments for branches", requiredTokens: ["vercel", "github"], category: "deploy" },

  // Review
  { id: "score_builds", label: "Score Builds", description: "Evaluate deployment quality and assign scores", requiredTokens: ["vercel", "anthropic"], category: "review" },
  { id: "security_audit", label: "Security Audit", description: "Scan code for vulnerabilities and security issues", requiredTokens: ["github", "anthropic"], category: "review" },
  { id: "perf_review", label: "Performance Review", description: "Analyze and report on application performance", requiredTokens: ["vercel", "anthropic"], category: "review" },

  // Communicate
  { id: "report", label: "Status Reports", description: "Generate summaries of team activity and progress", requiredTokens: ["github"], category: "communicate" },
  { id: "notify", label: "Notifications", description: "Alert team members about important events", requiredTokens: [], category: "communicate" },

  // Analyze
  { id: "metrics", label: "Track Metrics", description: "Monitor KPIs and flag anomalies", requiredTokens: ["vercel", "github"], category: "analyze" },
  { id: "experiment", label: "Run Experiments", description: "Execute A/B tests and evaluate results", requiredTokens: ["vercel", "github", "anthropic"], category: "analyze" },

  // Blockchain (Supra-specific)
  { id: "move_query", label: "Move VM Queries", description: "Read accounts, resources, modules, balances via Supra Move VM RPC", requiredTokens: [], category: "blockchain" },
  { id: "move_tx", label: "Move Transactions", description: "Simulate and execute Move entry functions, publish packages", requiredTokens: [], category: "blockchain" },
  { id: "evm_query", label: "EVM Queries", description: "Read balances, contracts, tokens on Supra EVM", requiredTokens: [], category: "blockchain" },
  { id: "evm_tx", label: "EVM Transactions", description: "Write to contracts, transfer tokens on Supra EVM", requiredTokens: [], category: "blockchain" },
  { id: "autofi", label: "AutoFi", description: "Query and manage automated on-chain tasks (rebalance, DCA, limit orders)", requiredTokens: [], category: "blockchain" },
  { id: "oracle_dora", label: "dORA Oracle", description: "Read price feeds and oracle data via Supra dORA", requiredTokens: [], category: "blockchain" },
  { id: "staking", label: "Staking & Delegation", description: "Query validator sets, delegation stakes, pool totals", requiredTokens: [], category: "blockchain" },
  { id: "digital_assets", label: "Digital Assets / NFTs", description: "Query collections, token ownership, digital asset metadata", requiredTokens: [], category: "blockchain" },
  { id: "smart_contract_audit", label: "Move Contract Audit", description: "Review Move smart contracts for vulnerabilities and best practices", requiredTokens: ["anthropic"], category: "blockchain" },
];

export const SKILL_CATEGORIES: { id: AgentSkill["category"]; label: string }[] = [
  { id: "code", label: "Code" },
  { id: "deploy", label: "Deploy" },
  { id: "review", label: "Review" },
  { id: "communicate", label: "Communicate" },
  { id: "analyze", label: "Analyze" },
  { id: "blockchain", label: "Blockchain" },
];

/* ------------------------------------------------------------------ */
/*  LLM Providers                                                      */
/* ------------------------------------------------------------------ */

export type LLMProvider = {
  id: string;
  label: string;
  description: string;
  settingsProvider: string; // maps to token provider ID in settings
  models: { id: string; label: string; context: string }[];
};

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: "anthropic",
    label: "Anthropic",
    description: "Claude models. Strong reasoning, long context, tool use.",
    settingsProvider: "anthropic",
    models: [
      { id: "claude-opus-4-6", label: "Claude Opus 4.6", context: "200k" },
      { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", context: "200k" },
      { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", context: "200k" },
    ],
  },
  {
    id: "openai",
    label: "OpenAI",
    description: "GPT models. Broad ecosystem, function calling, vision.",
    settingsProvider: "openai",
    models: [
      { id: "gpt-4o", label: "GPT-4o", context: "128k" },
      { id: "gpt-4o-mini", label: "GPT-4o Mini", context: "128k" },
      { id: "o3", label: "o3", context: "200k" },
      { id: "o3-mini", label: "o3 Mini", context: "200k" },
    ],
  },
  {
    id: "google",
    label: "Google",
    description: "Gemini models. Multimodal, long context, code generation.",
    settingsProvider: "google",
    models: [
      { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", context: "1M" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", context: "1M" },
    ],
  },
  {
    id: "mistral",
    label: "Mistral",
    description: "Open-weight models. Fast inference, multilingual, code.",
    settingsProvider: "mistral",
    models: [
      { id: "mistral-large", label: "Mistral Large", context: "128k" },
      { id: "mistral-medium", label: "Mistral Medium", context: "32k" },
      { id: "codestral", label: "Codestral", context: "256k" },
    ],
  },
  {
    id: "groq",
    label: "Groq",
    description: "Ultra-fast inference. LPU hardware, open models.",
    settingsProvider: "groq",
    models: [
      { id: "llama-3.3-70b", label: "Llama 3.3 70B", context: "128k" },
      { id: "mixtral-8x7b", label: "Mixtral 8x7B", context: "32k" },
    ],
  },
  {
    id: "xai",
    label: "xAI",
    description: "Grok models. Real-time knowledge, long context.",
    settingsProvider: "xai",
    models: [
      { id: "grok-3", label: "Grok 3", context: "131k" },
      { id: "grok-3-mini", label: "Grok 3 Mini", context: "131k" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Per-skill guardrails & scope                                       */
/* ------------------------------------------------------------------ */

export type SkillGuardrail = "read_only" | "needs_approval" | "autonomous";

export const GUARDRAIL_OPTIONS: { id: SkillGuardrail; label: string; description: string }[] = [
  { id: "read_only", label: "Read Only", description: "Can observe and report but not take action" },
  { id: "needs_approval", label: "Needs Approval", description: "Must get human approval before acting" },
  { id: "autonomous", label: "Autonomous", description: "Can act independently within scope" },
];

export type SkillConfig = {
  skillId: string;
  guardrail: SkillGuardrail;
  scope: string; // e.g. "SupraAgent/Coder repo only" or "main branch only"
};

/* ------------------------------------------------------------------ */
/*  Trigger / Schedule                                                 */
/* ------------------------------------------------------------------ */

export type TriggerType = "manual" | "schedule" | "event";

export type TriggerConfig = {
  type: TriggerType;
  schedule?: string; // cron-style: "every 30m", "daily at 9am", etc.
  events?: string[]; // event IDs
};

export const TRIGGER_TYPES: { id: TriggerType; label: string; description: string }[] = [
  { id: "manual", label: "Manual", description: "Only runs when explicitly triggered by a team member" },
  { id: "schedule", label: "Scheduled", description: "Runs on a recurring interval (e.g. every 30 min, daily)" },
  { id: "event", label: "Event-driven", description: "Runs when a specific event occurs (PR opened, deploy failed, etc.)" },
];

export const SCHEDULE_PRESETS: { label: string; value: string }[] = [
  { label: "Every 15 minutes", value: "every 15m" },
  { label: "Every 30 minutes", value: "every 30m" },
  { label: "Every hour", value: "every 1h" },
  { label: "Every 4 hours", value: "every 4h" },
  { label: "Daily at 9am", value: "daily 9:00" },
  { label: "Daily at 5pm", value: "daily 17:00" },
  { label: "Weekdays at 9am", value: "weekdays 9:00" },
];

export const EVENT_TRIGGERS: { id: string; label: string; description: string }[] = [
  { id: "pr_opened", label: "PR Opened", description: "A new pull request is created" },
  { id: "pr_merged", label: "PR Merged", description: "A pull request is merged" },
  { id: "deploy_failed", label: "Deploy Failed", description: "A Vercel deployment fails" },
  { id: "deploy_success", label: "Deploy Succeeded", description: "A Vercel deployment succeeds" },
  { id: "commit_pushed", label: "Commit Pushed", description: "New commits are pushed to a branch" },
  { id: "review_requested", label: "Review Requested", description: "A code review is requested" },
  { id: "issue_created", label: "Issue Created", description: "A new GitHub issue is opened" },
];

/* ------------------------------------------------------------------ */
/*  Output format                                                      */
/* ------------------------------------------------------------------ */

export type OutputFormatId = "pr_comment" | "pr" | "report" | "dashboard_entry" | "slack" | "commit";

export const OUTPUT_FORMATS: { id: OutputFormatId; label: string; description: string }[] = [
  { id: "pr_comment", label: "PR Comment", description: "Posts findings as a comment on the relevant pull request" },
  { id: "pr", label: "Pull Request", description: "Opens a new PR with proposed changes" },
  { id: "report", label: "Report", description: "Generates a structured report in the activity feed" },
  { id: "dashboard_entry", label: "Dashboard Entry", description: "Creates an entry visible on the team dashboard" },
  { id: "slack", label: "Slack Message", description: "Sends a message to a connected Slack channel" },
  { id: "commit", label: "Commit", description: "Commits changes directly to the scoped branch" },
];

/* ------------------------------------------------------------------ */
/*  Domain context (manual builder version)                            */
/* ------------------------------------------------------------------ */

export type ManualDomainContext = {
  summary: string;
  repos: string[];        // e.g. ["SupraAgent/Coder"]
  documentation: string[]; // URLs or file paths
  mcpServers: string[];    // MCP server identifiers
  customNotes: string;     // free-form context the agent should know
};

export function createEmptyDomainContext(): ManualDomainContext {
  return {
    summary: "",
    repos: [],
    documentation: [],
    mcpServers: [],
    customNotes: "",
  };
}

/* ------------------------------------------------------------------ */
/*  Persona type                                                       */
/* ------------------------------------------------------------------ */

export type AgentPersona = {
  role: AgentRole | null;
  customRole: string;
  visibility: AgentVisibility;
  focusArea: string;
  inspirations: string[];
  communicationStyle: CommunicationStyle | null;
  principles: string[];
  skills: string[]; // skill IDs
  skillConfigs: SkillConfig[]; // per-skill guardrails & scope
  domainContext: ManualDomainContext;
  systemPrompt: string; // the actual instructions the agent runs with
  trigger: TriggerConfig;
  outputFormats: OutputFormatId[];
  llmProvider: string; // LLM provider ID
  llmModel: string; // model ID
  northStar: string;
  displayName: string;
};

export function createEmptyPersona(): AgentPersona {
  return {
    role: null,
    customRole: "",
    visibility: "company",
    focusArea: "",
    inspirations: [],
    communicationStyle: null,
    principles: [],
    skills: [],
    skillConfigs: [],
    domainContext: createEmptyDomainContext(),
    systemPrompt: "",
    trigger: { type: "manual" },
    outputFormats: [],
    llmProvider: "anthropic",
    llmModel: "claude-sonnet-4-6",
    northStar: "",
    displayName: "",
  };
}

export type BuilderStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export const BUILDER_STEPS: { step: BuilderStep; title: string; description: string }[] = [
  { step: 1, title: "Role", description: "What position does this agent hold?" },
  { step: 2, title: "Visibility", description: "Personal or company-wide?" },
  { step: 3, title: "Focus", description: "What specifically do they optimize for?" },
  { step: 4, title: "Inspirations", description: "Which companies embody their philosophy?" },
  { step: 5, title: "Style", description: "How do they think and communicate?" },
  { step: 6, title: "Principles", description: "What core beliefs guide their decisions?" },
  { step: 7, title: "Skills & Guardrails", description: "What can this agent do, and what are its limits?" },
  { step: 8, title: "Knowledge", description: "What context and documentation does it have?" },
  { step: 9, title: "Instructions", description: "The system prompt that drives the agent" },
  { step: 10, title: "Trigger & Output", description: "When does it run and what does it produce?" },
  { step: 11, title: "Model", description: "Which LLM powers this agent?" },
  { step: 12, title: "Review", description: "Generate their profile and North Star" },
];

/* ------------------------------------------------------------------ */
/*  Persona Templates                                                  */
/* ------------------------------------------------------------------ */

export type PersonaTemplate = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: "blockchain" | "engineering" | "product" | "custom";
  persona: Omit<AgentPersona, "displayName" | "skillConfigs" | "domainContext" | "systemPrompt" | "trigger" | "outputFormats"> & { suggestedName: string };
  /** Domain knowledge context that gets stored in metadata */
  domainContext: {
    summary: string;
    capabilities: string[];
    mcpServers?: string[];
    documentation?: string[];
    networks?: { name: string; rpc: string; chainId: number; explorer: string }[];
  };
};

export const PERSONA_TEMPLATES: PersonaTemplate[] = [
  {
    id: "supra_blockchain_dev",
    name: "Supra Blockchain Developer",
    tagline: "Build on Supra L1 -- Move VM, EVM, AutoFi, dORA",
    description: "A deep-context agent for building blockchain applications on Supra. Has knowledge of Move VM and EVM dual-execution environments, AutoFi automation primitives, dORA oracle feeds, token standards (Coin + Fungible Asset), staking, digital assets, and the full Supra SDK. Connected to MCP servers for on-chain queries and transactions.",
    icon: "chain",
    category: "blockchain",
    persona: {
      suggestedName: "Supra Dev Agent",
      role: { id: "staff_eng", title: "Staff Engineer", shortDescription: "System design, code quality, technical leadership", icon: "code", category: "engineering" },
      customRole: "",
      visibility: "company",
      focusArea: "Building and reviewing blockchain applications on Supra L1. Move smart contract development, EVM integration, AutoFi automation, dORA oracle consumption, and cross-VM architecture patterns.",
      inspirations: ["Supra", "Aptos", "Solana", "Ethereum"],
      communicationStyle: COMMUNICATION_STYLES.find((s) => s.id === "first_principles") ?? null,
      principles: [
        "Security first -- every smart contract interaction is an attack surface",
        "Verify on-chain state before acting on it",
        "Use the right VM for the job: Move for safety-critical logic, EVM for ecosystem compatibility",
        "Gas efficiency matters -- optimize resource usage in every transaction",
        "Test on testnet before mainnet, always",
      ],
      skills: [
        "code_review", "write_code", "security_audit",
        "move_query", "move_tx", "evm_query", "evm_tx",
        "autofi", "oracle_dora", "staking", "digital_assets", "smart_contract_audit",
      ],
      llmProvider: "anthropic",
      llmModel: "claude-sonnet-4-6",
      northStar: "Enable developers to build secure, performant blockchain applications on Supra L1 by providing deep expertise across Move VM and EVM execution environments, AutoFi automation primitives, and the full on-chain toolset. Every recommendation is grounded in on-chain verification and security-first principles.",
    },
    domainContext: {
      summary: "Supra is a high-throughput Layer 1 blockchain with dual execution environments (Move VM + EVM). It features AutoFi for on-chain automation, dORA for decentralized oracle feeds, and native support for both Coin and Fungible Asset token standards.",
      capabilities: [
        "Query and interact with Supra Move VM (accounts, resources, modules, view functions)",
        "Query and interact with Supra EVM (contracts, tokens, NFTs)",
        "AutoFi: read config, estimate fees, check congestion, query tasks and locked balances",
        "dORA Oracle: read price feeds and oracle data",
        "Staking: query validators, delegation stakes, pool totals",
        "Digital Assets: query NFT collections, ownership, metadata",
        "Transaction management: simulate, execute, track status",
        "Move smart contract security review",
        "Package publishing and module deployment",
        "Fungible Asset (FA) standard token operations",
      ],
      mcpServers: [
        "@supra-agent/supra-move-mcp (46 tools: accounts, transactions, coins, view functions, AutoFi, chain info, events, digital assets, staking, faucet, fungible assets, oracle)",
        "@supra-agent/supra-evm-mcp (24 tools: chain, accounts, contracts, tokens, transactions, events, NFTs)",
      ],
      documentation: [
        "docs/research/2026-03-15-supra-autofi-overview.md",
        "docs/research/2026-03-16-supra-move-vm-api-surface.md",
        "docs/research/2026-03-16-supra-ancillary-services-mcp.md",
        "docs/research/2026-03-16-supra-evm-network-configuration.md",
        "docs/research/2026-03-16-supra-move-mcp-gap-analysis.md",
      ],
      networks: [
        { name: "Supra Mainnet (Move)", rpc: "https://rpc-mainnet.supra.com", chainId: 8, explorer: "https://suprascan.io" },
        { name: "Supra Testnet (Move)", rpc: "https://rpc-testnet.supra.com", chainId: 6, explorer: "https://testnet.suprascan.io" },
        { name: "Supra EVM Stagingnet", rpc: "https://rpc-evmstaging.supra.com/rpc/v1/eth", chainId: 119, explorer: "https://testnet.suprascan.io" },
      ],
    },
  },
  {
    id: "supra_defi_strategist",
    name: "Supra DeFi Strategist",
    tagline: "AutoFi automation, yield strategy, on-chain analytics",
    description: "Specialized in DeFi strategy on Supra. Understands AutoFi automation primitives (DCA, rebalancing, limit orders), dORA price feeds for real-time market data, and token economics. Focused on building and evaluating automated strategies.",
    icon: "trending",
    category: "blockchain",
    persona: {
      suggestedName: "DeFi Strategy Agent",
      role: null,
      customRole: "DeFi Strategist",
      visibility: "company",
      focusArea: "Designing and evaluating automated DeFi strategies on Supra using AutoFi primitives. Optimizing yield, managing risk, and leveraging dORA oracle data for real-time decision-making.",
      inspirations: ["Supra", "Yearn Finance", "GMX", "Aave"],
      communicationStyle: COMMUNICATION_STYLES.find((s) => s.id === "data_driven") ?? null,
      principles: [
        "Measure risk before measuring yield",
        "Automation should reduce human error, not introduce new attack vectors",
        "On-chain data is the source of truth, not dashboards",
        "Small experiments before large allocations",
      ],
      skills: [
        "move_query", "move_tx", "autofi", "oracle_dora",
        "metrics", "experiment", "report",
      ],
      llmProvider: "anthropic",
      llmModel: "claude-sonnet-4-6",
      northStar: "Build data-driven DeFi strategies on Supra that maximize risk-adjusted returns through AutoFi automation and dORA oracle intelligence. Every strategy is backtested, every risk is quantified, every automation is verified on-chain.",
    },
    domainContext: {
      summary: "DeFi operations on Supra L1 using AutoFi for on-chain task automation (DCA, rebalancing, limit orders, stop-loss) and dORA for decentralized price feeds.",
      capabilities: [
        "AutoFi: register tasks, estimate fees, check congestion, monitor executions",
        "dORA: real-time price feeds for strategy triggers",
        "Token balances and transfer operations (Coin + FA standards)",
        "Transaction simulation before execution",
        "On-chain analytics and event tracking",
      ],
      mcpServers: [
        "@supra-agent/supra-move-mcp (AutoFi, oracle, coins, view functions)",
      ],
      networks: [
        { name: "Supra Mainnet (Move)", rpc: "https://rpc-mainnet.supra.com", chainId: 8, explorer: "https://suprascan.io" },
        { name: "Supra Testnet (Move)", rpc: "https://rpc-testnet.supra.com", chainId: 6, explorer: "https://testnet.suprascan.io" },
      ],
    },
  },
  {
    id: "supra_contract_auditor",
    name: "Supra Contract Auditor",
    tagline: "Move smart contract security review and auditing",
    description: "Security-focused agent for auditing Move smart contracts on Supra. Reviews resource access patterns, entry function safety, module dependencies, and common Move vulnerabilities. Checks against best practices for the Supra ecosystem.",
    icon: "shield",
    category: "blockchain",
    persona: {
      suggestedName: "Move Auditor Agent",
      role: { id: "security", title: "Security Engineer", shortDescription: "Threat modeling, audits, vulnerability management", icon: "lock", category: "engineering" },
      customRole: "",
      visibility: "company",
      focusArea: "Auditing Move smart contracts on Supra for security vulnerabilities, resource safety issues, and access control flaws. Reviewing module architecture and entry function patterns against ecosystem best practices.",
      inspirations: ["Supra", "Trail of Bits", "OpenZeppelin", "CertiK"],
      communicationStyle: COMMUNICATION_STYLES.find((s) => s.id === "methodical") ?? null,
      principles: [
        "Every public entry function is an attack surface",
        "Resource safety violations are critical-severity by default",
        "Verify all abort conditions and error paths",
        "Check module upgrade authority and friend declarations",
        "Document findings with reproducible proof-of-concept",
      ],
      skills: [
        "code_review", "security_audit", "smart_contract_audit",
        "move_query", "move_tx", "report",
      ],
      llmProvider: "anthropic",
      llmModel: "claude-opus-4-6",
      northStar: "Ensure every Move smart contract deployed on Supra meets the highest security standards through systematic, methodical auditing. No module ships without verified resource safety, access control review, and comprehensive vulnerability assessment.",
    },
    domainContext: {
      summary: "Security auditing for Move smart contracts on Supra L1. Covers resource safety, access control, entry function patterns, module dependencies, and upgrade authority.",
      capabilities: [
        "Read and analyze Move modules on-chain",
        "Inspect resource access patterns and borrow semantics",
        "Review entry function safety and input validation",
        "Check friend declarations and module upgrade paths",
        "Query account resources to verify deployed state",
        "Simulate transactions to test edge cases",
      ],
      mcpServers: [
        "@supra-agent/supra-move-mcp (accounts, modules, view functions, transactions)",
      ],
      networks: [
        { name: "Supra Mainnet (Move)", rpc: "https://rpc-mainnet.supra.com", chainId: 8, explorer: "https://suprascan.io" },
        { name: "Supra Testnet (Move)", rpc: "https://rpc-testnet.supra.com", chainId: 6, explorer: "https://testnet.suprascan.io" },
      ],
    },
  },
];
