#!/usr/bin/env node
// ═══════ PV MCP SERVER ═══════
// Model Context Protocol server (stdio transport) exposing Prompt Vault to
// local AI agents — Claude Code, Cowork, Codex, ChatGPT desktop, anything
// that speaks MCP. Zero dependencies.
//
//   Claude Code:  claude mcp add pv -- node /path/to/pv/pv-mcp.mjs
//   Codex CLI:    [mcp_servers.pv] command="node" args=["/path/to/pv/pv-mcp.mjs"]
//
// Requires the PV native host to be installed (pv/install-*.ps1|sh) and
// Chrome running with Prompt Vault ≥ 7.14 — see docs/PV.md.

import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

const PV_FILE = path.join(os.homedir(), ".pv", "pv.json");
const PROTOCOL = "2025-06-18";

const TOOLS = [
  {
    name: "pv_status",
    description: "Prompt Vault connection check: extension version and item counts per silo (prompts, clips, notes, bookmarks, skills, custom GPTs, image prompts).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "pv_list_folders",
    description: "List the folder tree of a Prompt Vault silo (or all silos) with item counts. Use folder paths like 'Coding/Reviews' when adding items.",
    inputSchema: { type: "object", properties: { silo: { type: "string", enum: ["prompts", "snippets", "notes", "bookmarks", "skills", "customgpts", "imgprompts"], description: "Omit for all silos. 'snippets' = clips." } }, additionalProperties: false },
  },
  {
    name: "pv_add_item",
    description: "Add an item to the user's Prompt Vault. Additive and idempotent: an identical title+content in the destination folder is deduped. Missing folders are created. Clips default to the Inbox folder.",
    inputSchema: {
      type: "object",
      properties: {
        silo: { type: "string", enum: ["prompts", "snippets", "notes", "bookmarks", "skills", "customgpts", "imgprompts"], description: "'snippets' = clips" },
        title: { type: "string" },
        content: { type: "string", description: "Body text. For skills, SKILL.md content." },
        folder: { type: "string", description: "Slash path under the silo root, e.g. 'Coding/Reviews'. Created if missing." },
        tags: { type: "array", items: { type: "string" } },
        url: { type: "string", description: "Required for bookmarks and customgpts." },
        platform: { type: "string", description: "Platform id, e.g. anthropic, openai, midjourney." },
        source: { type: "string", description: "Clips: URL the text was captured from." },
        agent: { type: "string", description: "Name of the agent making the call (recorded in provenance)." },
      },
      required: ["silo", "title"],
      additionalProperties: false,
    },
  },
  {
    name: "pv_search",
    description: "Search Prompt Vault items by keyword across titles, tags, and content. Returns silo, id, title, folder, and a snippet.",
    inputSchema: { type: "object", properties: { query: { type: "string" }, silo: { type: "string", enum: ["prompts", "snippets", "notes", "bookmarks", "skills", "customgpts", "imgprompts"] }, limit: { type: "number" } }, required: ["query"], additionalProperties: false },
  },
  {
    name: "pv_get_item",
    description: "Fetch one Prompt Vault item in full (content, tags, url, provenance) by silo and id.",
    inputSchema: { type: "object", properties: { silo: { type: "string" }, id: { type: "string" } }, required: ["silo", "id"], additionalProperties: false },
  },
  {
    name: "pv_recent",
    description: "Most recently modified Prompt Vault items, optionally scoped to one silo.",
    inputSchema: { type: "object", properties: { silo: { type: "string" }, limit: { type: "number" } }, additionalProperties: false },
  },
];

// ── bridge client ───────────────────────────────────────────────
let sock = null, sockRl = null, sockSeq = 0;
const sockPending = new Map();

function connectHost() {
  return new Promise((resolve, reject) => {
    let info;
    try { info = JSON.parse(fs.readFileSync(PV_FILE, "utf8")); }
    catch { return reject(new Error("PV host is not running. Install it (pv/install-*.ps1|sh), make sure Chrome is open with Prompt Vault ≥ 7.14, then retry.")); }
    const s = net.createConnection({ host: "127.0.0.1", port: info.port }, () => {
      s.write(JSON.stringify({ auth: info.token }) + "\n");
    });
    s.setNoDelay(true);
    const rl = readline.createInterface({ input: s });
    let authed = false;
    rl.on("line", line => {
      let msg; try { msg = JSON.parse(line); } catch { return; }
      if (!authed) {
        if (msg.ok) { authed = true; sock = s; sockRl = rl; resolve(); }
        else reject(new Error("PV host refused the token — restart Chrome and retry."));
        return;
      }
      const p = sockPending.get(msg.id);
      if (p) { sockPending.delete(msg.id); p(msg); }
    });
    s.on("error", e => { if (!authed) reject(new Error("Cannot reach PV host (" + e.code + "). Is Chrome running?")); });
    s.on("close", () => { sock = null; sockRl = null; });
  });
}

async function callVault(tool, args) {
  if (!sock) await connectHost();
  return new Promise(resolve => {
    const id = "m" + (++sockSeq);
    sockPending.set(id, resolve);
    sock.write(JSON.stringify({ id, tool, args }) + "\n");
    setTimeout(() => { if (sockPending.has(id)) { sockPending.delete(id); resolve({ ok: false, error: "timeout talking to PV host" }); } }, 20000);
  });
}

// ── MCP over stdio (newline-delimited JSON-RPC) ────────────────
const out = obj => process.stdout.write(JSON.stringify(obj) + "\n");
const rl = readline.createInterface({ input: process.stdin });

rl.on("line", async line => {
  line = line.trim();
  if (!line) return;
  let req;
  try { req = JSON.parse(line); } catch { return; }
  const { id, method, params } = req;
  const reply = result => { if (id !== undefined) out({ jsonrpc: "2.0", id, result }); };
  const fail = (code, message) => { if (id !== undefined) out({ jsonrpc: "2.0", id, error: { code, message } }); };

  try {
    if (method === "initialize") {
      reply({
        protocolVersion: params?.protocolVersion || PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: "pv", title: "Prompt Vault", version: "1.0.0" },
        instructions: "PV bridges this machine's Prompt Vault Chrome extension. Use pv_add_item to save prompts/clips/notes/bookmarks for the user; pv_search before adding to avoid duplicates. Chrome must be running.",
      });
    } else if (method === "notifications/initialized" || (method || "").startsWith("notifications/")) {
      // notifications need no response
    } else if (method === "ping") {
      reply({});
    } else if (method === "tools/list") {
      reply({ tools: TOOLS });
    } else if (method === "tools/call") {
      const { name, arguments: args } = params || {};
      if (!TOOLS.find(t => t.name === name)) return fail(-32602, "unknown tool: " + name);
      let resp;
      try { resp = await callVault(name, args || {}); }
      catch (e) { return reply({ content: [{ type: "text", text: String(e.message || e) }], isError: true }); }
      if (!resp.ok) return reply({ content: [{ type: "text", text: "PV error: " + resp.error }], isError: true });
      const isErr = resp.result && typeof resp.result === "object" && resp.result.error;
      reply({ content: [{ type: "text", text: JSON.stringify(resp.result, null, 1) }], isError: !!isErr });
    } else {
      fail(-32601, "method not found: " + method);
    }
  } catch (e) {
    fail(-32603, String(e && e.message || e));
  }
});

rl.on("close", () => process.exit(0));
