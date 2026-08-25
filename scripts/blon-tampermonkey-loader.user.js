// ==UserScript==
// @name         Blon Extension: Tampermonkey Script Loader
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Extension loader
// @author       blon
// @match        *://openfront.io/*
// @match        *://*.openfront.io/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  "use strict";

  const EXTENSION_ID = "tampermonkey-loader";
  const EXTENSION_NAME = "Tampermonkey Loader";
  const EXTENSION_VERSION = "1.0.0";
  const TAB_LABEL = "Loader";
  const STORAGE_KEY = "blon_tm_loader_scripts";
  const BLON_EXTS_KEY = "blon_installed_extensions";

  window.__blonExecutedScripts = window.__blonExecutedScripts || new Set();

  function setupTampermonkeyPolyfills() {
    if (typeof window.unsafeWindow === "undefined") {
      try {
        window.unsafeWindow = window;
      } catch (e) {}
    }

    if (typeof window.GM_info === "undefined") {
      window.GM_info = {
        script: {
          name: "Blon Tampermonkey Loader",
          version: "1.0.0",
          namespace: "http://tampermonkey.net/"
        },
        scriptHandler: "Blon Tampermonkey Loader",
        version: "1.0.0"
      };
    }

    if (typeof window.GM_addStyle === "undefined") {
      window.GM_addStyle = function(css) {
        try {
          const style = document.createElement("style");
          style.textContent = css;
          (document.head || document.documentElement).appendChild(style);
          return style;
        } catch (e) {
          return null;
        }
      };
    }

    if (typeof window.GM_setValue === "undefined") {
      window.GM_setValue = function(key, val) {
        try {
          localStorage.setItem(`TM_VAL_${key}`, JSON.stringify(val));
        } catch (e) {
          localStorage.setItem(`TM_VAL_${key}`, String(val));
        }
      };
    }

    if (typeof window.GM_getValue === "undefined") {
      window.GM_getValue = function(key, defaultVal) {
        try {
          const raw = localStorage.getItem(`TM_VAL_${key}`);
          if (raw === null) return defaultVal;
          return JSON.parse(raw);
        } catch (e) {
          const raw = localStorage.getItem(`TM_VAL_${key}`);
          return raw !== null ? raw : defaultVal;
        }
      };
    }

    if (typeof window.GM_deleteValue === "undefined") {
      window.GM_deleteValue = function(key) {
        try {
          localStorage.removeItem(`TM_VAL_${key}`);
        } catch (e) {}
      };
    }

    if (typeof window.GM_listValues === "undefined") {
      window.GM_listValues = function() {
        const keys = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith("TM_VAL_")) {
              keys.push(k.substring(7));
            }
          }
        } catch (e) {}
        return keys;
      };
    }

    if (typeof window.GM_setClipboard === "undefined") {
      window.GM_setClipboard = function(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
      };
    }

    if (typeof window.GM_registerMenuCommand === "undefined") {
      window.GM_registerMenuCommand = function() {};
    }

    if (typeof window.GM_xmlhttpRequest === "undefined") {
      window.GM_xmlhttpRequest = function(details) {
        const url = details.url;
        const method = (details.method || "GET").toUpperCase();
        const headers = details.headers || {};
        const data = details.data;

        fetch(url, {
          method,
          headers,
          body: method !== "GET" && method !== "HEAD" ? data : undefined,
          cache: "no-store"
        })
          .then(async (response) => {
            const text = await response.text();
            const resObj = {
              status: response.status,
              statusText: response.statusText,
              readyState: 4,
              responseHeaders: "",
              responseText: text,
              response: text
            };
            if (typeof details.onload === "function") {
              details.onload(resObj);
            }
          })
          .catch((err) => {
            if (typeof details.onerror === "function") {
              details.onerror({ error: err.message });
            }
          });
      };
    }
  }

  function parseUserScriptMetadata(code) {
    const meta = {
      name: "Custom Script",
      version: "1.0",
      description: "",
      author: "unknown",
      id: "",
      tabLabel: null
    };

    const match = code.match(/\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/);
    if (match) {
      const header = match[1];
      const lines = header.split(/\r?\n/);
      for (const line of lines) {
        const tagMatch = line.match(/\/\/\s*@([a-zA-Z0-9_\-]+)\s*(.*)$/);
        if (tagMatch) {
          const key = tagMatch[1].trim().toLowerCase();
          const val = tagMatch[2].trim();
          if (key === "name" && val) meta.name = val;
          else if (key === "version" && val) meta.version = val;
          else if (key === "description" && val) meta.description = val;
          else if (key === "author" && val) meta.author = val;
          else if (key === "id" && val) meta.id = val;
          else if (key === "tablabel" && val) meta.tabLabel = val;
        }
      }
    }

    if (!meta.id) {
      meta.id = meta.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (!meta.id) meta.id = `script-${Date.now()}`;
    }

    return meta;
  }

  function executeScriptCode(code, scriptId) {
    setupTampermonkeyPolyfills();

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = code;
    (document.head || document.documentElement).appendChild(script);
    script.remove();

    if (scriptId) {
      window.__blonExecutedScripts.add(scriptId);
    }
  }

  function getSavedScripts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveScripts(scripts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
    } catch (e) {}
  }

  function syncToBlonExtensions(meta, code) {
    try {
      const raw = localStorage.getItem(BLON_EXTS_KEY);
      const blonExts = raw ? JSON.parse(raw) : {};
      blonExts[meta.id] = {
        code: code,
        version: meta.version,
        name: meta.name,
        id: meta.id,
        description: meta.description,
        author: meta.author
      };
      localStorage.setItem(BLON_EXTS_KEY, JSON.stringify(blonExts));
    } catch (e) {}
  }

  function removeFromBlonExtensions(id) {
    try {
      const raw = localStorage.getItem(BLON_EXTS_KEY);
      if (raw) {
        const blonExts = JSON.parse(raw);
        delete blonExts[id];
        localStorage.setItem(BLON_EXTS_KEY, JSON.stringify(blonExts));
      }
    } catch (e) {}
  }

  function loadPersistedScripts() {
    const scripts = getSavedScripts();
    for (const id of Object.keys(scripts)) {
      const entry = scripts[id];
      if (entry && entry.code && !window.__blonExecutedScripts.has(id)) {
        try {
          executeScriptCode(entry.code, id);
        } catch (err) {}
      }
    }
  }

  function renderLoaderTab(panel, api) {
    panel.innerHTML = "";
    panel.style.fontFamily = "monospace";
    panel.style.fontSize = "11px";

    const textarea = document.createElement("textarea");
    textarea.id = "blon-tm-script-input";
    textarea.placeholder = "Paste Tampermonkey extension (.user.js) code or script URL here...";
    textarea.style.cssText = "width:100%;height:220px;box-sizing:border-box;background:#111;color:#fff;border:1px solid #333;border-radius:4px;padding:8px;font-family:monospace;font-size:11px;line-height:1.4;resize:vertical;outline:none;margin-bottom:8px;";

    const loadBtn = document.createElement("button");
    loadBtn.id = "blon-tm-load-btn";
    loadBtn.textContent = "Load";
    loadBtn.style.cssText = "width:100%;background:#111;color:#aaa;border:1px solid #444;padding:8px 0;border-radius:4px;font-weight:bold;font-size:11px;cursor:pointer;font-family:monospace;transition:background 0.15s, color 0.15s;box-sizing:border-box;";

    loadBtn.addEventListener("mouseover", () => {
      loadBtn.style.background = "#222";
      loadBtn.style.color = "#fff";
    });
    loadBtn.addEventListener("mouseout", () => {
      loadBtn.style.background = "#111";
      loadBtn.style.color = "#aaa";
    });

    loadBtn.addEventListener("click", async () => {
      let rawContent = textarea.value.trim();
      if (!rawContent) {
        const origText = loadBtn.textContent;
        loadBtn.textContent = "Paste code first";
        loadBtn.style.color = "#ff4444";
        setTimeout(() => {
          loadBtn.textContent = origText;
          loadBtn.style.color = "#aaa";
        }, 1200);
        return;
      }

      loadBtn.disabled = true;
      loadBtn.textContent = "Loading...";

      try {
        let codeToRun = rawContent;

        if (/^https?:\/\//i.test(rawContent)) {
          const res = await fetch(rawContent, { cache: "no-store" });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          codeToRun = await res.text();
        }

        if (!codeToRun || !codeToRun.trim()) {
          throw new Error("Empty script");
        }

        const meta = parseUserScriptMetadata(codeToRun);
        executeScriptCode(codeToRun, meta.id);

        const saved = getSavedScripts();
        saved[meta.id] = {
          id: meta.id,
          name: meta.name,
          version: meta.version,
          description: meta.description,
          author: meta.author,
          code: codeToRun,
          loadedAt: Date.now()
        };
        saveScripts(saved);
        syncToBlonExtensions(meta, codeToRun);

        textarea.value = "";
        loadBtn.textContent = "✓ Loaded!";
        loadBtn.style.color = (api && api.cfg && api.cfg.guiColor) || "#00ff66";
        setTimeout(() => {
          loadBtn.textContent = "Load";
          loadBtn.style.color = "#aaa";
          loadBtn.disabled = false;
        }, 1500);
      } catch (err) {
        loadBtn.textContent = "Failed to load";
        loadBtn.style.color = "#ff4444";
        setTimeout(() => {
          loadBtn.textContent = "Load";
          loadBtn.style.color = "#aaa";
          loadBtn.disabled = false;
        }, 2000);
      }
    });

    panel.appendChild(textarea);
    panel.appendChild(loadBtn);
  }

  function init(api) {
    api.registerExtension({
      id: EXTENSION_ID,
      name: EXTENSION_NAME,
      version: EXTENSION_VERSION,
      description: "Extension loader",
      tabLabel: TAB_LABEL,
      tabContent: function(panel) {
        renderLoaderTab(panel, api);
      },
      onUninstall: function() {
        console.log("[TM Loader] Extension uninstalled.");
      }
    });
  }

  loadPersistedScripts();

  function waitForBlonAPI(retries) {
    if (window.__blonAPI && typeof window.__blonAPI.registerExtension === "function") {
      init(window.__blonAPI);
    } else if (retries > 0) {
      setTimeout(() => waitForBlonAPI(retries - 1), 300);
    }
  }

  waitForBlonAPI(40);
})();
