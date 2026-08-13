#!/usr/bin/env node
// ═══════ PV NATIVE HOST ═══════
// Spawned BY Chrome (native messaging) when the extension connects. Bridges:
//
//   MCP server (pv-mcp.mjs) ──TCP 127.0.0.1──▶ this host ──stdio──▶ extension
//
// Security: listens on 127.0.0.1 only, on a random port; clients must present
// the token from ~/.pv/pv.json (written 0600 by this process). The host only
// exists while Chrome holds the native messaging port open — no Chrome, no
// listener. Install: pv/install-windows.ps1 or pv/install-mac-linux.sh.

import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const PV_DIR = path.join(os.homedir(), ".pv");
const PV_FILE = path.join(PV_DIR, "pv.json");
const REQUEST_TIMEOUT_MS = 15000;

// ── native messaging framing (4-byte LE length + JSON, both directions) ──
function sendToChrome(obj) {
  const buf = Buffer.from(JSON.stringify(obj), "utf8");
  const head = Buffer.alloc(4);
  head.writeUInt32LE(buf.length, 0);
  process.stdout.write(Buffer.concat([head, buf]));
}

let stdinBuf = Buffer.alloc(0);
const chromeHandlers = [];
process.stdin.on("data", chunk => {
  stdinBuf = Buffer.concat([stdinBuf, chunk]);
  while (stdinBuf.length >= 4) {
    const len = stdinBuf.readUInt32LE(0);
    if (stdinBuf.length < 4 + len) break;
    const body = stdinBuf.subarray(4, 4 + len).toString("utf8");
    stdinBuf = stdinBuf.subarray(4 + len);
    try {
      const msg = JSON.parse(body);
      chromeHandlers.forEach(h => h(msg));
    } catch { /* skip malformed frame */ }
  }
});
process.stdin.on("end", () => shutdown());
process.stdin.on("close", () => shutdown());

// ── pending requests (socket → chrome → socket) ──
let seq = 0;
const pending = new Map(); // id -> {resolve, timer}

chromeHandlers.push(msg => {
  if (msg?.type === "PV_RESULT" && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    clearTimeout(p.timer);
    p.resolve({ ok: true, result: msg.result });
  }
});

function callChrome(tool, args) {
  return new Promise(resolve => {
    const id = "r" + (++seq);
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve({ ok: false, error: "extension did not respond within " + REQUEST_TIMEOUT_MS / 1000 + "s" });
    }, REQUEST_TIMEOUT_MS);
    pending.set(id, { resolve, timer });
    sendToChrome({ type: "PV_TOOL", id, tool, args });
  });
}

// ── local socket for MCP clients (ndjson, token-authenticated) ──
const token = crypto.randomBytes(24).toString("hex");
const server = net.createServer(sock => {
  sock.setNoDelay(true);
  let authed = false;
  let buf = "";
  sock.on("data", async data => {
    buf += data.toString("utf8");
    let nl;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { sock.write(JSON.stringify({ error: "bad json" }) + "\n"); continue; }
      if (!authed) {
        if (msg.auth === token) { authed = true; sock.write(JSON.stringify({ ok: true, host: "pv" }) + "\n"); }
        else { sock.write(JSON.stringify({ error: "bad token" }) + "\n"); sock.end(); }
        continue;
      }
      const out = await callChrome(msg.tool, msg.args);
      sock.write(JSON.stringify({ id: msg.id, ...out }) + "\n");
    }
  });
  sock.on("error", () => {});
});

server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  try {
    fs.mkdirSync(PV_DIR, { recursive: true });
    fs.writeFileSync(PV_FILE, JSON.stringify({ port, token, pid: process.pid, startedAt: Date.now() }), { mode: 0o600 });
  } catch (e) {
    sendToChrome({ type: "PV_HOST_ERROR", error: "cannot write " + PV_FILE + ": " + e.message });
  }
  sendToChrome({ type: "PV_HOST_READY", port });
});

function shutdown() {
  try { const cur = JSON.parse(fs.readFileSync(PV_FILE, "utf8")); if (cur.pid === process.pid) fs.unlinkSync(PV_FILE); } catch {}
  try { server.close(); } catch {}
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
