// ==UserScript==
// @name         Blon Extension: Catch Winner Intent
// @namespace    http://tampermonkey.net/
// @version      6.1.0
// @description  Catches and blocks the winner intent from being sent.
// @author       blon
// @match        *://openfront.io/*
// @match        *://*.openfront.io/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  function initCatchWinnerIntent(api) {
    let catchEnabled = true;

    const EB_HOOK_MARKER = "__catch_winner_hooked__";

    function isWinnerFrame(data) {
      let b0 = undefined;
      if (data instanceof ArrayBuffer) {
        b0 = new Uint8Array(data)[0];
      } else if (ArrayBuffer.isView(data)) {
        b0 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)[0];
      }
      return b0 === 0x00;
    }

    function isSendWinnerEvent(event) {
      return Boolean(
        event &&
        typeof event === "object" &&
        "allPlayersStats" in event &&
        !("troops" in event) &&
        !("tile" in event) &&
        !("intent" in event) &&
        !("stats" in event)
      );
    }

    function hookEventBus() {
      const eb = api.getEventBus?.();
      if (!eb || eb[EB_HOOK_MARKER]) return;
      eb[EB_HOOK_MARKER] = true;

      const origEmit = eb.emit.bind(eb);
      eb.emit = function (event) {
        if (catchEnabled && isSendWinnerEvent(event)) {
          return;
        }
        return origEmit(event);
      };
    }

    const ebHookInterval = setInterval(hookEventBus, 250);

    let hookedSockets = new WeakSet();
    function hookSocket(sock) {
      if (!sock || hookedSockets.has(sock)) return;
      hookedSockets.add(sock);

      const origSend = sock.send.bind(sock);
      sock.send = function (data) {
        if (catchEnabled && isWinnerFrame(data)) {
          return;
        }
        return origSend(data);
      };
    }

    const socketPollInterval = setInterval(() => {
      const sock = api.getActiveSocket?.();
      if (sock) hookSocket(sock);
    }, 250);

    function buildUI(panel) {
      panel.innerHTML = "";
      panel.style.cssText += "padding:10px 12px;font-family:monospace;";

      const label = document.createElement("label");
      label.style.cssText = "display:flex;align-items:center;gap:7px;cursor:pointer;color:#aaa;margin:4px 0;";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = catchEnabled;
      checkbox.style.cssText = "cursor:pointer;margin:0;";
      checkbox.addEventListener("change", function () {
        catchEnabled = checkbox.checked;
      });

      const span = document.createElement("span");
      span.style.cssText = "font-size:11px;";
      span.textContent = "Catch winner intent";

      label.appendChild(checkbox);
      label.appendChild(span);
      panel.appendChild(label);
    }

    api.registerExtension({
      id: "hash-ghost",
      name: "Catch Winner Intent",
      version: "6.1.0",
      description: "Catches and blocks the winner intent from being sent.",
      tabLabel: "Winner",
      tabContent: buildUI,
      onUninstall() {
        catchEnabled = false;
        clearInterval(socketPollInterval);
        clearInterval(ebHookInterval);
      },
    });
  }

  function wait(retries) {
    if (window.__blonAPI?.registerExtension) {
      initCatchWinnerIntent(window.__blonAPI);
    } else if (retries > 0) {
      setTimeout(() => wait(retries - 1), 300);
    }
  }
  wait(40);
})();
