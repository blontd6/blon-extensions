// ==UserScript==
// @name         Blon Debug
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  debug
// @author       blontd6
// @match        *://openfront.io/*
// @match        *://*.openfront.io/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  "use strict";

  function init(api) {
    api.registerExtension({
      id: "blon-debug",
      name: "Blon Debug",
      version: "1.0",
      tabLabel: "Debug",
      tabContent: function(panel) {
        const btn = document.createElement("button");
        btn.textContent = "Hello World";
        btn.style.cssText = "background:#111;border:1px solid #333;color:#fff;padding:6px 14px;border-radius:4px;cursor:pointer;font-size:12px;";
        btn.addEventListener("click", function() {
          console.log("Hello World");
        });
        panel.appendChild(btn);
      }
    });
  }

  function wait(retries) {
    if (window.__blonAPI && typeof window.__blonAPI.registerExtension === "function") {
      init(window.__blonAPI);
    } else if (retries > 0) {
      setTimeout(function() { wait(retries - 1); }, 300);
    }
  }

  wait(30);
})();
