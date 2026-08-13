// ═══════════════════════════════════════════════════════════════
// PROMPT VAULT — Provider Adapter Registry
// ═══════════════════════════════════════════════════════════════
//
// Central registry for AI provider detection, input finding, and response capture.
// Adding a new provider = add one object here. No DOM logic scattered across files.
//
// Used by: content.js (inject, capture), background.js (platform detection)

const PV_ADAPTERS = [
  {
    id: "anthropic",
    webUrl: "https://claude.ai/new",
    name: "Claude",
    hosts: ["claude.ai"],
    urls: ["claude.ai"],
    inputSelectors: [
      'div.ProseMirror[contenteditable="true"]',
      'div.tiptap[contenteditable="true"]',
      'div[contenteditable="true"][data-placeholder]',
      'div[contenteditable="plaintext-only"]',
      'div[role="textbox"][contenteditable="true"]',
      'div[contenteditable="true"][class*="composer"]',
      'div[contenteditable="true"][data-testid]',
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="Reply"]',
    ],
    responseSelectors: ['.font-claude-message', '[data-testid="chat-message-content"]'],
    streamingAttr: "data-is-streaming",
    streamingSelector: "[data-is-streaming]",
  },
  {
    id: "openai",
    webUrl: "https://chatgpt.com/",
    name: "ChatGPT",
    hosts: ["chatgpt.com", "chat.openai.com"],
    urls: ["chatgpt.com", "chat.openai.com"],
    inputSelectors: ['#prompt-textarea', 'div#prompt-textarea[contenteditable="true"]', 'textarea[placeholder*="Message"]', '[data-message-author-role="user"]'],
    responseSelectors: ['[data-message-author-role="assistant"]'],
  },
  {
    id: "google",
    webUrl: "https://gemini.google.com/app",
    name: "Gemini",
    hosts: ["gemini.google.com"],
    urls: ["gemini.google.com"],
    inputSelectors: ['rich-textarea div[contenteditable="true"]', 'div[contenteditable="true"][data-placeholder]', 'textarea[placeholder*="Ask"]'],
    responseSelectors: ['message-content.model-response-text', '[class*="response-container"]', 'div.model-response-text'],
  },
  {
    id: "xai",
    webUrl: "https://grok.com/",
    name: "Grok",
    hosts: ["grok.com", "grok.x.ai", "x.com/i/grok"],
    urls: ["grok.com", "grok.x.ai", "x.com/i/grok"],
    inputSelectors: ['div[contenteditable="true"]', 'textarea[placeholder*="Ask"]'],
    responseSelectors: ['[class*="message"][class*="assistant"]', '[class*="message-bubble"]'],
  },
  {
    id: "perplexity",
    webUrl: "https://www.perplexity.ai/",
    name: "Perplexity",
    hosts: ["perplexity.ai", "www.perplexity.ai"],
    urls: ["perplexity.ai"],
    inputSelectors: [
      'textarea[placeholder*="Ask"]',
      'textarea[placeholder*="ask"]',
      'textarea[placeholder*="Search"]',
      'textarea[placeholder*="search"]',
      'textarea[placeholder*="Follow"]',
      'textarea[placeholder*="follow"]',
      'textarea[placeholder*="Type"]',
      'textarea[placeholder*="type"]',
      '#searchbox textarea',
      'textarea[class*="search"]',
      'textarea[class*="input"]',
      'textarea[class*="textarea"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][data-placeholder]',
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"]',
      'textarea',
    ],
    responseSelectors: ['[class*="prose"]', '[class*="answer"]', '[class*="response"]', '[class*="markdown"]'],
  },
  {
    id: "mistral",
    webUrl: "https://chat.mistral.ai/chat",
    name: "Mistral",
    hosts: ["chat.mistral.ai"],
    urls: ["chat.mistral.ai"],
    inputSelectors: ['div.ql-editor[contenteditable="true"]', 'textarea[placeholder*="message"]', 'div[contenteditable="true"]'],
    responseSelectors: ['[class*="assistant-message"]', '[class*="message"][class*="bot"]'],
  },
  {
    id: "deepseek",
    webUrl: "https://chat.deepseek.com/",
    name: "DeepSeek",
    hosts: ["chat.deepseek.com"],
    urls: ["chat.deepseek.com"],
    inputSelectors: ['textarea[placeholder*="Ask"]', 'div[contenteditable="true"]'],
    responseSelectors: ['[class*="assistant"]', '[class*="message-content"]'],
  },
  {
    id: "meta",
    webUrl: "https://www.meta.ai/",
    name: "Meta AI",
    hosts: ["meta.ai"],
    urls: ["meta.ai"],
    inputSelectors: ['textarea[placeholder*="Ask"]', 'div[contenteditable="true"]'],
    responseSelectors: ['[class*="response"]'],
  },
  {
    id: "copilot",
    webUrl: "https://copilot.microsoft.com/",
    name: "Copilot",
    hosts: ["copilot.microsoft.com"],
    urls: ["copilot.microsoft.com"],
    inputSelectors: ['div[contenteditable="true"]', 'textarea[placeholder*="Ask"]'],
    responseSelectors: ['[class*="response"]', 'cib-message-group[source="bot"]'],
  },
  {
    id: "poe",
    webUrl: "https://poe.com/",
    name: "Poe",
    hosts: ["poe.com"],
    urls: ["poe.com"],
    inputSelectors: ['textarea[placeholder*="message"]', 'div[contenteditable="true"]'],
    responseSelectors: ['[class*="Message_botMessage"]', '[class*="bot_message"]'],
  },
  {
    id: "hugging",
    webUrl: "https://huggingface.co/chat/",
    name: "HuggingChat",
    hosts: ["huggingface.co"],
    urls: ["huggingface.co/chat"],
    inputSelectors: ['textarea[placeholder*="Ask"]', 'div[contenteditable="true"]'],
    responseSelectors: ['[class*="assistant"]', '[class*="message"][class*="bot"]'],
  },
  {
    id: "cohere",
    webUrl: "https://coral.cohere.com/",
    name: "Coral",
    hosts: ["coral.cohere.com"],
    urls: ["coral.cohere.com"],
    inputSelectors: ['textarea[placeholder*="message"]', 'div[contenteditable="true"]'],
    responseSelectors: ['[class*="message"][class*="bot"]'],
  },
  {
    id: "midjourney",
    webUrl: "https://www.midjourney.com/imagine",
    name: "Midjourney",
    hosts: ["midjourney.com"],
    urls: ["midjourney.com"],
    inputSelectors: ['textarea[placeholder*="prompt"]', 'div[contenteditable="true"]'],
    responseSelectors: [],
  },
  {
    id: "leonardo",
    webUrl: "https://app.leonardo.ai/image-generation",
    name: "Leonardo",
    hosts: ["app.leonardo.ai"],
    urls: ["app.leonardo.ai"],
    inputSelectors: ['textarea[placeholder*="prompt"]', 'div[contenteditable="true"]'],
    responseSelectors: [],
  },
  {
    id: "ideogram",
    webUrl: "https://ideogram.ai/t/explore",
    name: "Ideogram",
    hosts: ["ideogram.ai"],
    urls: ["ideogram.ai"],
    inputSelectors: ['textarea[placeholder*="prompt"]', 'div[contenteditable="true"]'],
    responseSelectors: [],
  },
  {
    id: "runway",
    webUrl: "https://app.runwayml.com/",
    name: "Runway",
    hosts: ["app.runwayml.com"],
    urls: ["app.runwayml.com"],
    inputSelectors: ['textarea[placeholder*="prompt"]', 'div[contenteditable="true"]'],
    responseSelectors: [],
  },
  {
    id: "firefly",
    webUrl: "https://firefly.adobe.com/",
    name: "Firefly",
    hosts: ["firefly.adobe.com"],
    urls: ["firefly.adobe.com"],
    inputSelectors: ['textarea[placeholder*="prompt"]', 'div[contenteditable="true"]'],
    responseSelectors: [],
  },
];

