# Claude Managed Agents — Complete Project Reference

> A self-contained guide for building any product on Anthropic's Managed Agents infrastructure.
> Keep this document open while building. Everything you need is here.

---

## Table of Contents

1. [What Are Managed Agents?](#1-what-are-managed-agents)
2. [Core Primitives](#2-core-primitives)
3. [Architecture Mental Model](#3-architecture-mental-model)
4. [One-Time Setup: Agent + Environment](#4-one-time-setup-agent--environment)
5. [Session Runtime: Per-User, Per-Chat](#5-session-runtime-per-user-per-chat)
6. [Tools Deep Dive](#6-tools-deep-dive)
7. [Skills and Resources](#7-skills-and-resources)
8. [Event Streaming Reference](#8-event-streaming-reference)
9. [Security and Credentials (Vaults)](#9-security-and-credentials-vaults)
10. [Context Management](#10-context-management)
11. [Advanced Features](#11-advanced-features)
12. [Common Project Patterns](#12-common-project-patterns)
13. [Full Implementation: TypeScript](#13-full-implementation-typescript)
14. [Full Implementation: Python](#14-full-implementation-python)
15. [Debugging and Monitoring](#15-debugging-and-monitoring)
16. [Production Checklist](#16-production-checklist)
17. [Migration from Claude Code](#17-migration-from-claude-code)
18. [Quick Reference Card](#18-quick-reference-card)

---

## 1. What Are Managed Agents?

Claude Managed Agents is a **hosted, scalable infrastructure layer from Anthropic** that lets you define reusable AI agents and run them in cloud-managed sandboxes. You focus entirely on product logic; Anthropic handles everything else.

### What Anthropic manages for you

| Concern | What Anthropic does |
|---|---|
| Sandbox orchestration | Creates and destroys secure containers per session |
| Context compaction | Automatically manages up to ~1 M-token windows |
| Prompt caching | Caches stable system prompts across sessions |
| Retries & error recovery | Handles transient tool failures automatically |
| Checkpointing | Saves session state so long jobs can resume |
| Long-running tools | Keeps sessions alive while Bash/Python runs for minutes |
| Permission policies | Enforces per-tool `always_allow` / `always_ask` / `always_deny` |
| Event streaming | Streams rich structured events to your UI in real time |

### What you own

- **System prompt** — what the agent knows, how it behaves
- **Custom tools** — your proprietary business logic (DB queries, internal APIs)
- **Frontend** — session list, chat UI, event log, custom renderers
- **Backend stubs** — session creation, event polling, custom tool handler
- **MCP integrations** — Linear, Slack, GitHub, AutoCAD, etc. via your own MCP servers

### Key numbers

- Sessions idle indefinitely (no cost for idle time; resume any time)
- Context window: up to ~1 M tokens with automatic management
- Max skills per agent: 64
- Agent versions: immutable snapshots — update creates V2, V1 still accessible

---

## 2. Core Primitives

### 2.1 Agent

A **reusable, versioned configuration** that defines a single AI persona. Think of it as a blueprint — you create it once, reference it by ID forever.

```
Agent = {
  name          string
  model         "claude-opus-4-7" | "claude-sonnet-4-6" | "claude-haiku-4-5"
  system        string (system prompt)
  tools         Tool[]
  skills        Skill[]
  mcp_servers   McpServer[]
  description   string
}
```

- Creating an agent returns `agent.id` and `agent.version` (starts at 1)
- Updating an agent (e.g., changing system prompt) creates a new immutable version
- **Never recreate agents per chat or per user.** Create once, store the ID.

### 2.2 Environment

A **reusable container template** that defines the sandbox your agent runs in.

```
Environment = {
  name      string
  config    {
    type        "cloud"
    packages    { pip: [], npm: [], system: [] }
    networking  { type: "unrestricted" } | { type: "allowlist", hosts: [] }
    resources   Resource[]   // optional — can also be per-session
  }
}
```

- Create once per product (or per product tier)
- Defines Python/Node packages, networking rules, pre-mounted files
- Never recreate per session

### 2.3 Session

A **persistent, stateful conversation** between a user and an agent running in a sandbox. This is the per-user, per-chat unit.

```
Session = {
  agent           agent.id (or { id, version } to pin)
  environment_id  env.id
  title           string
  resources       Resource[]    // data files to mount at startup
  vault_ids       string[]      // per-user credentials
  metadata        {}            // your app data (userId, etc.)
}
```

- Sessions are created per user per chat
- Sandbox mounts resources and starts the agent
- Session persists indefinitely — resume by sending events
- `session.id` is your handle for everything downstream

### 2.4 Events

The **message bus** between your app and a session. Everything is an event.

- **You send**: `user.message`, `user.tool_confirmation`, `user.custom_tool_result`
- **You receive**: `agent.message`, `agent.tool_use`, `agent.custom_tool_use`, `session.status_*`, `session.error`, `agent.thinking`, `span.*`

See [§8 Event Streaming Reference](#8-event-streaming-reference) for the full type list.

### 2.5 Tools

Three categories of tools an agent can call:

| Category | How defined | Auth | Use for |
|---|---|---|---|
| **Native (agent_toolset)** | Built-in to the sandbox | None needed | bash, read/write files, grep, web_search, fetch |
| **MCP** | Your MCP server URL | Via Vaults | Linear, Slack, GitHub, any API |
| **Custom** | Declared in agent config | Your backend controls | DB queries, internal APIs, UI notifications |

### 2.6 Skills

Pre-built capability modules you load into an agent's context:

- **Anthropic-provided**: `xlsx` (read Excel), `docx` (read Word), etc.
- **From anthropics/skills repo**: `claude-api` (use Anthropic SDK), `managed-agents-onboarding`, etc.
- **Custom**: upload any markdown/text file via Skills API, reference by `skill_id`

### 2.7 Vaults

Secure credential stores, scoped per session. An agent in a sandbox **never sees the raw credential** — the Vault system injects it automatically into MCP server requests.

```
Vault:
  id   "vlt_abc123"
  Contains: OAuth tokens, API keys, service account credentials
  Scope: per-user (attach vault_id when creating session)
  Refresh: automatic for OAuth
```

---

## 3. Architecture Mental Model

```
YOUR APP
  │
  ├── One-time setup (run once, store IDs)
  │     ├── client.beta.environments.create(...)  → env_id
  │     └── client.beta.agents.create(...)        → agent_id, agent_version
  │
  └── Per-session runtime (every new chat)
        ├── client.beta.sessions.create({ agent_id, env_id, resources, vault_ids })
        │     → session_id  [sandbox starts, resources mount]
        │
        ├── client.beta.sessions.events.send(session_id, { type: "user.message", ... })
        │
        └── for await (event of client.beta.sessions.events.stream(session_id))
              ├── agent.message       → render chat bubble
              ├── agent.tool_use      → show "Agent is running code..."
              ├── agent.custom_tool_use → YOUR code executes, send result back
              ├── session.status_idle → agent is done / waiting for you
              └── session.error       → surface to user
```

### The custom tool round-trip

Custom tools let your agent call your backend securely — credentials never enter the sandbox:

```
Agent sandbox          Your backend
      │                     │
      │── custom_tool_use ──►│
      │                     │  (backend calls DB, internal API, etc.)
      │◄─ tool_result ───────│
      │                     │
```

Your app receives `agent.custom_tool_use`, executes business logic, then sends back a `user.custom_tool_result` event.

---

## 4. One-Time Setup: Agent + Environment

Run this **once per deployment**. Store `agent.id` and `env.id` in your `.env` or config.

### 4.1 Create the Environment

```typescript
// TypeScript
const env = await client.beta.environments.create({
  name: "my-app-env",
  config: {
    type: "cloud",

    // Python packages (add what your agent needs)
    packages: {
      pip: ["pandas", "matplotlib", "httpx", "pillow"],
      // npm: ["@octokit/rest"],
    },

    // Networking: unrestricted OR allowlist
    networking: { type: "unrestricted" },
    // networking: { type: "allowlist", hosts: ["api.github.com", "your-db.internal"] },

    // Optional: template-level file resources
    // resources: [{ type: "file", file_id: "file_abc", mount_path: "/workspace/config.json" }]
  }
});

console.log("ENV_ID=", env.id);  // store this
```

```python
# Python
env = client.beta.environments.create(
    name="my-app-env",
    config={
        "type": "cloud",
        "packages": {"pip": ["pandas", "matplotlib", "httpx"]},
        "networking": {"type": "unrestricted"},
    }
)
print("ENV_ID=", env.id)
```

### 4.2 Create the Agent

```typescript
// TypeScript — full example with all tool types
const agent = await client.beta.agents.create({
  name: "My App Assistant",
  model: "claude-opus-4-7",               // or sonnet-4-6, haiku-4-5
  description: "Helps users analyze their data and take actions",

  system: `You are a helpful assistant for My App.
You have access to the user's data, can run Python code, and can
send notifications via Slack. Always confirm before destructive actions.`,

  // Tools
  tools: [
    // 1. Native agent toolset — enable all, override specific ones
    {
      type: "agent_toolset_20260401",
      default_config: {
        enabled: true,
        permission_policy: { type: "always_allow" }
      },
      configs: [
        // Ask user before running Bash commands (destructive risk)
        { name: "bash", permission_policy: { type: "always_ask" } },
        // Fully disable web_search if not needed
        // { name: "web_search", enabled: false }
      ]
    },

    // 2. Custom tool — handled by your backend
    {
      type: "custom",
      name: "QueryDatabase",
      description: "Run a read-only SQL query against the user's database.",
      input_schema: {
        type: "object",
        properties: {
          sql: { type: "string", description: "The SELECT query to run" }
        },
        required: ["sql"]
      }
    },

    // 3. Another custom tool for UI updates
    {
      type: "custom",
      name: "RenderChart",
      description: "Display a chart in the user interface. Call this after saving a plot file.",
      input_schema: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path to the image file in /mnt/session/outputs/" },
          title: { type: "string" }
        },
        required: ["file_path"]
      }
    }
  ],

  // MCP servers (if any)
  mcp_servers: [
    // { name: "slack", url: "https://your-mcp-proxy.com/slack" }
  ],

  // Skills
  skills: [
    // { type: "anthropic", name: "xlsx" },
    // { skill_id: "skill_abc123", version: 1 }
  ]
});

console.log("AGENT_ID=", agent.id, "VERSION=", agent.version);
```

### 4.3 Updating an Agent

```typescript
// This creates an immutable V2 — V1 still works for existing sessions
const updated = await client.beta.agents.update(agent.id, {
  system: "Updated system prompt here..."
});
// updated.version === 2
```

To pin a session to a specific version:
```typescript
await client.beta.sessions.create({
  agent: { id: agent.id, version: 1 },  // pinned to V1
  ...
});
```

---

## 5. Session Runtime: Per-User, Per-Chat

### 5.1 Create a Session

```typescript
async function createChatSession(userId: string, dataFileId?: string) {
  const session = await client.beta.sessions.create({
    agent: process.env.AGENT_ID!,
    environment_id: process.env.ENV_ID!,
    title: `Chat - ${new Date().toISOString()}`,

    // Mount user data files (upload first via Files API)
    resources: dataFileId ? [
      {
        type: "file",
        file_id: dataFileId,
        mount_path: "/workspace/user_data.csv"
      }
    ] : [],

    // Per-user credentials (Vault IDs from your user record)
    vault_ids: [await getVaultIdForUser(userId)],

    // Your app metadata (not visible to agent)
    metadata: { userId, sessionType: "chat" }
  });

  // Store session.id in your DB linked to userId + chatId
  return session.id;
}
```

> **Important**: `sessions.create()` blocks until the sandbox is ready and resources are mounted. This typically takes 2–5 seconds. Do this before the user sends their first message, ideally when they open the chat UI.

### 5.2 Send a Message

```typescript
async function sendMessage(sessionId: string, text: string, imageFileId?: string) {
  const content: any[] = [{ type: "text", text }];

  // Optionally attach an image or document
  if (imageFileId) {
    content.push({ type: "image_url", image_url: { file_id: imageFileId } });
  }

  await client.beta.sessions.events.send(sessionId, {
    type: "user.message",
    content
  });
}
```

### 5.3 Stream Events

```typescript
async function streamSession(sessionId: string, onEvent: (event: any) => void) {
  for await (const event of client.beta.sessions.events.stream(sessionId)) {
    onEvent(event);

    // Agent is done (idle) or waiting for your custom tool result
    if (event.type === "session.status_idle") break;
    if (event.type === "session.error") throw new Error(event.message);
  }
}
```

### 5.4 Handle the Full Event Loop (with Custom Tools)

```typescript
async function runAgentLoop(sessionId: string, userMessage: string) {
  // 1. Send user message
  await client.beta.sessions.events.send(sessionId, {
    type: "user.message",
    content: [{ type: "text", text: userMessage }]
  });

  let agentResponse = "";

  // 2. Stream events until idle
  for await (const event of client.beta.sessions.events.stream(sessionId)) {
    switch (event.type) {

      case "agent.message":
        // Accumulate text response
        for (const block of event.content ?? []) {
          if (block.type === "text") agentResponse += block.text;
        }
        break;

      case "agent.tool_use":
        // Native tool running (bash, read, web_search, etc.)
        console.log(`Agent using tool: ${event.name}`);
        break;

      case "agent.custom_tool_use":
        // YOUR custom tool — handle and send result back
        const result = await handleCustomTool(event.name, event.input);
        await client.beta.sessions.events.send(sessionId, {
          type: "user.custom_tool_result",
          tool_use_id: event.id,
          content: [{ type: "text", text: JSON.stringify(result) }]
        });
        break;

      case "agent.thinking":
        // Extended thinking block (if model supports it)
        console.log("Agent thinking:", event.thinking);
        break;

      case "session.status_idle":
        // Agent finished or waiting for confirmation
        return agentResponse;

      case "session.error":
        throw new Error(event.message);
    }
  }

  return agentResponse;
}

async function handleCustomTool(toolName: string, input: any): Promise<any> {
  switch (toolName) {
    case "QueryDatabase":
      return await db.query(input.sql);  // your DB call here

    case "RenderChart":
      // Download artifact, store, return URL for your frontend
      const files = await client.files.list({ scope_id: sessionId });
      const file = files.find(f => f.filename === input.file_path.split("/").pop());
      const url = await storeFileForFrontend(file);
      // Notify your frontend to render the chart
      emitToFrontend({ type: "render_chart", url, title: input.title });
      return { success: true, url };

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
```

### 5.5 Handle Permission Confirmations

When a tool has `permission_policy: "always_ask"`, the session pauses at `session.status_idle` and waits for your confirmation:

```typescript
case "agent.tool_use":
  if (event.requires_confirmation) {
    // Show confirmation UI to user
    const approved = await showConfirmationDialog(event.name, event.input);

    await client.beta.sessions.events.send(sessionId, {
      type: "user.tool_confirmation",
      tool_use_id: event.id,
      result: approved ? "allow" : "deny",
      message: approved ? undefined : "User declined this action."
    });
  }
  break;
```

### 5.6 Download Artifacts

Files the agent saves to `/mnt/session/outputs/` are accessible via the Files API:

```typescript
async function getSessionArtifacts(sessionId: string) {
  const files = await client.files.list({ scope_id: sessionId });
  return files.map(f => ({
    name: f.filename,
    size: f.size,
    created: f.created_at,
    downloadUrl: `https://api.anthropic.com/v1/files/${f.id}/content`
  }));
}
```

---

## 6. Tools Deep Dive

### 6.1 Native Agent Toolset

Enable the full native toolset with fine-grained permission overrides:

```typescript
{
  type: "agent_toolset_20260401",
  default_config: {
    enabled: true,
    permission_policy: { type: "always_allow" }
  },
  configs: [
    // Per-tool overrides
    { name: "bash",         permission_policy: { type: "always_ask" } },
    { name: "write_file",   permission_policy: { type: "always_ask" } },
    { name: "web_search",   enabled: false },  // disable entirely
  ]
}
```

**Available native tools** (as of `agent_toolset_20260401`):

| Tool | What it does | Recommended policy |
|---|---|---|
| `bash` | Run any shell command | `always_ask` for new projects; `always_allow` once trusted |
| `read_file` | Read file at a path | `always_allow` |
| `write_file` | Write file at a path | `always_ask` |
| `glob` | List files by pattern | `always_allow` |
| `grep` | Search text in files | `always_allow` |
| `web_search` | DuckDuckGo search | `always_allow` |
| `web_fetch` | Fetch a URL | `always_allow` |

### 6.2 MCP Tools

```typescript
// In agent config:
mcp_servers: [
  { name: "github", url: "https://your-mcp-proxy.example.com/github" }
]

tools: [
  {
    type: "mcp_toolset",
    mcp_server: "github",
    default_config: { permission_policy: { type: "always_allow" } },
    configs: [
      // Ask before destructive operations
      { name: "create_pull_request", permission_policy: { type: "always_ask" } },
      { name: "delete_branch",       permission_policy: { type: "always_deny" } }
    ]
  }
]
```

### 6.3 Custom Tools — Design Patterns

**Pattern 1: Secure DB access**
```typescript
// Agent declaration
{
  type: "custom",
  name: "FetchUserOrders",
  description: "Get order history for the currently authenticated user. Returns last 50 orders.",
  input_schema: {
    type: "object",
    properties: {
      status_filter: {
        type: "string",
        enum: ["all", "pending", "shipped", "delivered"],
        description: "Filter orders by status"
      }
    }
  }
}

// Your handler — no SQL injection possible, user is scoped server-side
case "FetchUserOrders":
  return await db.query(
    "SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2) ORDER BY created_at DESC LIMIT 50",
    [session.metadata.userId, input.status_filter === "all" ? ["pending","shipped","delivered"] : [input.status_filter]]
  );
```

**Pattern 2: UI notification tool**
```typescript
// Agent declaration
{
  type: "custom",
  name: "ShowDataCard",
  description: "Render a summary card in the user interface. Call this when you want to highlight key findings visually.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      metrics: {
        type: "array",
        items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } }
      },
      highlight_color: { type: "string", enum: ["blue", "green", "red", "yellow"] }
    },
    required: ["title", "metrics"]
  }
}

// Your handler — push to frontend via WebSocket/SSE
case "ShowDataCard":
  broadcastToClient(sessionId, { type: "ui:data_card", payload: input });
  return { rendered: true };
```

**Pattern 3: File processing**
```typescript
// Agent saves file to /mnt/session/outputs/, then calls this tool
{
  type: "custom",
  name: "PublishReport",
  description: "Upload a generated report to cloud storage and return a shareable URL.",
  input_schema: {
    type: "object",
    properties: {
      file_path: { type: "string", description: "Path within /mnt/session/outputs/" },
      report_name: { type: "string" }
    },
    required: ["file_path", "report_name"]
  }
}

case "PublishReport":
  const files = await client.files.list({ scope_id: sessionId });
  const file = files.find(f => input.file_path.endsWith(f.filename));
  const content = await client.files.content(file.id);
  const url = await uploadToS3(content, input.report_name);
  return { url, expires_at: null };
```

---

## 7. Skills and Resources

### 7.1 File Resources (user data)

Upload once, reference by `file_id` — don't re-upload per session:

```typescript
// Upload user's data file (do this when user uploads in UI)
async function uploadUserFile(buffer: Buffer, filename: string) {
  const file = await client.files.create({
    file: new File([buffer], filename),
    purpose: "agent_resource"
  });
  return file.id;  // store in your DB for this user
}

// Mount when creating session
resources: [
  { type: "file", file_id: userFileId, mount_path: "/workspace/data.csv" }
]
```

### 7.2 GitHub Repository Resources

```typescript
resources: [
  {
    type: "github_repository",
    url: "https://github.com/your-org/your-repo",
    authorization_token: process.env.GITHUB_PAT,  // via env or Vault
    mount_path: "/workspace/repo",     // optional, defaults to repo name
    checkout: "main"                   // branch, tag, or SHA
  }
]
```

### 7.3 Anthropic Built-in Skills

```typescript
skills: [
  { type: "anthropic", name: "xlsx" },  // read Excel files
  { type: "anthropic", name: "docx" },  // read Word files
]
```

### 7.4 Custom Skills

```typescript
// Upload your skill document
const skill = await client.beta.skills.create({
  name: "my-domain-knowledge",
  content: fs.readFileSync("./skills/domain-knowledge.md", "utf-8"),
  description: "Company-specific terminology and process guidelines"
});
// skill_id is now stable — reference by ID forever

// In agent config:
skills: [{ skill_id: skill.id, version: skill.version }]
```

---

## 8. Event Streaming Reference

### Complete event type table

| Event type | Direction | When it fires |
|---|---|---|
| `user.message` | → agent | You send a chat message |
| `user.custom_tool_result` | → agent | You return a custom tool result |
| `user.tool_confirmation` | → agent | You approve/deny a permission-gated tool |
| `agent.message` | ← agent | Agent produces text (may stream in chunks) |
| `agent.tool_use` | ← agent | Agent calls a native or MCP tool |
| `agent.tool_results` | ← agent | Result of a native/MCP tool call |
| `agent.custom_tool_use` | ← agent | Agent calls one of your custom tools |
| `agent.thinking` | ← agent | Extended thinking block |
| `session.status_idle` | ← agent | Agent finished turn or waiting for you |
| `session.status_running` | ← agent | Agent started processing |
| `session.status_rescheduling` | ← agent | Long-running task being checkpointed |
| `session.status_terminated` | ← agent | Session ended (timeout or explicit) |
| `session.error` | ← agent | Unrecoverable error |
| `context.compaction` | ← agent | Context was compacted; summary injected |
| `outcome.processing` | ← agent | Outcomes rubric is evaluating (research preview) |
| `span.start` / `span.end` | ← agent | Timing/tracing instrumentation |

### Key event payloads

```typescript
// agent.message
{
  type: "agent.message",
  id: "msg_abc",
  content: [
    { type: "text", text: "Here are your results..." },
    { type: "tool_use", id: "tu_xyz", name: "bash", input: { command: "python analyze.py" } }
  ]
}

// agent.custom_tool_use
{
  type: "agent.custom_tool_use",
  id: "ctu_abc",           // use this as tool_use_id in your result
  name: "QueryDatabase",
  input: { sql: "SELECT COUNT(*) FROM orders WHERE status='pending'" }
}

// session.status_idle — check requires_action for pending confirmations
{
  type: "session.status_idle",
  requires_action: false
}

// session.error
{
  type: "session.error",
  code: "context_overflow" | "tool_failure" | "timeout",
  message: "Human-readable error string"
}
```

### Polling vs. streaming

**Streaming (SSE)** — preferred for interactive UIs:
```typescript
for await (const event of client.beta.sessions.events.stream(sessionId)) {
  // process events as they arrive
}
```

**Polling** — for background jobs or serverless:
```typescript
// Durable workflow / polling pattern
async function pollUntilIdle(sessionId: string, afterEventId?: string) {
  while (true) {
    const page = await client.beta.sessions.events.list(sessionId, {
      after: afterEventId, limit: 50
    });
    for (const event of page.data) {
      afterEventId = event.id;
      await processEvent(event);
      if (event.type === "session.status_idle") return afterEventId;
    }
    if (page.data.length === 0) await sleep(1000);
  }
}
```

---

## 9. Security and Credentials (Vaults)

### The golden rule

**Credentials never enter the agent sandbox.** API keys, OAuth tokens, database passwords — all stay in Vaults, injected server-side into MCP requests or your custom tool handlers.

### Vault operations

```typescript
// Create a vault (one per user, or per integration)
const vault = await client.beta.vaults.create({
  name: `User ${userId} - Slack`,
  credentials: {
    type: "oauth2",
    access_token: slackAccessToken,
    refresh_token: slackRefreshToken,
    token_url: "https://slack.com/api/oauth.v2.access",
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET
  }
});

// Rotate credentials (Anthropic handles OAuth refresh automatically)
await client.beta.vaults.update(vault.id, {
  credentials: { access_token: newToken, ... }
});

// Attach to session
await client.beta.sessions.create({
  vault_ids: [vault.id],
  ...
});
```

### Environment variables for sensitive config

For non-user-specific secrets (your DB connection string, etc.), inject via environment at the backend level — they never go into Agent config or Session data.

### Permission policy recommendations by risk level

| Risk | Tools | Policy |
|---|---|---|
| Safe | `read_file`, `glob`, `grep`, `web_search`, `web_fetch` | `always_allow` |
| Moderate | `bash` (read-only scripts), `web_fetch` to known domains | `always_allow` if domain-locked |
| High | `bash` (arbitrary), `write_file`, `delete_file` | `always_ask` |
| Prohibited | Custom destructive operations | `always_deny` |

---

## 10. Context Management

### How it works

Managed Agents uses automatic context compaction. When the context window approaches its limit:

1. Anthropic's compaction strategy summarizes earlier conversation turns
2. A `context.compaction` event fires with a summary of what was compacted
3. The agent continues seamlessly — it doesn't "know" the context shrank

You don't need to manage this manually. But you should understand it:

### What this means for your system prompt

- **Put stable content first**: tools list, rules, persona. This is cached and rarely recompacted.
- **Put variable content last**: the current task, user-specific context.
- **Don't rely on early message history**: if a session runs for hours, early turns may be summarized. Design agent behavior to re-read files rather than rely on conversation memory.

### Long-running sessions

Sessions have no timeout while they're processing. A Bash command that runs for 30 minutes is fine. The session stays alive.

For truly long jobs (hours+):
- The agent saves state to files, which persist in `/mnt/session/`
- If your app reconnects to the session later, the agent re-reads its files
- Use the `context.compaction` event to log that compaction occurred

### Token budget awareness in system prompts

Guide your agent to be context-efficient:

```
System prompt addition:
"After processing a large file or API response, extract only the fields you need
and discard the raw payload from your reasoning. Target staying under 100k tokens
of active context. If you find yourself holding large unused data, summarize it."
```

---

## 11. Advanced Features

### 11.1 Outcomes (Research Preview)

Outcomes let your agent self-verify against a rubric and automatically re-try until the criteria are met.

```typescript
// Attach an outcome rubric to a session
await client.beta.sessions.create({
  ...
  outcome: {
    rubric: `
      The response is complete when:
      1. All user questions are answered with specific data, not vague statements
      2. Any code samples are tested and confirmed working
      3. A summary table is included if more than 3 items are compared
    `
    // Or reference a file:
    // rubric_file_id: "file_abc123"
  }
});
```

The agent will see an `outcome.processing` event stream as it evaluates, then either declare success or retry.

### 11.2 Memory Stores (Released April 2026)

Persistent memory across sessions — agents remember users across conversations.

```typescript
// Create a memory store (once per user or per product)
const memory = await client.beta.memories.create({
  name: `User ${userId} Memory`,
  scope: "user"
});

// Attach to session
await client.beta.sessions.create({
  memory_store_id: memory.id,
  ...
});

// The agent automatically reads and writes relevant facts
// You can also read the memory store directly:
const memories = await client.beta.memories.list(memory.id);
```

### 11.3 Agent Versioning for Safe Iteration

```typescript
// V1 in production
const agentV1 = await client.beta.agents.create({ name: "Assistant", ... });

// Make a change — V1 is untouched
const agentV2 = await client.beta.agents.update(agentV1.id, {
  system: "Updated behavior..."
});
// agentV2.version === 2, agentV1.version === 1 still works

// A/B test: V1 for 50% of sessions, V2 for 50%
const version = Math.random() < 0.5 ? 1 : 2;
await client.beta.sessions.create({
  agent: { id: agentV1.id, version },
  ...
});
```

### 11.4 Multi-Agent (Current Best Pattern)

Full multi-agent coordination is a research preview. Today's best approach:

```typescript
// Orchestrator session spawns work by creating sub-sessions
// and communicating via shared state (files, DB, or events)

// Orchestrator agent creates sub-tasks
case "DelegateToSpecialist":
  const subSession = await client.beta.sessions.create({
    agent: specialistAgentId,
    environment_id: envId,
    resources: [{ type: "file", file_id: input.data_file_id, mount_path: "/workspace/data" }],
    metadata: { parent_session: sessionId, task: input.task_description }
  });

  await client.beta.sessions.events.send(subSession.id, {
    type: "user.message",
    content: [{ type: "text", text: input.task_description }]
  });

  // Poll for completion
  const result = await waitForIdle(subSession.id);
  return { sub_session_id: subSession.id, result };
```

---

## 12. Common Project Patterns

### Pattern A: Data Analysis Web App

**What you're building**: User uploads a CSV/Excel, asks questions, gets charts and insights.

**Architecture**:
```
Frontend                  Backend                    Anthropic
  │                          │                           │
  │  Upload file             │                           │
  ├─────────────────────────►│  files.create()  ─────────►│
  │                          │◄─ file_id ────────────────│
  │  Start chat              │                           │
  ├─────────────────────────►│  sessions.create()  ──────►│
  │                          │◄─ session_id ─────────────│
  │  Send message            │                           │
  ├─────────────────────────►│  events.send(user.msg)  ──►│
  │  Stream response         │◄─ events.stream()  ────────│
  │◄─────────── agent.message │                           │
  │◄─── agent.custom_tool_use │  (RenderChart)            │
  │  [render chart]          │  events.send(tool_result) ►│
```

**Agent system prompt**:
```
You are a data analyst assistant. The user has uploaded their data to /workspace/data.csv.
When you generate a chart or visualization, save it to /mnt/session/outputs/ and then
call RenderChart with the file path so the user can see it immediately.
Always show your work: describe what analysis you're running before running it.
```

**Environment packages**: `pandas`, `matplotlib`, `seaborn`, `openpyxl`

**Key insight**: Upload file once → reuse `file_id` across multiple sessions for the same dataset.

---

### Pattern B: Coding Assistant with Repository Access

**What you're building**: Agent that can read, analyze, and modify code in a user's repo.

**Architecture**:
- Mount the user's GitHub repo as a resource (read-only checkout)
- Agent uses `read_file`, `grep`, `bash` (run tests)
- Custom tool `ProposePullRequest` — agent proposes changes, you show a diff UI, user approves

**Agent system prompt**:
```
You are a code review and improvement assistant. The user's repository is mounted at
/workspace/repo. You can read any file, run tests with bash, and propose changes via
ProposePullRequest. Always explain your reasoning. Never push to main directly —
always propose changes for user review.
```

**Permission policy**:
- `bash`: `always_ask` (run tests requires confirmation)
- `write_file`: `always_deny` (agent proposes via custom tool, you handle git)
- `ProposePullRequest`: handle in your backend — create a PR via GitHub API

---

### Pattern C: Long-Running Automation (Background Agent)

**What you're building**: Agent runs autonomously for minutes/hours without a human in the loop.

**Pattern**:
```typescript
// Fire-and-forget with webhook on completion
const session = await client.beta.sessions.create({
  agent: automationAgentId,
  environment_id: envId,
  metadata: { job_id: jobId, callback_url: "https://your-app.com/webhooks/agent" }
});

await client.beta.sessions.events.send(session.id, {
  type: "user.message",
  content: [{ type: "text", text: buildJobPrompt(job) }]
});

// Your backend polls in a durable workflow (or use webhooks when available)
// Store session.id → job mapping in your DB
// The agent saves outputs to /mnt/session/outputs/
// When done, download artifacts via files.list({ scope_id: session.id })
```

**Permission policy**: give the agent `always_allow` on all tools for autonomy. No human in the loop means no `always_ask`.

---

### Pattern D: Customer-Facing Chatbot with Per-User Context

**What you're building**: Each user gets their own persistent conversation context.

**Pattern**:
```typescript
// On first chat:
const session = await createSession(userId);  // creates + stores session_id in DB
await db.users.update(userId, { agent_session_id: session.id });

// On subsequent chats:
const sessionId = await db.users.findOne(userId).agent_session_id;
// Reuse the same session — agent remembers the conversation history

// With Memory Stores (released April 2026):
// Agent also remembers facts across sessions automatically
```

---

### Pattern E: Document Processing Pipeline

**What you're building**: Upload PDFs/Word docs, extract structured data, populate a database.

```typescript
// For each document:
const fileId = await uploadFile(documentBuffer, "document.pdf");
const session = await createSession({ resources: [{ type: "file", file_id: fileId, mount_path: "/workspace/doc.pdf" }] });

// Send extraction prompt
await sendMessage(session.id, `
  Extract the following fields from the document and return them as JSON:
  - company_name, contract_date, total_value, payment_terms, signatories[]
  Respond with ONLY the JSON object, no other text.
`);

// Collect the JSON response
const response = await collectResponse(session.id);
const extracted = JSON.parse(response);

// Your custom tool writes to DB — the agent calls it
case "SaveExtractedData":
  await db.contracts.insert({ ...input, source_file_id: fileId, session_id: sessionId });
  return { saved: true };
```

---

## 13. Full Implementation: TypeScript

A complete, production-ready TypeScript module for any Managed Agents project:

```typescript
// managed-agents-client.ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── One-time setup ───────────────────────────────────────────────────────────

export async function setupAgentInfra(config: {
  agentName: string;
  systemPrompt: string;
  customTools?: Anthropic.Beta.Agents.CustomTool[];
  packages?: { pip?: string[]; npm?: string[] };
  networking?: "unrestricted" | string[];
}) {
  // Create environment
  const env = await client.beta.environments.create({
    name: `${config.agentName}-env`,
    config: {
      type: "cloud",
      packages: config.packages ?? {},
      networking: config.networking === "unrestricted" || !config.networking
        ? { type: "unrestricted" }
        : { type: "allowlist", hosts: config.networking as string[] }
    }
  });

  // Create agent
  const tools: any[] = [
    {
      type: "agent_toolset_20260401",
      default_config: { enabled: true, permission_policy: { type: "always_allow" } },
      configs: [{ name: "bash", permission_policy: { type: "always_ask" } }]
    },
    ...(config.customTools ?? [])
  ];

  const agent = await client.beta.agents.create({
    name: config.agentName,
    model: "claude-opus-4-7",
    system: config.systemPrompt,
    tools
  });

  return { agentId: agent.id, agentVersion: agent.version, envId: env.id };
}

// ─── Session management ───────────────────────────────────────────────────────

export async function createSession(params: {
  agentId: string;
  envId: string;
  userId: string;
  fileIds?: string[];
  vaultIds?: string[];
}) {
  const session = await client.beta.sessions.create({
    agent: params.agentId,
    environment_id: params.envId,
    title: `Session - ${Date.now()}`,
    resources: (params.fileIds ?? []).map((file_id, i) => ({
      type: "file" as const,
      file_id,
      mount_path: `/workspace/file_${i}`
    })),
    vault_ids: params.vaultIds ?? [],
    metadata: { userId: params.userId }
  });
  return session.id;
}

// ─── Message loop ─────────────────────────────────────────────────────────────

export interface AgentRunResult {
  text: string;
  artifacts: string[];
  toolsCalled: string[];
}

export async function runAgentTurn(
  sessionId: string,
  message: string,
  customToolHandler: (name: string, input: any) => Promise<any>
): Promise<AgentRunResult> {
  await client.beta.sessions.events.send(sessionId, {
    type: "user.message",
    content: [{ type: "text", text: message }]
  });

  let responseText = "";
  const toolsCalled: string[] = [];

  for await (const event of client.beta.sessions.events.stream(sessionId)) {
    if (event.type === "agent.message") {
      for (const block of event.content ?? []) {
        if (block.type === "text") responseText += block.text;
      }
    }

    if (event.type === "agent.tool_use") {
      toolsCalled.push(event.name);
    }

    if (event.type === "agent.custom_tool_use") {
      toolsCalled.push(event.name);
      const result = await customToolHandler(event.name, event.input);
      await client.beta.sessions.events.send(sessionId, {
        type: "user.custom_tool_result",
        tool_use_id: event.id,
        content: [{ type: "text", text: JSON.stringify(result) }]
      });
    }

    if (event.type === "session.status_idle") break;

    if (event.type === "session.error") {
      throw new Error(`Session error: ${event.message}`);
    }
  }

  // Collect artifacts
  const files = await client.files.list({ scope_id: sessionId } as any);
  const artifacts = (files.data ?? []).map((f: any) => f.filename);

  return { text: responseText, artifacts, toolsCalled };
}

// ─── File upload ──────────────────────────────────────────────────────────────

export async function uploadFile(buffer: Buffer, filename: string): Promise<string> {
  const file = await (client.files as any).create({
    file: new File([buffer], filename),
    purpose: "agent_resource"
  });
  return file.id;
}

// ─── Download artifact ────────────────────────────────────────────────────────

export async function downloadArtifact(sessionId: string, filename: string): Promise<Buffer> {
  const files = await client.files.list({ scope_id: sessionId } as any);
  const file = (files.data ?? []).find((f: any) => f.filename === filename);
  if (!file) throw new Error(`Artifact not found: ${filename}`);
  const content = await (client.files as any).content(file.id);
  return Buffer.from(await content.arrayBuffer());
}
```

---

## 14. Full Implementation: Python

```python
# managed_agents.py
from __future__ import annotations

import os
import json
from typing import Any, Callable, AsyncIterator
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


# ─── One-time setup ───────────────────────────────────────────────────────────

def setup_agent_infra(
    agent_name: str,
    system_prompt: str,
    custom_tools: list[dict] | None = None,
    pip_packages: list[str] | None = None,
    networking: str = "unrestricted",
) -> dict:
    """Create environment + agent. Run once; store returned IDs."""
    env = client.beta.environments.create(
        name=f"{agent_name}-env",
        config={
            "type": "cloud",
            "packages": {"pip": pip_packages or []},
            "networking": {"type": networking},
        },
    )

    tools = [
        {
            "type": "agent_toolset_20260401",
            "default_config": {"enabled": True, "permission_policy": {"type": "always_allow"}},
            "configs": [{"name": "bash", "permission_policy": {"type": "always_ask"}}],
        },
        *(custom_tools or []),
    ]

    agent = client.beta.agents.create(
        name=agent_name,
        model="claude-opus-4-7",
        system=system_prompt,
        tools=tools,
    )

    return {"agent_id": agent.id, "agent_version": agent.version, "env_id": env.id}


# ─── Session management ───────────────────────────────────────────────────────

def create_session(
    agent_id: str,
    env_id: str,
    user_id: str,
    file_ids: list[str] | None = None,
    vault_ids: list[str] | None = None,
) -> str:
    """Create a session; returns session_id. Blocks until sandbox ready."""
    resources = [
        {"type": "file", "file_id": fid, "mount_path": f"/workspace/file_{i}"}
        for i, fid in enumerate(file_ids or [])
    ]

    session = client.beta.sessions.create(
        agent=agent_id,
        environment_id=env_id,
        title=f"Session - {user_id}",
        resources=resources,
        vault_ids=vault_ids or [],
        metadata={"user_id": user_id},
    )
    return session.id


# ─── Message loop ─────────────────────────────────────────────────────────────

def run_agent_turn(
    session_id: str,
    message: str,
    custom_tool_handler: Callable[[str, dict], Any],
) -> dict:
    """Send a message and stream the response to completion."""
    client.beta.sessions.events.send(
        session_id,
        {"type": "user.message", "content": [{"type": "text", "text": message}]},
    )

    response_text = ""
    tools_called = []

    for event in client.beta.sessions.events.stream(session_id):
        if event.type == "agent.message":
            for block in getattr(event, "content", []):
                if getattr(block, "type", None) == "text":
                    response_text += block.text

        elif event.type == "agent.tool_use":
            tools_called.append(event.name)

        elif event.type == "agent.custom_tool_use":
            tools_called.append(event.name)
            result = custom_tool_handler(event.name, event.input)
            client.beta.sessions.events.send(
                session_id,
                {
                    "type": "user.custom_tool_result",
                    "tool_use_id": event.id,
                    "content": [{"type": "text", "text": json.dumps(result)}],
                },
            )

        elif event.type == "session.status_idle":
            break

        elif event.type == "session.error":
            raise RuntimeError(f"Session error: {event.message}")

    return {"text": response_text, "tools_called": tools_called}


# ─── File upload ──────────────────────────────────────────────────────────────

def upload_file(path: str) -> str:
    """Upload a file for use as a session resource. Returns file_id."""
    with open(path, "rb") as f:
        uploaded = client.files.create(file=(path.split("/")[-1], f), purpose="agent_resource")
    return uploaded.id


# ─── Usage example ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # One-time setup
    infra = setup_agent_infra(
        agent_name="Data Analyst",
        system_prompt="You are a helpful data analyst. Data is at /workspace/file_0.",
        pip_packages=["pandas", "matplotlib"],
    )
    print(infra)

    # Per-session
    csv_file_id = upload_file("sample_data.csv")
    session_id = create_session(
        agent_id=infra["agent_id"],
        env_id=infra["env_id"],
        user_id="user_123",
        file_ids=[csv_file_id],
    )

    def my_tool_handler(name: str, input: dict) -> Any:
        if name == "SaveResult":
            # write to your DB here
            return {"saved": True}
        return {"error": f"Unknown tool: {name}"}

    result = run_agent_turn(session_id, "What are the top 5 rows by revenue?", my_tool_handler)
    print(result["text"])
```

---

## 15. Debugging and Monitoring

### Developer Console

The Anthropic developer console has a dedicated **Managed Agents** section:
- View all agents, environments, sessions
- Replay session event history as a full transcript
- "Ask Claude" side-panel — opens a new session with context about the session you're debugging
- Span view — timing breakdown per tool call and agent turn

### Spans for instrumentation

```typescript
// span.start / span.end events give you per-turn timing
for await (const event of client.beta.sessions.events.stream(sessionId)) {
  if (event.type === "span.start") {
    timers.set(event.span_id, Date.now());
  }
  if (event.type === "span.end") {
    const duration = Date.now() - (timers.get(event.span_id) ?? Date.now());
    metrics.record(`span.${event.name}`, duration);
  }
}
```

### Common failure modes and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Session hangs at `status_running` | Custom tool handler not sending result | Always send `user.custom_tool_result` for every `agent.custom_tool_use` |
| `context_overflow` error | Context grew too large | Add context budget guidance to system prompt; use compaction events to detect |
| Agent ignores tool results | Tool result content format wrong | Content must be `[{ type: "text", text: "..." }]` — JSON-stringify objects |
| High latency on session create | Resources mounting slowly | Upload files once, reuse `file_id` — don't re-upload per session |
| Agent recreated per request | Bug in your session management | Store `session_id` in DB; reuse for the same conversation |
| Agent version drift | Different users on different versions | Pin `{ id, version }` explicitly for production sessions |

---

## 16. Production Checklist

### Before first deployment

- [ ] `AGENT_ID`, `ENV_ID` stored in environment variables (not hardcoded)
- [ ] Agent and Environment created once, not per request
- [ ] `session_id` persisted in your database, linked to user + conversation
- [ ] All API keys in Vaults or server environment — none passed to agent
- [ ] Custom tool handlers validate and sanitize `input` before executing
- [ ] `session.error` events surfaced to user with actionable message
- [ ] Artifact downloads tested (files.list → files.content)
- [ ] Permission policies reviewed: `always_ask` for any destructive operations
- [ ] System prompt tested with adversarial inputs (prompt injection resistance)

### Performance

- [ ] File resources uploaded once and `file_id` reused across sessions
- [ ] Session creation pre-warmed (before user sends first message)
- [ ] Agent version pinned for active sessions (`{ id, version }`)
- [ ] Compaction events logged for observability

### Security

- [ ] No API keys in agent system prompt or session metadata
- [ ] Custom tool SQL queries use parameterized statements (no string interpolation)
- [ ] `vault_ids` scoped per user — user A's vault never attached to user B's session
- [ ] `always_deny` on any tools your agent should never use

### Reliability

- [ ] Session IDs stored in durable storage (not in-memory)
- [ ] Custom tool handler has a timeout and returns an error result (not throws) on failure
- [ ] Polling fallback implemented if SSE connection drops
- [ ] Agent version update tested in staging before promoting to production

---

## 17. Migration from Claude Code

If you built an initial prototype in Claude Code (`.claude/agents/` markdown files + `Agent()` tool) and want to migrate to the Managed Agents SDK:

| Claude Code concept | Managed Agents equivalent |
|---|---|
| `.claude/agents/<name>.md` frontmatter | `client.beta.agents.create({ name, model, system, tools })` |
| `skills: [skill-name]` in frontmatter | `skills: [{ skill_id: "...", version: 1 }]` in agent config |
| `Agent()` tool call | `client.beta.sessions.create()` + `events.send(user.message)` |
| File-system inter-agent memory | Shared session + files, or Database, or Memory Stores |
| `SubagentStart` / `SubagentStop` hooks | `agent.running` / `agent.complete` events from event stream |
| `Bash(uv run python -m backend.app.services.*)` | Custom tool declared in agent config, handled by your backend |
| `settings.json` allow/deny list | `permission_policy` per tool in agent config |
| `.env` API keys | Vaults (per-user) or environment variables (per-server) |

### Migration steps

1. **Keep the system prompts** — they work identically. Copy from `.md` files into the `system` field.
2. **Convert custom Bash service calls** → Custom tools (declare in agent, handle in backend).
3. **Replace file-system state** → Database or session-scoped files in `/mnt/session/`.
4. **Replace hook_emit** → Read `agent.running`/`agent.complete` events from the stream.
5. **One-time setup script** → Run once to create Agent + Environment; store IDs in `.env`.
6. **Backend dispatch endpoint** → Replace `subprocess.Popen(["claude", ...])` with `sessions.create()` + `events.send()`.

---

## 18. Quick Reference Card

```
──────────────────────── SETUP (ONCE) ────────────────────────
env    = client.beta.environments.create({ name, config })
agent  = client.beta.agents.create({ name, model, system, tools })
Store: ENV_ID, AGENT_ID

──────────────────────── PER SESSION ────────────────────────
session = client.beta.sessions.create({
  agent: AGENT_ID,  environment_id: ENV_ID,
  resources: [{ type: "file", file_id, mount_path }],
  vault_ids: [vaultId],  metadata: { userId }
})
Store: session.id → user + conversation in DB

──────────────────────── SEND MESSAGE ───────────────────────
client.beta.sessions.events.send(session.id, {
  type: "user.message",
  content: [{ type: "text", text: "..." }]
})

──────────────────────── STREAM EVENTS ──────────────────────
for await (const e of client.beta.sessions.events.stream(session.id)) {
  "agent.message"         → render text
  "agent.tool_use"        → show "running tool..."
  "agent.custom_tool_use" → execute, send user.custom_tool_result
  "session.status_idle"   → turn complete, break
  "session.error"         → surface error
}

──────────────────────── CUSTOM TOOL RESULT ─────────────────
client.beta.sessions.events.send(session.id, {
  type: "user.custom_tool_result",
  tool_use_id: event.id,
  content: [{ type: "text", text: JSON.stringify(result) }]
})

──────────────────────── ARTIFACTS ──────────────────────────
files = client.files.list({ scope_id: session.id })
data  = client.files.content(file.id)

──────────────────────── EVENT TYPES ────────────────────────
→ user.message             ← agent.message
→ user.custom_tool_result  ← agent.custom_tool_use
→ user.tool_confirmation   ← agent.tool_use / agent.tool_results
                           ← session.status_idle / running / error
                           ← context.compaction
                           ← span.start / span.end

──────────────────────── MODEL IDs ──────────────────────────
claude-opus-4-7           (most capable, use for complex tasks)
claude-sonnet-4-6         (balanced speed + quality)
claude-haiku-4-5-20251001 (fastest, use for simple/high-volume tasks)
```

---

*Document version: April 2026. Check Anthropic developer docs for Memory Stores, Outcomes GA, and multi-agent primitives as they reach general availability.*