// Generic input selectors (fallback when no adapter matches)
const PV_INPUT_SELECTORS = [
  'div.ProseMirror[contenteditable="true"]',
  '#prompt-textarea',
  'div#prompt-textarea[contenteditable="true"]',
  'div.ql-editor[contenteditable="true"]',
  'rich-textarea div[contenteditable="true"]',
  'textarea[placeholder*="Ask"]',
  'div[role="textbox"][contenteditable="true"]',
  'textarea[placeholder*="Ask anything"]',
  'textarea[placeholder*="ask"]',
  '#searchbox textarea',
  'textarea[placeholder*="Send"]',
  'textarea#chat-input',
  'textarea[placeholder*="message"]',
  'textarea[placeholder*="Message"]',
  'textarea[placeholder*="prompt"]',
  'textarea[placeholder*="type"]',
  'textarea[placeholder*="Type"]',
  'div[contenteditable="true"][role="textbox"]',
  'div[contenteditable="true"][data-placeholder]',
  'div[contenteditable="plaintext-only"]',
  'div.tiptap[contenteditable="true"]',
  'div[data-testid*="input"][contenteditable="true"]',
  'div[data-testid*="chat"] textarea',
];

// Generic response selectors (fallback)
const PV_RESPONSE_SELECTORS_GENERIC = [
  '[class*="message"][class*="response"]',
  '[class*="assistant"]',
  '[data-message-author-role="assistant"]',
  '.markdown',
];

// Detect platform from URL (for background/service worker)
function pvDetectPlatform(url) {
  if (!url) return "";
  try {
    const h = new URL(url).hostname.replace("www.", "");
    for (const a of PV_ADAPTERS) {
      for (const u of (a.hosts || a.urls || [])) {
        const host = (u || "").replace("www.", "");
        if (h===host||h.endsWith("."+host)) return a.id;
      }
    }
  } catch {}
  return "";
}

// Get input selectors for a platform (for content script inject)
function pvGetInputSelectors(platformId) {
  const a = PV_ADAPTERS.find((x) => x.id === platformId);
  if (a?.inputSelectors?.length) return a.inputSelectors;
  return PV_INPUT_SELECTORS;
}

// Get response selectors for a platform
function pvGetResponseSelectors(platformId) {
  const a = PV_ADAPTERS.find((x) => x.id === platformId);
  if (a?.responseSelectors?.length) return a.responseSelectors;
  return PV_RESPONSE_SELECTORS_GENERIC;
}

// Get the canonical web app URL for a platform (for open-and-inject)
function pvGetWebUrl(platformId) {
  const a = PV_ADAPTERS.find((x) => x.id === platformId);
  return a?.webUrl || "";
}
