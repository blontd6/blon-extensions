// ==UserScript==
// @name         Blon Extension: Autoplay Bot
// @namespace    http://tampermonkey.net/
// @version      3.9.1
// @description  Autoplay extension
// @author       blon
// @match        *://openfront.io/*
// @match        *://*.openfront.io/*
// @grant        none
// @run-at       document-end
// ==/UserScript==




(function() {
  "use strict";

  function initImpossibleBot(api) {
    const STORAGE_KEY = "blon_impossible_bot_cfg";

    const PRESETS = {
      v1v1: {
        id: "v1v1",
        name: "1v1 Meta",
        mode: "1v1",
        maxCities: 3,
        maxSilos: 1,
        maxSams: 0,
        samRatio: 0.35,
        maxPorts: 1,
        maxDefensePosts: 4,
        buildCities: true,
        buildSams: false,
        buildSilos: true,
        buildPorts: true,
        buildDefensePosts: true,
        allowAtomBombs: false, 
        allowHydrogenBombs: true, 
        triggerRatio: 0.46,
        reserveRatio: 0.42,
        expandRatio: 0.42,
        botParallelism: 80,
        autoAttack: true,
        autoExpand: true,
        autoDefend: true,
        autoBuild: true,
        autoNuke: true,
        autoSpawn: true,
        autoEmbargo: true,
        autoDonate: false,
        autoBoat: true,
        autoWarship: true,
        tickIntervalMs: 350
      },
      solo: {
        id: "solo",
        name: "Solo Impossible (Standard)",
        mode: "solo",
        maxCities: 25,
        maxSilos: 3,
        maxSams: 5,
        samRatio: 0.35,
        maxPorts: 2,
        maxDefensePosts: 3,
        buildCities: true,
        buildSams: true,
        buildSilos: true,
        buildPorts: true,
        buildDefensePosts: true,
        allowAtomBombs: true,
        allowHydrogenBombs: true,
        triggerRatio: 0.55,
        reserveRatio: 0.35,
        expandRatio: 0.15,
        botParallelism: 50,
        autoAttack: true,
        autoExpand: true,
        autoDefend: true,
        autoBuild: true,
        autoNuke: true,
        autoSpawn: true,
        autoEmbargo: true,
        autoDonate: true,
        autoBoat: true,
        autoWarship: true,
        tickIntervalMs: 800
      }
    };

    const botCfg = {
      enabled: false,
      mode: "v1v1",
      activePreset: "v1v1",
      autoAttack: true,
      autoExpand: true,
      autoDefend: true,
      autoBuild: true,
      autoNuke: true,
      autoSpawn: true,
      autoEmbargo: true,
      autoDonate: false,
      autoEmoji: false,
      autoBoat: true,
      autoWarship: true,

      buildCities: true,
      buildSams: false,
      buildSilos: true,
      buildPorts: false,
      buildDefensePosts: true,
      allowAtomBombs: false,
      allowHydrogenBombs: true,

      maxCities: 3,
      maxSams: 0,
      samRatio: 0.35,
      maxSilos: 1,
      maxPorts: 1,
      maxDefensePosts: 4,

      triggerRatio: 0.50,
      reserveRatio: 0.42,
      expandRatio: 0.42,
      botParallelism: 60,
      tickIntervalMs: 650,
      hotkey: "b"
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        Object.assign(botCfg, JSON.parse(stored));
      }
    } catch (e) {}

    botCfg.autoEmoji = botCfg.autoEmoji === true;
    if (api && api.cfg && botCfg.autoEmoji !== true) {
      api.cfg.autoEmojiReactEnabled = false;
    }

    function saveBotCfg() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(botCfg));
      } catch (e) {}
      if (api && api.cfg && botCfg.autoEmoji !== true) {
        api.cfg.autoEmojiReactEnabled = false;
      }
    }

    function syncAllUIControls() {
      const is1v1 = botCfg.mode === "1v1" || botCfg.mode === "v1v1" || botCfg.activePreset === "v1v1" || botCfg.activePreset === "1v1";
      const modeSelect = document.getElementById("blon-ext-mode-select");
      if (modeSelect) modeSelect.value = is1v1 ? "v1v1" : "solo";

      const setCb = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = Boolean(val);
      };

      const setSlider = (sliderId, labelId, val, suffix = "") => {
        const sl = document.getElementById(sliderId);
        const lb = document.getElementById(labelId);
        if (sl) sl.value = val;
        if (lb) lb.textContent = `${val}${suffix}`;
      };

      setCb("blon-ext-feat-attack", botCfg.autoAttack);
      setCb("blon-ext-feat-expand", botCfg.autoExpand);
      setCb("blon-ext-feat-defend", botCfg.autoDefend);
      setCb("blon-ext-feat-spawn", botCfg.autoSpawn);
      setCb("blon-ext-feat-embargo", botCfg.autoEmbargo);
      setCb("blon-ext-feat-boat", botCfg.autoBoat);
      setCb("blon-ext-feat-emoji", botCfg.autoEmoji);
      setCb("blon-ext-build-master", botCfg.autoBuild);
      setCb("blon-ext-build-cities", botCfg.buildCities);
      setCb("blon-ext-build-sams", botCfg.buildSams);
      setCb("blon-ext-build-silos", botCfg.buildSilos);
      setCb("blon-ext-build-ports", botCfg.buildPorts);
      setCb("blon-ext-build-defposts", botCfg.buildDefensePosts);
      setCb("blon-ext-feat-nuke", botCfg.autoNuke);
      setCb("blon-ext-nuke-atom", botCfg.allowAtomBombs);
      setCb("blon-ext-nuke-hbomb", botCfg.allowHydrogenBombs);

      setSlider("blon-ext-max-cities-slider", "blon-ext-max-cities-val", botCfg.maxCities ?? 3);
      setSlider("blon-ext-max-defposts-slider", "blon-ext-max-defposts-val", botCfg.maxDefensePosts ?? 4);
      setSlider("blon-ext-max-silos-slider", "blon-ext-max-silos-val", botCfg.maxSilos ?? 1);
      setSlider("blon-ext-max-sams-slider", "blon-ext-max-sams-val", botCfg.maxSams ?? 0);
      setSlider("blon-ext-max-ports-slider", "blon-ext-max-ports-val", botCfg.maxPorts ?? 0);

      setSlider("blon-ext-trigger-slider", "blon-ext-trigger-value", Math.round((botCfg.triggerRatio ?? 0.50) * 100), "%");
      setSlider("blon-ext-reserve-slider", "blon-ext-reserve-value", Math.round((botCfg.reserveRatio ?? 0.30) * 100), "%");
      setSlider("blon-ext-expand-slider", "blon-ext-expand-value", Math.round((botCfg.expandRatio ?? 0.10) * 100), "%");
      setSlider("blon-ext-parallel-slider", "blon-ext-parallel-value", botCfg.botParallelism ?? 60);
      setSlider("blon-ext-interval-slider", "blon-ext-interval-value", botCfg.tickIntervalMs ?? 650, "ms");
    }

    function applyPreset(presetKey) {
      const p = PRESETS[presetKey];
      if (!p) return;
      botCfg.activePreset = presetKey;
      botCfg.mode = p.mode;
      Object.assign(botCfg, p);
      saveBotCfg();
      syncAllUIControls();
    }

    const EMOJI_IDX = {
      GRIN: 0, SMILE: 1, LOVE: 2, ANGEL: 3, COOL: 4,
      DISAPPOINTED: 5, PLEADING: 6, CRYING: 7, SHOCKED: 8, ANGRY: 9,
      DEVIL: 10, CLOWN: 11, YAWN: 12, SALUTE: 13, MIDDLE_FINGER: 14,
      WAVE: 15, CLAP: 16, HAND: 17, PRAY: 18, FLEX: 19,
      THUMBS_UP: 20, THUMBS_DOWN: 21, PALM_UP: 22, PINCHED: 23, FACEPALM: 24,
      HANDSHAKE: 25, SOS: 26, DOVE: 27, WHITE_FLAG: 28, HOURGLASS: 29,
      FIRE: 30, BOOM: 31, SKULL: 32, RADIATION: 33, WARNING: 34,
      CROWN: 38, FIRST: 39, HEART: 48, BROKEN_HEART: 49,
      GOLD: 50, ANCHOR: 51, SAILBOAT: 52, HOUSE: 53, SHIELD: 54,
      FACTORY: 55, TRAIN: 56, QUESTION: 57, CHICKEN: 58, RAT: 59
    };

    function forEachNeighbor(game, tile, fn) {
      if (typeof game.forEachNeighbor === "function") {
        game.forEachNeighbor(tile, fn);
      } else if (typeof game.neighbors === "function") {
        const list = game.neighbors(tile);
        if (list) {
          for (const n of list) fn(n);
        }
      }
    }

    function getMySmallID(myPlayer) {
      return typeof myPlayer.smallID === "function" ? myPlayer.smallID() : null;
    }

    function getBorderTiles(game, myPlayer) {
      try {
        if (typeof myPlayer.borderTiles === "function") {
          const res = myPlayer.borderTiles();
          if (res instanceof Set && res.size > 0) return res;
          if (Array.isArray(res) && res.length > 0) return new Set(res);
          if (res && res.borderTiles) {
            const inner = res.borderTiles;
            if (inner instanceof Set && inner.size > 0) return inner;
            if (Array.isArray(inner) && inner.length > 0) return new Set(inner);
          }
          if (res && typeof res[Symbol.iterator] === "function") {
            const s = new Set(res);
            if (s.size > 0) return s;
          }
        }
      } catch (e) {}

      const myID = getMySmallID(myPlayer);
      if (!myID || !game) return new Set();
      const set = new Set();
      try {
        if (typeof game.forEachTile === "function") {
          game.forEachTile((tile) => {
            try {
              if (game.ownerID(tile) === myID) {
                let isBorder = false;
                forEachNeighbor(game, tile, (n) => {
                  if (isBorder) return;
                  try {
                    if (!game.isLand(n) || game.ownerID(n) !== myID) {
                      isBorder = true;
                    }
                  } catch (e) {}
                });
                if (isBorder) set.add(tile);
              }
            } catch (e) {}
          });
        }
      } catch (e) {}
      return set;
    }

    function getBorderingPlayerIDs(game, myPlayer) {
      const myID = getMySmallID(myPlayer);
      if (!myID) return new Map();
      const map = new Map();
      const bts = getBorderTiles(game, myPlayer);

      const scanNeighbors = (tile) => {
        forEachNeighbor(game, tile, (n) => {
          try {
            const ownerID = game.ownerID(n);
            if (ownerID && ownerID > 0 && ownerID !== myID && !map.has(ownerID)) {
              const p = typeof game.playerBySmallID === "function" ? game.playerBySmallID(ownerID) : null;
              if (p) map.set(ownerID, p);
            }
          } catch (e) {}
        });
      };

      if (bts.size > 0) {
        for (const tile of bts) scanNeighbors(tile);
      } else if (typeof game.forEachTile === "function") {
        game.forEachTile((tile) => {
          try {
            if (game.ownerID(tile) === myID) scanNeighbors(tile);
          } catch (e) {}
        });
      }
      return map;
    }

    function hasBorderWithTerraNullius(game, myPlayer) {
      const myID = getMySmallID(myPlayer);
      if (!myID || !game) return false;
      const bts = getBorderTiles(game, myPlayer);
      for (const tile of bts) {
        let found = false;
        forEachNeighbor(game, tile, (n) => {
          if (found) return;
          try {
            if (typeof game.isLand === "function" && !game.isLand(n)) return;
            const hasOwner = typeof game.hasOwner === "function" ? game.hasOwner(n) : true;
            const ownerID = typeof game.ownerID === "function" ? game.ownerID(n) : null;
            if (!hasOwner || ownerID === null || ownerID === undefined || ownerID === 0 || ownerID === -1) {
              if (typeof game.hasFallout === "function" && game.hasFallout(n)) return;
              found = true;
            }
          } catch (e) {}
        });
        if (found) return true;
      }
      return false;
    }

    function getMaxTroops(game, player) {
      try {
        const cfg = typeof game.config === "function" ? game.config() : null;
        if (cfg && typeof cfg.maxTroops === "function") return Number(cfg.maxTroops(player)) || 1000;
      } catch (e) {}
      return 1000;
    }

    function playerTroops(p) {
      try {
        const t = typeof p.troops === "function" ? p.troops() : 0;
        return typeof t === "bigint" ? Number(t) : Number(t || 0);
      } catch (e) { return 0; }
    }

    function playerGold(p) {
      try {
        const g = typeof p.gold === "function" ? p.gold() : 0;
        return typeof g === "bigint" ? Number(g) : Number(g || 0);
      } catch (e) { return 0; }
    }

    function playerType(p) {
      try { return typeof p.type === "function" ? p.type() : (p.type || ""); } catch (e) { return ""; }
    }

    function isBot(p) {
      const t = playerType(p);
      return t === "BOT" || t === "NATION" || t === "Bot" || t === 2;
    }

    function isAlive(p) {
      try { return typeof p.isAlive === "function" ? p.isAlive() : true; } catch (e) { return false; }
    }

    function isFriendly(myPlayer, other) {
      if (!myPlayer || !other) return false;
      if (typeof other.isPlayer === "function" && !other.isPlayer()) return true;
      if (typeof api.isFriendlyPlayer === "function") {
        try { return api.isFriendlyPlayer(myPlayer, other); } catch (e) {}
      }
      try {
        const id1 = typeof myPlayer.id === "function" ? myPlayer.id() : myPlayer.id;
        const id2 = typeof other.id === "function" ? other.id() : other.id;
        if (id1 && id1 === id2) return true;
      } catch (e) {}
      return false;
    }

    function sendPacket(intent) {
      if (intent && intent.type === "emoji" && botCfg.autoEmoji !== true) {
        return false;
      }
      if (typeof api.sendPacket === "function") return api.sendPacket(intent);
      if (typeof api.sendIntent === "function") return api.sendIntent(intent);
      return false;
    }

    function getPlayerName(p) {
      if (typeof api.getPlayerName === "function") return api.getPlayerName(p);
      try {
        return typeof p.displayName === "function" ? p.displayName() :
               typeof p.name === "function" ? p.name() : "Unknown";
      } catch (e) { return "Unknown"; }
    }

    function getAllPlayers(game) {
      try {
        if (typeof api.getGamePlayers === "function") return api.getGamePlayers(game) || [];
        if (typeof game.players === "function") return game.players() || [];
      } catch (e) {}
      return [];
    }

    function playerOwnsStructures(p) {
      try {
        const units = typeof p.units === "function" ? p.units() : [];
        return units && units.length > 0;
      } catch (e) { return false; }
    }

    function playerUnits(p) {
      try { return typeof p.units === "function" ? p.units() : []; } catch (e) { return []; }
    }

    function unitType(u) {
      try { return typeof u.type === "function" ? u.type() : u.type; } catch (e) { return ""; }
    }

    function calcTileDist(game, t1, t2) {
      try {
        const w = typeof game.width === "function" ? game.width() : 500;
        const x1 = t1 % w, y1 = Math.floor(t1 / w);
        const x2 = t2 % w, y2 = Math.floor(t2 / w);
        return Math.hypot(x1 - x2, y1 - y2);
      } catch (e) { return 0; }
    }

    function getPlayerCenter(game, player) {
      try {
        const w = typeof game.width === "function" ? game.width() : 500;
        const bts = getBorderTiles(game, player);
        const arr = Array.from(bts);
        if (arr.length === 0) return { x: 0, y: 0 };
        let sx = 0, sy = 0;
        const sample = Math.min(arr.length, 30);
        for (let i = 0; i < sample; i++) {
          const t = arr[Math.floor(i * arr.length / sample)];
          sx += t % w;
          sy += Math.floor(t / w);
        }
        return { x: sx / sample, y: sy / sample };
      } catch (e) {
        return { x: 0, y: 0 };
      }
    }

    function getInteriorTiles(game, myPlayer) {
      const myID = getMySmallID(myPlayer);
      if (!myID || !game) return [];
      const bts = getBorderTiles(game, myPlayer);
      const interiors = [];

      try {
        if (typeof myPlayer.tiles === "function") {
          const all = myPlayer.tiles();
          const list = Array.isArray(all) ? all : (all instanceof Set ? Array.from(all) : []);
          for (const t of list) {
            if (!bts.has(t)) interiors.push(t);
          }
          if (interiors.length > 0) return interiors;
        }

        if (typeof game.forEachTile === "function") {
          game.forEachTile((tile) => {
            try {
              if (game.ownerID(tile) === myID && !bts.has(tile)) {
                interiors.push(tile);
              }
            } catch (e) {}
          });
        }
      } catch (e) {}

      return interiors.length > 0 ? interiors : Array.from(bts);
    }

    function findInteriorTile(game, myPlayer) {
      const ints = getInteriorTiles(game, myPlayer);
      if (ints.length > 0) {
        return ints[Math.floor(Math.random() * ints.length)];
      }
      const bts = Array.from(getBorderTiles(game, myPlayer));
      return bts[Math.floor(bts.length / 2)] || null;
    }

    function findOwnedShoreTile(game, myPlayer) {
      const bts = getBorderTiles(game, myPlayer);
      for (const t of bts) {
        if (typeof game.isShore === "function" && game.isShore(t)) return t;
      }
      return null;
    }

    function findTargetShoreTile(game, target) {
      const bts = getBorderTiles(game, target);
      for (const t of bts) {
        if (typeof game.isShore === "function" && game.isShore(t)) return t;
      }
      const arr = Array.from(bts);
      return arr[0] || null;
    }

    function findTargetCityTile(target) {
      const units = playerUnits(target);
      for (const u of units) {
        const t = unitType(u);
        if (t === "City" || t === "Missile Silo") {
          const tile = typeof u.tile === "function" ? u.tile() : u.tile;
          if (tile != null) return tile;
        }
      }
      return null;
    }

    const OppTracker = {
      samples: [],
      maxSamples: 10,
      lastTroops: 0,
      lastGold: 0,
      lastTiles: 0,
      isPunishWindow: false,
      punishExpiry: 0,
      expansionRate: 0,
      territoryRatio: 0.5,
      oppCentroidHistory: [],
      oppExpansionDir: null,
      update(opponent) {
        if (!opponent) return;
        const troops = playerTroops(opponent);
        const gold = playerGold(opponent);
        const tiles = typeof opponent.numTilesOwned === "function" ? Number(opponent.numTilesOwned()) || 0 : 0;
        const now = Date.now();
        if (this.lastTroops > 0 && troops < this.lastTroops * 0.78 && (this.lastTiles > 0 && tiles < this.lastTiles)) {
          this.isPunishWindow = true;
          this.punishExpiry = now + 1500;
        }
        if (now > this.punishExpiry) this.isPunishWindow = false;
        if (this.samples.length >= 3) {
          const oldest = this.samples[0];
          const dt = Math.max(1, (now - oldest.time) / 1000);
          this.expansionRate = (tiles - oldest.tiles) / dt;
        }
        this.samples.push({ troops, gold, tiles, time: now });
        if (this.samples.length > this.maxSamples) this.samples.shift();
        this.lastTroops = troops;
        this.lastGold = gold;
        this.lastTiles = tiles;
      },
      reset() {
        this.samples = [];
        this.lastTroops = 0;
        this.lastGold = 0;
        this.lastTiles = 0;
        this.isPunishWindow = false;
        this.punishExpiry = 0;
        this.expansionRate = 0;
        this.territoryRatio = 0.5;
        this.oppCentroidHistory = [];
        this.oppExpansionDir = null;
      },
      updateParity(myPlayer, opponent, game) {
        if (!myPlayer || !opponent) return;
        const myTiles = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) || 1 : 1;
        const oppTiles = typeof opponent.numTilesOwned === "function" ? Number(opponent.numTilesOwned()) || 1 : 1;
        this.territoryRatio = myTiles / Math.max(1, myTiles + oppTiles);
        const w = typeof game.width === "function" ? game.width() : 500;
        const oppCenter = getPlayerCenter(game, opponent);
        if (oppCenter) {
          this.oppCentroidHistory.push({ x: oppCenter.x, y: oppCenter.y, time: Date.now() });
          if (this.oppCentroidHistory.length > 5) this.oppCentroidHistory.shift();
          if (this.oppCentroidHistory.length >= 2) {
            const oldest = this.oppCentroidHistory[0];
            const newest = this.oppCentroidHistory[this.oppCentroidHistory.length - 1];
            const dx = newest.x - oldest.x;
            const dy = newest.y - oldest.y;
            const mag = Math.hypot(dx, dy);
            this.oppExpansionDir = mag > 2 ? { x: dx / mag, y: dy / mag } : null;
          }
        }
      }
    };

    function analyzeFrontline(game, myPlayer, opponent) {
      if (!opponent) return null;
      const myID = getMySmallID(myPlayer);
      const oppID = getMySmallID(opponent);
      if (!myID || !oppID) return null;
      const myBts = getBorderTiles(game, myPlayer);
      const w = typeof game.width === "function" ? game.width() : 500;
      const sharedBorder = [];
      const weakPoints = [];
      for (const tile of myBts) {
        let adj = false;
        forEachNeighbor(game, tile, (n) => {
          try { if (game.ownerID(n) === oppID) adj = true; } catch (e) {}
        });
        if (adj) sharedBorder.push(tile);
      }
      if (sharedBorder.length === 0) return { sharedBorder: [], centroid: null, weakPoints: [], width: 0, isBordering: false };
      let cx = 0, cy = 0;
      for (const t of sharedBorder) { cx += t % w; cy += Math.floor(t / w); }
      cx /= sharedBorder.length;
      cy /= sharedBorder.length;
      const step = Math.max(1, Math.floor(sharedBorder.length / 15));
      for (let i = 0; i < sharedBorder.length; i += step) {
        const tile = sharedBorder[i];
        const tx = tile % w, ty = Math.floor(tile / w);
        let oppNear = 0;
        for (let dx = -4; dx <= 4; dx++) {
          for (let dy = -4; dy <= 4; dy++) {
            try {
              const ref = typeof game.ref === "function" ? game.ref(tx + dx, ty + dy) : null;
              if (ref != null && game.ownerID(ref) === oppID) oppNear++;
            } catch (e) {}
          }
        }
        if (oppNear < 25) weakPoints.push(tile);
      }
      return { sharedBorder, centroid: { x: cx, y: cy }, weakPoints, width: sharedBorder.length, isBordering: true };
    }

    function frontlineInDPRange(game, myPlayer, opponent) {
      if (!opponent) return false;
      const oppUnits = playerUnits(opponent);
      const oppDPs = oppUnits.filter(u => unitType(u) === "Defense Post");
      if (oppDPs.length === 0) return false;
      const w = typeof game.width === "function" ? game.width() : 500;
      const myBts = getBorderTiles(game, myPlayer);
      const oppID = getMySmallID(opponent);
      const sharedBorder = [];
      for (const tile of myBts) {
        let adj = false;
        forEachNeighbor(game, tile, (n) => {
          try { if (game.ownerID(n) === oppID) adj = true; } catch(e) {}
        });
        if (adj) sharedBorder.push(tile);
      }
      if (sharedBorder.length === 0) return false;
      const sampleStep = Math.max(1, Math.floor(sharedBorder.length / 25));
      for (let i = 0; i < sharedBorder.length; i += sampleStep) {
        const tile = sharedBorder[i];
        const tx = tile % w, ty = Math.floor(tile / w);
        for (const dp of oppDPs) {
          const dpTile = typeof dp.tile === "function" ? dp.tile() : dp.tile;
          if (dpTile == null) continue;
          const dpx = dpTile % w, dpy = Math.floor(dpTile / w);
          const dist = Math.hypot(tx - dpx, ty - dpy);
          if (dist <= 35) return true;
        }
      }
      return false;
    }

    function findCutTarget(game, opponent) {
      if (!opponent) return null;
      const oppID = getMySmallID(opponent);
      if (!oppID) return null;
      const w = typeof game.width === "function" ? game.width() : 500;
      const oppBts = Array.from(getBorderTiles(game, opponent));
      if (oppBts.length < 25) return null;
      let bestTile = null, bestScore = Infinity;
      const stp = Math.max(1, Math.floor(oppBts.length / 30));
      for (let i = 0; i < oppBts.length; i += stp) {
        const tile = oppBts[i];
        const tx = tile % w, ty = Math.floor(tile / w);
        let hCount = 0, vCount = 0, d1Count = 0, d2Count = 0;
        for (let d = -20; d <= 20; d++) {
          try {
            const hr = typeof game.ref === "function" ? game.ref(tx + d, ty) : null;
            if (hr != null && game.ownerID(hr) === oppID) hCount++;
            const vr = typeof game.ref === "function" ? game.ref(tx, ty + d) : null;
            if (vr != null && game.ownerID(vr) === oppID) vCount++;
            const dr1 = typeof game.ref === "function" ? game.ref(tx + d, ty + d) : null;
            if (dr1 != null && game.ownerID(dr1) === oppID) d1Count++;
            const dr2 = typeof game.ref === "function" ? game.ref(tx + d, ty - d) : null;
            if (dr2 != null && game.ownerID(dr2) === oppID) d2Count++;
          } catch (e) {}
        }
        const narrowness = Math.min(hCount, vCount, d1Count, d2Count);
        if (narrowness < bestScore && narrowness >= 1 && narrowness <= 16) {
          bestScore = narrowness;
          bestTile = tile;
        }
      }
      return bestTile;
    }

    function findEncirclementTarget(game, myPlayer, opponent) {
      if (!opponent) return null;
      const oppID = getMySmallID(opponent);
      const myID = getMySmallID(myPlayer);
      if (!oppID || !myID) return null;
      const w = typeof game.width === "function" ? game.width() : 500;
      const h = typeof game.height === "function" ? game.height() : 500;
      const oppBts = Array.from(getBorderTiles(game, opponent));
      if (oppBts.length < 30) return null;
      
      const attackSurface = [];
      const myBts = getBorderTiles(game, myPlayer);
      for (const tile of myBts) {
        let adjOpp = false;
        forEachNeighbor(game, tile, (n) => {
          try { if (game.ownerID(n) === oppID) adjOpp = true; } catch(e) {}
        });
        if (adjOpp) attackSurface.push(tile);
      }
      if (attackSurface.length < 5) return null;
      
      let bestResult = null;
      let bestScore = 0;
      const step = Math.max(1, Math.floor(attackSurface.length / 20));
      
      for (let i = 0; i < attackSurface.length; i += step) {
        const surfTile = attackSurface[i];
        const sx = surfTile % w, sy = Math.floor(surfTile / w);
        
        let oppTile = null;
        forEachNeighbor(game, surfTile, (n) => {
          try { if (game.ownerID(n) === oppID && oppTile === null) oppTile = n; } catch(e) {}
        });
        if (oppTile === null) continue;
        
        const ox = oppTile % w, oy = Math.floor(oppTile / w);
        let hCount = 0, vCount = 0, d1Count = 0, d2Count = 0;
        for (let d = -24; d <= 24; d++) {
          try {
            const hr = typeof game.ref === "function" ? game.ref(ox + d, oy) : null;
            if (hr != null && game.ownerID(hr) === oppID) hCount++;
            const vr = typeof game.ref === "function" ? game.ref(ox, oy + d) : null;
            if (vr != null && game.ownerID(vr) === oppID) vCount++;
            const dr1 = typeof game.ref === "function" ? game.ref(ox + d, oy + d) : null;
            if (dr1 != null && game.ownerID(dr1) === oppID) d1Count++;
            const dr2 = typeof game.ref === "function" ? game.ref(ox + d, oy - d) : null;
            if (dr2 != null && game.ownerID(dr2) === oppID) d2Count++;
          } catch(e) {}
        }
        const narrowness = Math.min(hCount, vCount, d1Count, d2Count);
        if (narrowness < 1 || narrowness > 18) continue;
        
        const isHorizontalCut = hCount < vCount;
        const visited = new Set();
        const queue = [oppTile];
        visited.add(oppTile);
        let pocketCount = 0;
        const maxBFS = 500;
        
        while (queue.length > 0 && pocketCount < maxBFS) {
          const current = queue.shift();
          pocketCount++;
          const cx = current % w, cy = Math.floor(current / w);
          const dirs = isHorizontalCut 
            ? [[1,0],[-1,0],[0,1],[0,-1]]
            : [[0,1],[0,-1],[1,0],[-1,0]];
          for (const [ddx, ddy] of dirs) {
            try {
              const nr = typeof game.ref === "function" ? game.ref(cx + ddx, cy + ddy) : null;
              if (nr != null && !visited.has(nr) && game.ownerID(nr) === oppID) {
                visited.add(nr);
                queue.push(nr);
              }
            } catch(e) {}
          }
        }
        
        const score = pocketCount / Math.max(1, narrowness);
        if (score > bestScore && pocketCount > 15) {
          bestScore = score;
          bestResult = { cutTile: surfTile, oppTile, pocketSize: pocketCount, narrowness };
        }
      }
      
      return bestResult;
    }

    function findBotEncirclementPlan(game, myPlayer, bot) {
      if (!bot || !myPlayer) return null;
      const botID = getMySmallID(bot);
      const myID = getMySmallID(myPlayer);
      if (!botID || !myID) return null;
      const w = typeof game.width === "function" ? game.width() : 500;
      const botBts = Array.from(getBorderTiles(game, bot));
      if (botBts.length === 0) return null;

      let myBorderCount = 0;
      let totalBorderChecks = 0;
      const unownedPerimeter = new Set();
      let bestShoreBehind = null;
      let maxDistFromMe = 0;
      const myCenter = getPlayerCenter(game, myPlayer);

      for (const bt of botBts) {
        forEachNeighbor(game, bt, (n) => {
          totalBorderChecks++;
          try {
            const owner = game.ownerID(n);
            if (owner === myID) {
              myBorderCount++;
            } else if (owner === 0 || owner === null || owner === undefined) {
              unownedPerimeter.add(n);
              if (game.isShore(n) && myCenter) {
                const nx = n % w, ny = Math.floor(n / w);
                const d = Math.hypot(nx - myCenter.x, ny - myCenter.y);
                if (d > maxDistFromMe) {
                  maxDistFromMe = d;
                  bestShoreBehind = n;
                }
              }
            }
          } catch (e) {}
        });
      }

      const walledRatio = myBorderCount / Math.max(1, totalBorderChecks);
      return {
        bot,
        botID,
        botTiles: typeof bot.numTilesOwned === "function" ? Number(bot.numTilesOwned()) || 1 : 1,
        walledRatio,
        unownedCount: unownedPerimeter.size,
        unownedPerimeter: Array.from(unownedPerimeter),
        bestShoreBehind
      };
    }

    function findOurVulnerableNecks(game, myPlayer, opponent) {
      if (!myPlayer) return null;
      const myID = getMySmallID(myPlayer);
      const oppID = opponent ? getMySmallID(opponent) : null;
      if (!myID) return null;
      const w = typeof game.width === "function" ? game.width() : 500;
      const myBts = Array.from(getBorderTiles(game, myPlayer));
      if (myBts.length < 15) return null;

      const step = Math.max(1, Math.floor(myBts.length / 30));
      for (let i = 0; i < myBts.length; i += step) {
        const tile = myBts[i];
        const tx = tile % w, ty = Math.floor(tile / w);

        let oppNear = false;
        if (oppID) {
          for (let dx = -35; dx <= 35; dx += 4) {
            for (let dy = -35; dy <= 35; dy += 4) {
              try {
                const ref = typeof game.ref === "function" ? game.ref(tx + dx, ty + dy) : null;
                if (ref != null && game.ownerID(ref) === oppID) {
                  oppNear = true;
                  break;
                }
              } catch (e) {}
            }
            if (oppNear) break;
          }
        }

        if (!oppNear) continue;

        let hCount = 0, vCount = 0, d1Count = 0, d2Count = 0;
        for (let d = -20; d <= 20; d++) {
          try {
            const hr = typeof game.ref === "function" ? game.ref(tx + d, ty) : null;
            if (hr != null && game.ownerID(hr) === myID) hCount++;
            const vr = typeof game.ref === "function" ? game.ref(tx, ty + d) : null;
            if (vr != null && game.ownerID(vr) === myID) vCount++;
            const dr1 = typeof game.ref === "function" ? game.ref(tx + d, ty + d) : null;
            if (dr1 != null && game.ownerID(dr1) === myID) d1Count++;
            const dr2 = typeof game.ref === "function" ? game.ref(tx + d, ty - d) : null;
            if (dr2 != null && game.ownerID(dr2) === myID) d2Count++;
          } catch (e) {}
        }
        const thickness = Math.min(hCount, vCount, d1Count, d2Count);
        if (thickness >= 1 && thickness <= 16) {
          let unownedAdj = null;
          forEachNeighbor(game, tile, (n) => {
            try {
              const o = game.ownerID(n);
              if (o === 0 || o === null || o === undefined) {
                unownedAdj = n;
              }
            } catch (e) {}
          });
          if (unownedAdj != null) {
            return { neckTile: tile, unownedAdj, thickness };
          }
        }
      }
      return null;
    }

    function getGamePhase(game) {
      try {
        const ticks = typeof game.ticks === "function" ? game.ticks() : 0;
        if (ticks < 300) return "early";
        if (ticks < 800) return "mid";
        return "late";
      } catch (e) { return "mid"; }
    }

    function getDynamicReserve(game, myPlayer, opponent, phase) {
      if (phase === "early") return 0.35;
      if (opponent) {
        const oppUnits = playerUnits(opponent);
        if (oppUnits.some(u => unitType(u) === "Missile Silo")) return 0.40;
        const oppTr = playerTroops(opponent);
        const myTr = playerTroops(myPlayer);
        if (oppTr < myTr * 0.25) return 0.10;
      }
      return 0.42;
    }

    function find1v1CityTile(game, myPlayer, existingCities = [], opponent = null, cityIndex = 0) {
      try {
        const interiorList = getInteriorTiles(game, myPlayer);
        if (interiorList.length === 0) return null;
        const w = typeof game.width === "function" ? game.width() : 500;
        const oppBts = opponent ? Array.from(getBorderTiles(game, opponent)) : [];
        const oppCenter = opponent ? getPlayerCenter(game, opponent) : null;
        const myCenter = getPlayerCenter(game, myPlayer);
        const existingCityTiles = existingCities.map(c => {
          const t = typeof c.tile === "function" ? c.tile() : c.tile;
          return typeof t === "number" ? t : null;
        }).filter(t => t !== null);
        let bestTile = null, bestScore = -Infinity;
        const sampleSize = Math.min(interiorList.length, 150);
        for (let i = 0; i < sampleSize; i++) {
          const tile = interiorList[Math.floor(Math.random() * interiorList.length)];
          const tx = tile % w, ty = Math.floor(tile / w);
          let minDistToCity = Infinity;
          for (const ct of existingCityTiles) {
            const d = calcTileDist(game, tile, ct);
            if (d < minDistToCity) minDistToCity = d;
          }
          if (existingCityTiles.length > 0 && minDistToCity < 12) continue;
          let score = 0;
          if (cityIndex === 0) {
            const distToCenter = Math.hypot(tx - myCenter.x, ty - myCenter.y);
            score = 100 - distToCenter * 0.5;
          } else if (cityIndex === 1) {
            if (oppCenter) {
              const distToOpp = Math.hypot(tx - oppCenter.x, ty - oppCenter.y);
              score = 80 - distToOpp * 0.3;
            }
            score += Math.min(minDistToCity, 30) * 0.8;
          } else {
            if (oppCenter) {
              const distFromOpp = Math.hypot(tx - oppCenter.x, ty - oppCenter.y);
              score = distFromOpp * 1.2;
            }
            let minOppBorderDist = Infinity;
            if (oppBts.length > 0) {
              const sample = Math.min(oppBts.length, 20);
              for (let j = 0; j < sample; j++) {
                const d = calcTileDist(game, tile, oppBts[Math.floor(j * oppBts.length / sample)]);
                if (d < minOppBorderDist) minOppBorderDist = d;
              }
              if (minOppBorderDist < 15) continue;
              score += minOppBorderDist * 0.6;
            }
          }
          if (score > bestScore) { bestScore = score; bestTile = tile; }
        }
        return bestTile || interiorList[0] || null;
      } catch (e) { return null; }
    }

    function find1v1DefensePostTile(game, myPlayer, opponent, existingDPs = [], frontline = null) {
      try {
        if (!opponent) return null;
        const candidates = frontline && frontline.sharedBorder.length > 0
          ? frontline.sharedBorder
          : Array.from(getBorderTiles(game, myPlayer));
        if (candidates.length === 0) return null;
        const existingDPTiles = existingDPs.map(d => {
          const t = typeof d.tile === "function" ? d.tile() : d.tile;
          return typeof t === "number" ? t : null;
        }).filter(t => t !== null);
        const interiorTiles = getInteriorTiles(game, myPlayer);
        const candidatePool = interiorTiles.length > 10 ? interiorTiles : candidates;
        let bestTile = null, bestScore = -Infinity;
        const oppBts = Array.from(getBorderTiles(game, opponent));
        const sampleSize = Math.min(candidatePool.length, 100);
        for (let i = 0; i < sampleSize; i++) {
          const tile = candidatePool[Math.floor(Math.random() * candidatePool.length)];
          let minDPDist = Infinity;
          for (const dp of existingDPTiles) {
            const d = calcTileDist(game, tile, dp);
            if (d < minDPDist) minDPDist = d;
          }
          if (existingDPTiles.length > 0 && minDPDist < 18) continue;
          let minOppDist = Infinity;
          for (let j = 0; j < Math.min(oppBts.length, 25); j++) {
            const d = calcTileDist(game, tile, oppBts[Math.floor(j * oppBts.length / 25)]);
            if (d < minOppDist) minOppDist = d;
          }
          if (minOppDist > 25 || minOppDist < 3) continue;
          const optScore = 20 - Math.abs(minOppDist - 8);
          const spread = existingDPTiles.length > 0 ? Math.min(minDPDist, 40) : 25;
          const score = optScore * 2 + spread;
          if (score > bestScore) { bestScore = score; bestTile = tile; }
        }
        return bestTile;
      } catch (e) { return null; }
    }

    function find1v1SiloTile(game, myPlayer, opponent) {
      try {
        const interiorList = getInteriorTiles(game, myPlayer);
        if (interiorList.length === 0) return null;
        const oppBts = opponent ? Array.from(getBorderTiles(game, opponent)) : [];
        let bestTile = null, maxSafety = -Infinity;
        const sampleSize = Math.min(interiorList.length, 80);
        for (let i = 0; i < sampleSize; i++) {
          const tile = interiorList[Math.floor(Math.random() * interiorList.length)];
          let minDist = Infinity;
          if (oppBts.length > 0) {
            for (let j = 0; j < Math.min(oppBts.length, 20); j++) {
              const d = calcTileDist(game, tile, oppBts[Math.floor(j * oppBts.length / 20)]);
              if (d < minDist) minDist = d;
            }
          }
          if (minDist > maxSafety) { maxSafety = minDist; bestTile = tile; }
        }
        return bestTile || interiorList[0] || null;
      } catch (e) { return null; }
    }

    function find1v1FlankShoreTile(game, myPlayer, opponent) {
      try {
        const oppBts = Array.from(getBorderTiles(game, opponent));
        if (oppBts.length === 0) return null;
        const oppUnits = playerUnits(opponent);
        const dpTiles = oppUnits.filter(u => unitType(u) === "Defense Post").map(u => {
          const t = typeof u.tile === "function" ? u.tile() : u.tile;
          return typeof t === "number" ? t : null;
        }).filter(t => t !== null);
        const cityTiles = oppUnits.filter(u => unitType(u) === "City").map(u => {
          const t = typeof u.tile === "function" ? u.tile() : u.tile;
          return typeof t === "number" ? t : null;
        }).filter(t => t !== null);
        if (cityTiles.length > 0) {
          const myCenter = getPlayerCenter(game, myPlayer);
          const w = typeof game.width === "function" ? game.width() : 500;
          const scored = cityTiles.map(ct => ({
            tile: ct,
            dist: Math.hypot((ct % w) - myCenter.x, Math.floor(ct / w) - myCenter.y)
          }));
          scored.sort((a, b) => b.dist - a.dist);
          for (const { tile: ct } of scored) {
            const cx = ct % w, cy = Math.floor(ct / w);
            for (let r = 1; r <= 15; r++) {
              for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                  if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                  try {
                    const ref = typeof game.ref === "function" ? game.ref(cx + dx, cy + dy) : null;
                    if (ref != null && typeof game.isShore === "function" && game.isShore(ref)) {
                      const oid = typeof game.ownerID === "function" ? game.ownerID(ref) : null;
                      const oppSID = getMySmallID(opponent);
                      if (oid === oppSID || (typeof game.hasOwner === "function" && !game.hasOwner(ref))) return ref;
                    }
                  } catch (e) {}
                }
              }
            }
          }
        }
        let bestTile = null, maxDistToDP = -Infinity;
        for (const tile of oppBts) {
          if (typeof game.isShore === "function" && !game.isShore(tile)) continue;
          let minDist = dpTiles.length === 0 ? 0 : Infinity;
          for (const dp of dpTiles) {
            const d = calcTileDist(game, tile, dp);
            if (d < minDist) minDist = d;
          }
          if (minDist > maxDistToDP) { maxDistToDP = minDist; bestTile = tile; }
        }
        return bestTile || findTargetShoreTile(game, opponent);
      } catch (e) { return null; }
    }

    function findBestNukeTarget(game, opponent, prioritizeDPs) {
      if (!opponent) return null;
      const units = playerUnits(opponent);
      const priorities = prioritizeDPs
        ? [
            { type: "Defense Post", weight: 100 },
            { type: "City", weight: 90 },
            { type: "Missile Silo", weight: 60 }
          ]
        : [
            { type: "City", weight: 100 },
            { type: "Missile Silo", weight: 90 },
            { type: "Defense Post", weight: 60 }
          ];
      let bestTile = null, bestWeight = -1;
      for (const prio of priorities) {
        for (const u of units) {
          if (unitType(u) === prio.type) {
            const tile = typeof u.tile === "function" ? u.tile() : u.tile;
            if (tile != null && prio.weight > bestWeight) {
              bestWeight = prio.weight;
              bestTile = tile;
            }
          }
        }
        if (bestTile != null) break;
      }
      return bestTile || findTargetShoreTile(game, opponent);
    }

    function getEffectiveReserveRatio(game, myPlayer, baseReserveRatio) {
      if (botCfg.mode === "1v1" || botCfg.mode === "v1v1" || botCfg.activePreset === "v1v1") {
        return baseReserveRatio ?? botCfg.reserveRatio ?? 0.42;
      }
      let r = baseReserveRatio ?? botCfg.reserveRatio ?? 0.25;
      try {
        const totalLand = (typeof game.numLandTiles === "function" ? game.numLandTiles() : null) || 5000;
        const owned = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) : 10;
        const share = owned / Math.max(1, totalLand);
        r = Math.max(r, Math.min(0.45, share * 1.0));
      } catch (e) {}
      return r;
    }

    function calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio, isKillShot) {
      if (isKillShot) {
        const reserve = maxTroops * 0.10;
        return Math.floor(Math.max(0, myTroops - reserve - (botAttackTroopsSent || 0)));
      }
      const effReserve = getEffectiveReserveRatio(game, myPlayer, reserveRatio);
      const reserve = maxTroops * effReserve;
      const available = Math.max(0, myTroops - reserve - (botAttackTroopsSent || 0));
      if (available <= 0) return 0;
      const targetTr = playerTroops(target);
      const tgt_is_bot = isBot(target) && !isBot(myPlayer);
      let troops;
      if (tgt_is_bot) {
        const targetTiles = typeof target.numTilesOwned === "function" ? Number(target.numTilesOwned()) || 1 : 1;
        const needed = Math.ceil(targetTr * 1.25 + targetTiles * 1.2 + 50);
        troops = Math.min(available, needed);
      } else {
        let needed = Math.max(Math.ceil(targetTr * 1.67), Math.floor(maxTroops * 0.08));
        troops = Math.min(available, needed);
      }
      const maxSendCap = Math.max(2000, Math.floor(myTroops * 0.60));
      troops = Math.min(troops, maxSendCap);
      return Math.floor(Math.max(0, troops));
    }

    function sendLandAttack(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio, isKillShot) {
      const troops = calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio, isKillShot);
      if (troops < 1) return false;
      const id = typeof target.id === "function" ? target.id() : (target.id || null);
      return sendPacket({ type: "attack", targetID: id ? String(id) : null, troops });
    }


    const Engine = {
      running: botCfg.enabled,
      timer: null,
      spawnSent: false,
      lastSpawnTile: null,
      lastSpawnPickTime: 0,
      behaviorsInitialized: false,
      lastNukeAttemptTime: 0,
      lastStructureAttemptTime: 0,
      lastEmojiSentTime: new Map(),
      lastGlobalEmojiTime: 0,
      lastDefensePostAttemptTime: 0,
      lastDonateAttemptTime: 0,
      lastExpandMs: 0,
      lastAttackMs: 0,
      lastBoatFlankTime: 0,
      lastBoatDefenseTime: 0,
      lastCutAttackTime: 0,
      activeProbeBoat: null,
      lastProbeBoatTime: 0,
      justLandedBeachhead: false,
      lastLandingAssaultTime: 0,
      pendingCutStrategy: null,
      botAttackTroopsSent: 0,
      targetDetail: "None",
      opponentName: "None",
      oppTroopCap: 0,
      myTroopCap: 0,
      stats: {
        attacksSent: 0,
        troopsSentTotal: 0,
        structuresBuilt: 0,
        nukesLaunched: 0,
        expandsDone: 0,
        boatsSent: 0,
        boatDefenses: 0
      },

      start() {
        if (this.running) return;
        this.running = true;
        botCfg.enabled = true;
        saveBotCfg();
        this.scheduleNextTick();
        updateUI();
      },

      stop() {
        this.running = false;
        if (this.timer) { clearTimeout(this.timer); this.timer = null; }
        botCfg.enabled = false;
        saveBotCfg();
        this.targetDetail = "None";
        this.activeProbeBoat = null;
        this.justLandedBeachhead = false;
        updateUI();
      },

      toggle() { if (this.running) this.stop(); else this.start(); },

      scheduleNextTick() {
        if (!this.running) return;
        if (this.timer) clearTimeout(this.timer);
        const interval = Math.max(200, Math.min(3000, botCfg.tickIntervalMs || 650));
        this.timer = setTimeout(() => {
          try { this.tick(); } catch (e) { console.warn("[ImpossibleBot] Tick error:", e); }
          if (this.running) this.scheduleNextTick();
        }, interval);
      },

      tick() {
        if (!this.running) return;
        const state = api.getGameState();
        if (!state || !state.game) {
          updateUI();
          return;
        }

        const game = state.game;
        const inSpawn = typeof game.inSpawnPhase === "function" && game.inSpawnPhase();

        if (!inSpawn && this.spawnSent) {
          this.spawnSent = false;
          this.lastSpawnTile = null;
        }

        if (inSpawn) {
          if (botCfg.autoSpawn) {
            this.handleAutoSpawn(game);
          }
          updateUI();
          return;
        }

        const myPlayer = state.myPlayer;
        if (!myPlayer || !isAlive(myPlayer)) {
          updateUI();
          return;
        }

        if (!this.behaviorsInitialized) {
          this.behaviorsInitialized = true;
          if (botCfg.autoExpand) {
            const maxTr = getMaxTroops(game, myPlayer);
            const burstTroops = Math.floor(Math.max(0, playerTroops(myPlayer) - maxTr * 0.35));
            if (burstTroops >= 1) {
              if (sendPacket({ type: "attack", targetID: null, troops: burstTroops })) {
                this.stats.expandsDone++;
                this.lastExpandMs = Date.now();
              }
            }
          }
          updateUI();
          return;
        }

        this.botAttackTroopsSent = 0;

        if (botCfg.autoEmbargo) this.handleAutoEmbargo(game, myPlayer);
        if (botCfg.autoDonate && botCfg.mode !== "1v1") this.handleAutoDonate(game, myPlayer);
        if (botCfg.autoEmoji === true) this.handleEmojis(game, myPlayer);

        if (botCfg.mode === "1v1") {
          this.tick1v1(game, myPlayer);
        } else {
          this.tickSolo(game, myPlayer);
        }

        updateUI();
      },

      tickSolo(game, myPlayer) {
        if (botCfg.autoDefend && botCfg.buildDefensePosts) this.handleDefensePost(game, myPlayer);
        if (botCfg.autoBuild) this.handleStructures(game, myPlayer);
        if (botCfg.autoNuke) this.handleNukes(game, myPlayer);
        if (botCfg.autoAttack || botCfg.autoExpand) this.handleAttacks(game, myPlayer);
      },

      tick1v1(game, myPlayer) {
        const opponent = this.get1v1Opponent(game, myPlayer);
        this.opponentName = opponent ? getPlayerName(opponent) : "None";
        this.oppTroopCap = opponent ? getMaxTroops(game, opponent) : 0;
        this.myTroopCap = getMaxTroops(game, myPlayer);

        if (opponent) {
          OppTracker.update(opponent);
          OppTracker.updateParity(myPlayer, opponent, game);
        }

        const phase = getGamePhase(game);

        if (botCfg.autoDefend) {
          this.handle1v1BoatDefense(game, myPlayer, opponent);
        }

        if (botCfg.autoBuild || botCfg.autoDefend) {
          this.handle1v1Structures(game, myPlayer, opponent, phase);
        }

        if (botCfg.autoNuke) {
          this.handle1v1Nukes(game, myPlayer, opponent);
        }

        if (botCfg.autoAttack || botCfg.autoExpand) {
          this.handle1v1Attacks(game, myPlayer, opponent, phase);
        }
      },

      get1v1Opponent(game, myPlayer) {
        const all = getAllPlayers(game);
        const myID = getMySmallID(myPlayer);
        const humanOpponents = all.filter(p => {
          if (!p || !isAlive(p)) return false;
          if (getMySmallID(p) === myID || isFriendly(myPlayer, p)) return false;
          const pType = typeof p.type === "function" ? p.type() : (p.type || "");
          return pType !== "BOT" && pType !== "NATION" && !isBot(p);
        });

        if (humanOpponents.length > 0) {
          humanOpponents.sort((a, b) => playerTroops(b) - playerTroops(a));
          return humanOpponents[0];
        }

        const enemies = all.filter(p => {
          if (!p || !isAlive(p)) return false;
          if (getMySmallID(p) === myID || isFriendly(myPlayer, p)) return false;
          return true;
        });
        enemies.sort((a, b) => playerTroops(b) - playerTroops(a));
        return enemies[0] || null;
      },

      handleAutoSpawn(game) {
        const now = Date.now();
        const spawnPickInterval = 5000;
        if (this.spawnSent && now - this.lastSpawnPickTime < spawnPickInterval) return;

        this.lastSpawnPickTime = now;
        const tile = this.pickSpawnTile(game);
        if (tile == null) return;
        if (tile === this.lastSpawnTile) return;

        const ok = sendPacket({ type: "spawn", tile });
        if (ok) {
          this.spawnSent = true;
          this.lastSpawnTile = tile;
        }
      },

      pickSpawnTile(game) {
        const w = typeof game.width === "function" ? game.width() : 500;
        const h = typeof game.height === "function" ? game.height() : 500;
        const cx = w / 2, cy = h / 2;
        let bestTile = null;
        let bestScore = -Infinity;

        for (let i = 0; i < 200; i++) {
          const rx = Math.floor(Math.random() * w);
          const ry = Math.floor(Math.random() * h);
          if (typeof game.isValidCoord === "function" && !game.isValidCoord(rx, ry)) continue;
          const ref = typeof game.ref === "function" ? game.ref(rx, ry) : null;
          if (ref == null) continue;
          if (typeof game.isLand === "function" && !game.isLand(ref)) continue;
          if (typeof game.hasOwner === "function" && game.hasOwner(ref)) continue;
          if (typeof game.isImpassable === "function" && game.isImpassable(ref)) continue;
          if (typeof game.isBorder === "function" && game.isBorder(ref)) continue;

          let score = Math.random() * 5;
          const isShore = typeof game.isShore === "function" && game.isShore(ref);
          if (isShore) score += 20;

          let landNeighbors = 0;
          for (let dx = -3; dx <= 3; dx++) {
            for (let dy = -3; dy <= 3; dy++) {
              try {
                const nr = typeof game.ref === "function" ? game.ref(rx + dx, ry + dy) : null;
                if (nr != null && typeof game.isLand === "function" && game.isLand(nr)) {
                  landNeighbors++;
                }
              } catch (e) {}
            }
          }
          score += landNeighbors * 0.8;

          const distToCenter = Math.hypot(rx - cx, ry - cy);
          score += Math.min(distToCenter, 150) * 0.15;

          if (score > bestScore) {
            bestScore = score;
            bestTile = ref;
          }
        }
        return bestTile;
      },

      handle1v1BoatDefense(game, myPlayer, opponent) {
        try {
          if (!opponent) return;
          const now = Date.now();
          if (now - this.lastBoatDefenseTime < 1200) return;

          const oppUnits = playerUnits(opponent);
          const myBts = getBorderTiles(game, myPlayer);
          const myID = getMySmallID(myPlayer);
          const w = typeof game.width === "function" ? game.width() : 500;
          const myCenter = getPlayerCenter(game, myPlayer);

          for (const unit of oppUnits) {
            const uType = unitType(unit);
            if (uType !== "Transport" && uType !== "Boat") continue;
            const dst = typeof unit.dst === "function" ? unit.dst() : unit.dst;
            if (dst == null) continue;

            const dx = dst % w, dy = Math.floor(dst / w);
            const distToOurCenter = Math.hypot(dx - myCenter.x, dy - myCenter.y);
            const isOurLand = (typeof game.ownerID === "function" && game.ownerID(dst) === myID) || myBts.has(dst);

            let isFlankingBehindUs = false;
            if (!isOurLand) {
              if (distToOurCenter < 80) isFlankingBehindUs = true;
              forEachNeighbor(game, dst, (n) => {
                if (myBts.has(n)) isFlankingBehindUs = true;
              });
            }

            if (isOurLand || isFlankingBehindUs) {
              const myTr = playerTroops(myPlayer);
              const maxTr = getMaxTroops(game, myPlayer);
              const sendAmt = Math.min(Math.floor(myTr * 0.40), Math.max(Math.floor(maxTr * 0.10), 2000));
              if (sendAmt > 200) {
                const oppId = typeof opponent.id === "function" ? opponent.id() : opponent.id;
                const ok = sendPacket({ type: "attack", targetID: String(oppId), troops: sendAmt });
                if (ok) {
                  this.lastBoatDefenseTime = now;
                  this.stats.attacksSent++;
                  this.stats.boatDefenses++;
                  this.stats.troopsSentTotal += sendAmt;
                  this.targetDetail = `Intercept Flank #${dst}`;
                  return;
                }
              }
            }
          }
        } catch (e) {}
      },

      handle1v1Structures(game, myPlayer, opponent, phase = "mid") {
        const now = Date.now();
        if (now - this.lastStructureAttemptTime < 800) return;
        this.lastStructureAttemptTime = now;

        const gold = playerGold(myPlayer);
        if (gold < 50000) return;

        const units = playerUnits(myPlayer);
        const countOf = (type) => units.filter(u => unitType(u) === type).length;
        const cities = units.filter(u => unitType(u) === "City");
        const defensePosts = units.filter(u => unitType(u) === "Defense Post");
        const silos = countOf("Missile Silo");

        const frontline = analyzeFrontline(game, myPlayer, opponent);

        if (botCfg.buildCities && cities.length < 2) {
          const nextCityCost = Math.min(1000000, Math.pow(2, cities.length) * 125000);
          if (gold >= nextCityCost) {
            const cityTile = find1v1CityTile(game, myPlayer, cities, opponent, cities.length);
            if (cityTile != null) {
              const ok = sendPacket({ type: "build_unit", unit: "City", tile: cityTile });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Build City ${cities.length + 1}/3`;
                return;
              }
            }
          }
        }

        const maxPosts = botCfg.maxDefensePosts ?? 4;
        if (botCfg.buildDefensePosts && defensePosts.length < 1 && cities.length >= 1 && opponent) {
          const nextDPCost = (defensePosts.length + 1) * 50000;
          if (gold >= nextDPCost) {
            const dpTile = find1v1DefensePostTile(game, myPlayer, opponent, defensePosts, frontline);
            if (dpTile != null) {
              const ok = sendPacket({ type: "build_unit", unit: "Defense Post", tile: dpTile });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Frontline DP #${dpTile}`;
                return;
              }
            }
          }
        }

        if (botCfg.buildCities && cities.length < 3) {
          const nextCityCost = Math.min(1000000, Math.pow(2, cities.length) * 125000);
          if (gold >= nextCityCost) {
            const cityTile = find1v1CityTile(game, myPlayer, cities, opponent, cities.length);
            if (cityTile != null) {
              const ok = sendPacket({ type: "build_unit", unit: "City", tile: cityTile });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Build City 3/3`;
                return;
              }
            }
          }
        }

        if (botCfg.buildDefensePosts && defensePosts.length < maxPosts && opponent) {
          const nextDPCost = Math.min(250000, (defensePosts.length + 1) * 50000);
          if (gold >= nextDPCost) {
            const dpTile = find1v1DefensePostTile(game, myPlayer, opponent, defensePosts, frontline);
            if (dpTile != null) {
              const ok = sendPacket({ type: "build_unit", unit: "Defense Post", tile: dpTile });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Frontline DP ${defensePosts.length + 1}`;
                return;
              }
            }
          }
        }

        if (botCfg.buildSilos && silos < 1 && cities.length >= 3 && gold >= 1000000) {
          const siloTile = find1v1SiloTile(game, myPlayer, opponent);
          if (siloTile != null) {
            const ok = sendPacket({ type: "build_unit", unit: "Missile Silo", tile: siloTile });
            if (ok) {
              this.stats.structuresBuilt++;
              this.targetDetail = "Build Missile Silo (Lvl 1)";
              return;
            }
          }
        }
      },

      handle1v1Nukes(game, myPlayer, opponent) {
        const now = Date.now();
        if (now - this.lastNukeAttemptTime < 3000) return;
        this.lastNukeAttemptTime = now;

        const gold = playerGold(myPlayer);
        const units = playerUnits(myPlayer);
        const silos = units.filter(u => unitType(u) === "Missile Silo");
        if (silos.length === 0) return;

        if (!opponent || !isAlive(opponent)) return;

        let bombType = null;
        if (botCfg.allowHydrogenBombs && gold >= 5000000) {
          bombType = "Hydrogen Bomb";
        } else if (botCfg.allowAtomBombs && gold >= 750000) {
          bombType = "Atom Bomb";
        }
        if (!bombType) return;

        const shouldPrioritizeDPs = frontlineInDPRange(game, myPlayer, opponent);
        const targetTile = findBestNukeTarget(game, opponent, shouldPrioritizeDPs) || find1v1FlankShoreTile(game, myPlayer, opponent) || findTargetShoreTile(game, opponent);
        if (targetTile != null) {
          const ok = sendPacket({ type: "build_unit", unit: bombType, tile: targetTile });
          if (ok) {
            this.stats.nukesLaunched++;
            this.targetDetail = `${bombType} -> ${this.opponentName}`;
            if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.RADIATION);

            const myTroops = playerTroops(myPlayer);
            const assaultTroops = Math.floor(myTroops * 0.60);
            if (assaultTroops > 1000) {
              const oppId = typeof opponent.id === "function" ? opponent.id() : opponent.id;
              sendPacket({ type: "attack", targetID: String(oppId), troops: assaultTroops });
              this.stats.attacksSent++;
              this.stats.troopsSentTotal += assaultTroops;
            }
          }
        }
      },

      handle1v1Attacks(game, myPlayer, opponent, phase = "mid") {
        const myTroops = playerTroops(myPlayer);
        if (myTroops <= 0) return;

        const maxTroops = getMaxTroops(game, myPlayer);
        const dynamicReserve = getDynamicReserve(game, myPlayer, opponent, phase);
        const troopRatio = myTroops / maxTroops;
        const now = Date.now();
        const myID = getMySmallID(myPlayer);
        const myBts = getBorderTiles(game, myPlayer);

        const borderingMap = getBorderingPlayerIDs(game, myPlayer);
        const borderingEnemies = Array.from(borderingMap.values()).filter(p => isAlive(p) && !isFriendly(myPlayer, p));
        const borderingBots = borderingEnemies.filter(p => isBot(p));

        const isOpponentBordering = opponent && borderingEnemies.some(p => {
          const id1 = typeof p.id === "function" ? p.id() : p.id;
          const id2 = typeof opponent.id === "function" ? opponent.id() : opponent.id;
          return id1 === id2;
        });

        const myUnits = playerUnits(myPlayer);
        const myBoats = myUnits.filter(u => {
          const t = unitType(u);
          return t === "Transport" || t === "Boat" || t === "TransportShip";
        });
        const hasBoatInFlight = myBoats.length > 0;

        if (this.activeProbeBoat) {
          const probe = this.activeProbeBoat;
          const targetTile = probe.targetTile;
          const isTargetTileOurs = (typeof game.ownerID === "function" && game.ownerID(targetTile) === myID) || myBts.has(targetTile);
          let neighborOurs = false;
          forEachNeighbor(game, targetTile, (n) => {
            if (myBts.has(n) || (typeof game.ownerID === "function" && game.ownerID(n) === myID)) neighborOurs = true;
          });
          const timeInFlight = now - probe.sentTime;

          if (isTargetTileOurs || neighborOurs) {
            this.activeProbeBoat = null;
            this.justLandedBeachhead = true;
            this.lastLandingAssaultTime = now;
          } else if (timeInFlight > 120000) {
            this.activeProbeBoat = null;
          }
        }

        if (botCfg.autoExpand && hasBorderWithTerraNullius(game, myPlayer)) {
          const expandInterval = phase === "early" ? 200 : 350;
          if (now - this.lastExpandMs >= expandInterval) {
            const expandReserve = maxTroops * (phase === "early" ? 0.35 : (botCfg.expandRatio ?? 0.42));
            const available = myTroops - expandReserve;
            if (available > 0) {
              let parityExpandMod = 1.0;
              if (OppTracker.territoryRatio < 0.45) {
                parityExpandMod = 1.3;
              } else if (OppTracker.territoryRatio > 0.55) {
                parityExpandMod = 0.7;
              }
              const troopsToSend = Math.floor(Math.min(available, Math.max(maxTroops * 0.02, available * 0.50 * parityExpandMod)));
              if (troopsToSend >= 1) {
                const ok = sendPacket({ type: "attack", targetID: null, troops: troopsToSend });
                if (ok) {
                  this.lastExpandMs = now;
                  this.stats.attacksSent++;
                  this.stats.expandsDone++;
                  this.stats.troopsSentTotal += troopsToSend;
                  this.targetDetail = phase === "early" ? "Early Rush Expand" : "Territory Expansion";
                }
              }
            }
          }
        }

        const neck = findOurVulnerableNecks(game, myPlayer, opponent);
        if (neck && troopRatio >= 0.35 && (now - this.lastExpandMs >= 150)) {
          const ok = sendPacket({ type: "attack", targetID: null, troops: Math.min(myTroops * 0.15, 10000) });
          if (ok) {
            this.lastExpandMs = now;
            this.stats.attacksSent++;
            this.targetDetail = `Thicken Neck #${neck.neckTile}`;
          }
        }

        if (botCfg.autoBoat && phase !== "late" && !hasBoatInFlight && (now - this.lastBoatFlankTime > 5000) && troopRatio >= 0.25) {
          const oppDir = OppTracker.oppExpansionDir;
          if (oppDir && OppTracker.territoryRatio < 0.52) {
            const w = typeof game.width === "function" ? game.width() : 500;
            const myCenter = getPlayerCenter(game, myPlayer);
            if (myCenter) {
              const perpX = -oppDir.y;
              const perpY = oppDir.x;
              const targetX = Math.round(myCenter.x + perpX * 40);
              const targetY = Math.round(myCenter.y + perpY * 40);
              const candidateTile = typeof game.ref === "function" ? game.ref(targetX, targetY) : null;
              if (candidateTile != null) {
                const owner = typeof game.ownerID === "function" ? game.ownerID(candidateTile) : null;
                if (owner === 0 || owner === null || owner === undefined) {
                  let bestShore = null, bestDist = Infinity;
                  for (let dx = -8; dx <= 8; dx++) {
                    for (let dy = -8; dy <= 8; dy++) {
                      try {
                        const ref = typeof game.ref === "function" ? game.ref(targetX + dx, targetY + dy) : null;
                        if (ref != null && game.isShore(ref)) {
                          const refOwner = game.ownerID(ref);
                          if (refOwner === 0 || refOwner === null || refOwner === undefined) {
                            const d = Math.hypot(dx, dy);
                            if (d < bestDist) { bestDist = d; bestShore = ref; }
                          }
                        }
                      } catch(e) {}
                    }
                  }
                  if (bestShore != null) {
                    const boatTroops = Math.max(100, Math.floor(myTroops * 0.02));
                    if (boatTroops >= 50) {
                      const ok = sendPacket({ type: "boat", dst: bestShore, troops: boatTroops });
                      if (ok) {
                        this.lastBoatFlankTime = now;
                        this.stats.boatsSent++;
                        this.stats.troopsSentTotal += boatTroops;
                        this.targetDetail = `Expansion Wall Boat #${bestShore}`;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (botCfg.autoAttack && borderingBots.length > 0) {
          const botReserve = phase === "early" ? 0.35 : 0.42;
          if (troopRatio >= botReserve) {
            let encirclePlan = null;
            for (const bot of borderingBots) {
              const plan = findBotEncirclementPlan(game, myPlayer, bot);
              if (plan && plan.walledRatio >= 0.25 && plan.unownedCount > 0 && plan.unownedCount <= 25) {
                encirclePlan = plan;
                break;
              }
            }

            if (encirclePlan && botCfg.autoBoat && !hasBoatInFlight && encirclePlan.bestShoreBehind != null && (now - this.lastBoatFlankTime > 3000)) {
              const boatTroops = Math.max(100, Math.floor(myTroops * 0.05));
              const ok = sendPacket({ type: "boat", dst: encirclePlan.bestShoreBehind, troops: boatTroops });
              if (ok) {
                this.lastBoatFlankTime = now;
                this.stats.boatsSent++;
                this.stats.troopsSentTotal += boatTroops;
                this.targetDetail = `Encircle Bot Boat #${encirclePlan.bestShoreBehind}`;
                return;
              }
            }

            if (this.attackBots(borderingBots, game, myPlayer, myTroops, maxTroops, botReserve)) {
              this.targetDetail = "Annex Bots";
              return;
            }
          }
          const oppTr = opponent ? playerTroops(opponent) : Infinity;
          const isOppKillShot = oppTr < myTroops * 0.28 || oppTr < maxTroops * 0.08;
          if (!isOppKillShot) {
            return;
          }
        }

        if (!botCfg.autoAttack || !opponent) return;

        const oppTroops = playerTroops(opponent);
        const oppUnits = playerUnits(opponent);
        const oppHasDP = oppUnits.some(u => unitType(u) === "Defense Post");
        const isKillShot = oppTroops < myTroops * 0.28 || oppTroops < maxTroops * 0.08;
        const isPunish = OppTracker.isPunishWindow;
        const oppInDPRange = frontlineInDPRange(game, myPlayer, opponent);

        if (this.justLandedBeachhead || (now - this.lastLandingAssaultTime < 2500)) {
          if (isOpponentBordering && (now - this.lastAttackMs >= 300) && (!oppInDPRange || isKillShot)) {
            const ok = sendLandAttack(game, myPlayer, opponent, myTroops, maxTroops, this.botAttackTroopsSent, dynamicReserve, true);
            if (ok) {
              this.lastAttackMs = now;
              this.justLandedBeachhead = false;
              this.stats.attacksSent++;
              this.targetDetail = `BEACHHEAD ASSAULT -> ${this.opponentName}`;
              if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.SWORD);
              return;
            }
          } else if (botCfg.autoBoat && (now - this.lastBoatFlankTime > 1000)) {
            const destTile = findTargetCityTile(opponent) || findTargetShoreTile(game, opponent);
            if (destTile != null) {
              const followUpTroops = Math.floor(Math.min(myTroops * 0.35, Math.max(0, myTroops - maxTroops * dynamicReserve)));
              if (followUpTroops > 500) {
                const ok = sendPacket({ type: "boat", dst: destTile, troops: followUpTroops });
                if (ok) {
                  this.lastBoatFlankTime = now;
                  this.justLandedBeachhead = false;
                  this.stats.attacksSent++;
                  this.stats.boatsSent++;
                  this.stats.troopsSentTotal += followUpTroops;
                  this.targetDetail = `Point-Blank Naval Strike #${destTile}`;
                  return;
                }
              }
            }
          }
        }

        if (now - this.lastCutAttackTime > 3000 && troopRatio >= dynamicReserve && !oppInDPRange) {
          const encircle = findEncirclementTarget(game, myPlayer, opponent);
          if (encircle && encircle.pocketSize > 30) {
            const cutTroops = Math.floor(Math.min(myTroops * 0.30, maxTroops * 0.25));
            if (cutTroops > 1000) {
              const oppId = typeof opponent.id === "function" ? opponent.id() : opponent.id;
              const ok = sendPacket({ type: "attack", targetID: String(oppId), troops: cutTroops });
              if (ok) {
                this.lastCutAttackTime = now;
                this.stats.attacksSent++;
                this.stats.troopsSentTotal += cutTroops;
                this.targetDetail = `ENCIRCLE (pocket:${encircle.pocketSize}) #${encircle.cutTile}`;
                if (botCfg.autoBoat && !hasBoatInFlight && myTroops - cutTroops > maxTroops * 0.20) {
                  const rearTile = findTargetShoreTile(game, opponent);
                  if (rearTile != null) {
                    const boatTroops = Math.floor(Math.min((myTroops - cutTroops) * 0.15, maxTroops * 0.10));
                    if (boatTroops > 200) {
                      sendPacket({ type: "boat", dst: rearTile, troops: boatTroops });
                      this.stats.boatsSent++;
                      this.stats.troopsSentTotal += boatTroops;
                    }
                  }
                }
                return;
              }
            }
          } else {
            const cutTile = findCutTarget(game, opponent);
            if (cutTile != null) {
              const cutTroops = Math.floor(Math.min(myTroops * 0.30, maxTroops * 0.25));
              if (cutTroops > 1000) {
                const oppId = typeof opponent.id === "function" ? opponent.id() : opponent.id;
                const ok = sendPacket({ type: "attack", targetID: String(oppId), troops: cutTroops });
                if (ok) {
                  this.lastCutAttackTime = now;
                  this.stats.attacksSent++;
                  this.stats.troopsSentTotal += cutTroops;
                  this.targetDetail = `Cut Isthmus #${cutTile}`;
                  return;
                }
              }
            }
          }
        }

        if (isOpponentBordering && (now - this.lastAttackMs >= 500)) {
          const hasAdvantage = myTroops > oppTroops * 1.10 && troopRatio >= Math.max(0.55, botCfg.triggerRatio ?? 0.46);
          const latePhasePush = phase === "late" && myTroops > oppTroops * 0.95 && troopRatio >= 0.44;

          if (oppInDPRange && !isKillShot) {
            const dpOverwhelm = myTroops > oppTroops * 2.5 && troopRatio >= 0.60;
            if (!dpOverwhelm) {
              if (botCfg.autoBoat && !hasBoatInFlight && (now - this.lastBoatFlankTime > 2000) && troopRatio >= 0.30) {
                const flankTile = find1v1FlankShoreTile(game, myPlayer, opponent) || findTargetShoreTile(game, opponent);
                if (flankTile != null) {
                  const boatTroops = Math.floor(Math.min(myTroops * 0.25, Math.max(0, myTroops - maxTroops * dynamicReserve)));
                  if (boatTroops > 500) {
                    const ok = sendPacket({ type: "boat", dst: flankTile, troops: boatTroops });
                    if (ok) {
                      this.lastBoatFlankTime = now;
                      this.stats.attacksSent++;
                      this.stats.boatsSent++;
                      this.stats.troopsSentTotal += boatTroops;
                      this.targetDetail = `DP Bypass Flank #${flankTile}`;
                    }
                  }
                }
              }
              return;
            }
          }

          const validPunish = isPunish && myTroops > oppTroops * 1.15;
          if (isKillShot || validPunish || hasAdvantage || latePhasePush) {
            const ok = sendLandAttack(game, myPlayer, opponent, myTroops, maxTroops, this.botAttackTroopsSent, dynamicReserve, isKillShot);
            if (ok) {
              this.lastAttackMs = now;
              this.stats.attacksSent++;
              if (isKillShot) {
                this.targetDetail = `KILL SHOT -> ${this.opponentName}`;
                if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.SKULL);
              } else if (isPunish) {
                this.targetDetail = `PUNISH WINDOW -> ${this.opponentName}`;
                if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.DEVIL);
              } else {
                this.targetDetail = `Assault -> ${this.opponentName}`;
                if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.SWORD);
              }
              return;
            }
          }
        }

        const boatCount = myBoats.length;
        if (botCfg.autoBoat && !this.activeProbeBoat && boatCount < 3 && (now - this.lastProbeBoatTime > 4000) && troopRatio >= 0.20) {
          const shouldProbe = !isOpponentBordering || oppHasDP || phase === "late";
          if (shouldProbe) {
            const flankTile = (!isOpponentBordering ? (findTargetCityTile(opponent) || findTargetShoreTile(game, opponent)) : find1v1FlankShoreTile(game, myPlayer, opponent)) || findTargetShoreTile(game, opponent);
            if (flankTile != null) {
              const probeTroops = oppHasDP 
                ? Math.max(200, Math.min(Math.floor(myTroops * 0.15), 50000))
                : Math.max(50, Math.min(Math.floor(myTroops * 0.01), 25000));
              if (probeTroops >= 1) {
                const ok = sendPacket({ type: "boat", dst: flankTile, troops: probeTroops });
                if (ok) {
                  const oppId = typeof opponent.id === "function" ? opponent.id() : opponent.id;
                  this.activeProbeBoat = { targetTile: flankTile, targetID: oppId, sentTime: now, troops: probeTroops };
                  this.lastProbeBoatTime = now;
                  this.lastBoatFlankTime = now;
                  this.stats.attacksSent++;
                  this.stats.boatsSent++;
                  this.stats.troopsSentTotal += probeTroops;
                  this.targetDetail = `1% Probe Boat #${flankTile}`;
                  return;
                }
              }
            }
          }
        }
      },

      handleAttacks(game, myPlayer) {
        const myTroops = playerTroops(myPlayer);
        if (myTroops <= 0) return;

        const maxTroops = getMaxTroops(game, myPlayer);
        const triggerRatio = botCfg.triggerRatio ?? 0.55;
        const reserveRatio = botCfg.reserveRatio ?? 0.35;
        const expandRatio = botCfg.expandRatio ?? 0.15;
        const effReserve = getEffectiveReserveRatio(game, myPlayer, reserveRatio);
        const troopRatio = myTroops / maxTroops;

        const borderingMap = getBorderingPlayerIDs(game, myPlayer);
        const borderingPlayers = Array.from(borderingMap.values()).filter(p => isAlive(p));
        const borderingEnemies = borderingPlayers.filter(p => !isFriendly(myPlayer, p));
        borderingEnemies.sort((a, b) => playerTroops(a) - playerTroops(b));

        if (botCfg.autoAttack) {
          const borderingBots = borderingEnemies.filter(p => isBot(p));
          if (borderingBots.length > 0) {
            if (this.attackBots(borderingBots, game, myPlayer, myTroops, maxTroops, reserveRatio)) return;
          }
        }

        if (botCfg.autoExpand && hasBorderWithTerraNullius(game, myPlayer)) {
          const expandThrottle = 800;
          const now = Date.now();
          if (now - this.lastExpandMs >= expandThrottle) {
            const expandReserve = maxTroops * expandRatio;
            const available = myTroops - expandReserve;
            if (available > 0) {
              const troopsToSend = Math.floor(Math.min(available, Math.max(maxTroops * 0.04, myTroops * 0.30)));
              if (troopsToSend >= Math.max(1, maxTroops * 0.02)) {
                const ok = sendPacket({ type: "attack", targetID: null, troops: troopsToSend });
                if (ok) {
                  this.lastExpandMs = now;
                  this.stats.attacksSent++;
                  this.stats.expandsDone++;
                  this.stats.troopsSentTotal += troopsToSend;
                  return;
                }
              }
            }
          }
        }

        if (!botCfg.autoAttack) return;

        if (troopRatio >= effReserve) {
          const borderingBots = borderingEnemies.filter(p => isBot(p));
          if (borderingBots.length > 0) {
            if (this.attackBots(borderingBots, game, myPlayer, myTroops, maxTroops, reserveRatio)) return;
          }
        }

        if (troopRatio < effReserve) return;

        const now = Date.now();
        if (now - this.lastAttackMs < 1200) return;

        for (const enemy of borderingEnemies) {
          const enemyMax = getMaxTroops(game, enemy);
          const enemyTroops = playerTroops(enemy);
          if (enemyTroops < enemyMax * 0.15 && enemyTroops < myTroops * 1.2) {
            const ok = sendLandAttack(game, myPlayer, enemy, myTroops, maxTroops, this.botAttackTroopsSent, reserveRatio);
            if (ok) {
              this.lastAttackMs = now;
              this.stats.attacksSent++;
              if (botCfg.autoEmoji === true) this.sendEmojiTo(enemy, EMOJI_IDX.DEVIL);
              return;
            }
          }
        }

        for (const enemy of borderingEnemies) {
          const enemyTroops = playerTroops(enemy);
          const enemyIncoming = typeof enemy.incomingAttacks === "function" ? enemy.incomingAttacks() : [];
          const totalIncoming = enemyIncoming.reduce((s, a) => {
            return s + (typeof a.troops === "function" ? Number(a.troops()) : Number(a.troops || 0));
          }, 0);
          if (totalIncoming > enemyTroops * 0.5) {
            const ok = sendLandAttack(game, myPlayer, enemy, myTroops, maxTroops, this.botAttackTroopsSent, reserveRatio);
            if (ok) {
              this.lastAttackMs = now;
              this.stats.attacksSent++;
              if (botCfg.autoEmoji === true) this.sendEmojiTo(enemy, EMOJI_IDX.DEVIL);
              return;
            }
          }
        }

        if (troopRatio < triggerRatio) return;

        if (borderingEnemies.length > 0) {
          const weakest = borderingEnemies[0];
          if (playerTroops(weakest) < myTroops) {
            const ok = sendLandAttack(game, myPlayer, weakest, myTroops, maxTroops, this.botAttackTroopsSent, reserveRatio);
            if (ok) {
              this.lastAttackMs = now;
              this.stats.attacksSent++;
              if (botCfg.autoEmoji === true) this.sendEmojiTo(weakest, EMOJI_IDX.ANGRY);
              return;
            }
          }
        }

        if (borderingEnemies.length === 0 && botCfg.autoBoat) {
          const allPlayers = getAllPlayers(game);
          const remotes = allPlayers.filter(p => !isFriendly(myPlayer, p) && isAlive(p));
          if (remotes.length > 0) {
            remotes.sort((a, b) => playerTroops(a) - playerTroops(b));
            const target = remotes[0];
            const destTile = findTargetCityTile(target) || findTargetShoreTile(game, target);
            if (destTile != null) {
              const boatTroops = Math.floor(Math.min(myTroops * 0.15, 200000));
              if (boatTroops > 1000) {
                const ok = sendPacket({ type: "boat", dst: destTile, troops: boatTroops });
                if (ok) {
                  this.lastAttackMs = now;
                  this.stats.attacksSent++;
                  this.stats.boatsSent++;
                  return;
                }
              }
            }
          }
        }
      },

      attackBots(bots, game, myPlayer, myTroops, maxTroops, reserveRatio) {
        let attacked = 0;
        const cap = Math.max(1, Math.min(100, botCfg.botParallelism || 50));
        bots.sort((a, b) => {
          const aPlan = findBotEncirclementPlan(game, myPlayer, a);
          const bPlan = findBotEncirclementPlan(game, myPlayer, b);
          const aW = aPlan ? aPlan.walledRatio : 0;
          const bW = bPlan ? bPlan.walledRatio : 0;

          if ((aW >= 0.60) !== (bW >= 0.60)) return aW >= 0.60 ? -1 : 1;

          const aStr = playerOwnsStructures(a);
          const bStr = playerOwnsStructures(b);
          if (aStr !== bStr) return aStr ? -1 : 1;

          const aTr = playerTroops(a);
          const bTr = playerTroops(b);
          const aOneShot = aTr < myTroops * 0.15;
          const bOneShot = bTr < myTroops * 0.15;
          if (aOneShot !== bOneShot) return aOneShot ? -1 : 1;

          const aTiles = typeof a.numTilesOwned === "function" ? Number(a.numTilesOwned()) || 1 : 1;
          const bTiles = typeof b.numTilesOwned === "function" ? Number(b.numTilesOwned()) || 1 : 1;
          return (aTr / aTiles) - (bTr / bTiles);
        });

        const reserve = maxTroops * (reserveRatio ?? 0.42);
        let availableBudget = Math.max(0, myTroops - reserve - this.botAttackTroopsSent);
        if (availableBudget < 1) return false;

        for (const bot of bots.slice(0, cap)) {
          if (availableBudget <= 0) break;
          const botId = typeof bot.id === "function" ? bot.id() : bot.id;
          const botTr = playerTroops(bot);
          const botTiles = typeof bot.numTilesOwned === "function" ? Number(bot.numTilesOwned()) || 1 : 1;
          const needed = Math.ceil(botTr * 1.25 + botTiles * 2.5 + 50);

          let sendAmt = 0;
          if (availableBudget >= needed) {
            sendAmt = needed;
          } else if (availableBudget >= Math.max(50, botTr * 0.90)) {
            sendAmt = availableBudget;
          }

          if (sendAmt >= 1) {
            const ok = sendPacket({ type: "attack", targetID: String(botId), troops: sendAmt });
            if (ok) {
              attacked++;
              this.botAttackTroopsSent += sendAmt;
              availableBudget -= sendAmt;
              this.stats.attacksSent++;
              this.stats.troopsSentTotal += sendAmt;
            }
          }
        }
        if (attacked > 0) {
          this.lastAttackMs = Date.now();
        }
        return attacked > 0;
      },

      handleDefensePost(game, myPlayer) {
        const now = Date.now();
        if (now - this.lastDefensePostAttemptTime < 2500) return;
        this.lastDefensePostAttemptTime = now;

        const gold = playerGold(myPlayer);
        if (gold < 250000) return;

        const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        if (incoming.length === 0) return;

        const myTr = playerTroops(myPlayer);
        if (myTr <= 0) return;
        const totalInc = incoming.reduce((s, a) => s + (typeof a.troops === "function" ? Number(a.troops()) : Number(a.troops || 0)), 0);
        if (totalInc < myTr * 0.25) return;

        const units = playerUnits(myPlayer);
        const posts = units.filter(u => unitType(u) === "Defense Post");
        const maxPosts = botCfg.maxDefensePosts ?? 3;
        if (posts.length >= maxPosts) return;

        const frontTile = findInteriorTile(game, myPlayer);
        if (frontTile != null) {
          if (sendPacket({ type: "build_unit", unit: "Defense Post", tile: frontTile })) {
            this.stats.structuresBuilt++;
          }
        }
      },

      handleStructures(game, myPlayer) {
        const now = Date.now();
        if (now - this.lastStructureAttemptTime < 1500) return;
        this.lastStructureAttemptTime = now;

        const gold = playerGold(myPlayer);
        const units = playerUnits(myPlayer);

        const countOf = (type) => units.filter(u => unitType(u) === type).length;
        const cities = countOf("City");
        const sams = countOf("SAM Launcher");
        const silos = countOf("Missile Silo");
        const ports = countOf("Port");

        const interior = findInteriorTile(game, myPlayer);

        const maxPorts = botCfg.maxPorts ?? 2;
        if (botCfg.buildPorts && ports < maxPorts && gold >= 125000 && botCfg.autoWarship) {
          const shore = findOwnedShoreTile(game, myPlayer);
          if (shore != null && sendPacket({ type: "build_unit", unit: "Port", tile: shore })) {
            this.stats.structuresBuilt++;
            return;
          }
        }

        const maxSams = botCfg.maxSams ?? 5;
        const samRatio = botCfg.samRatio ?? 0.35;
        const wantSams = Math.min(maxSams, Math.floor(cities * samRatio));
        if (botCfg.buildSams && sams < wantSams && gold >= 1500000 && interior != null) {
          if (sendPacket({ type: "build_unit", unit: "SAM Launcher", tile: interior })) {
            this.stats.structuresBuilt++;
            return;
          }
        }

        const maxSilos = botCfg.maxSilos ?? 3;
        const wantSilos = Math.min(maxSilos, Math.floor(cities / 3));
        if (botCfg.buildSilos && silos < wantSilos && gold >= 1000000 && interior != null) {
          if (sendPacket({ type: "build_unit", unit: "Missile Silo", tile: interior })) {
            this.stats.structuresBuilt++;
            return;
          }
        }

        const maxCities = botCfg.maxCities ?? 25;
        if (botCfg.buildCities && cities < maxCities && gold >= 125000 && interior != null) {
          if (sendPacket({ type: "build_unit", unit: "City", tile: interior })) {
            this.stats.structuresBuilt++;
            return;
          }
        }
      },

      handleNukes(game, myPlayer) {
        const now = Date.now();
        if (now - this.lastNukeAttemptTime < 5000) return;
        this.lastNukeAttemptTime = now;

        const gold = playerGold(myPlayer);
        const units = playerUnits(myPlayer);
        const silos = units.filter(u => unitType(u) === "Missile Silo");
        if (silos.length === 0) return;

        const allPlayers = getAllPlayers(game);
        const humanTargets = allPlayers.filter(p => !isFriendly(myPlayer, p) && isAlive(p) && !isBot(p));
        if (humanTargets.length === 0) return;

        humanTargets.sort((a, b) => playerUnits(b).length - playerUnits(a).length);
        const target = humanTargets[0];

        let bombType = null;
        if (botCfg.allowHydrogenBombs && gold >= 5000000) bombType = "Hydrogen Bomb";
        else if (botCfg.allowAtomBombs && gold >= 750000) bombType = "Atom Bomb";
        if (!bombType) return;

        const targetTile = findTargetCityTile(target) || findTargetShoreTile(game, target);
        if (targetTile != null) {
          const ok = sendPacket({ type: "build_unit", unit: bombType, tile: targetTile });
          if (ok) {
            this.stats.nukesLaunched++;
            if (botCfg.autoEmoji === true) this.sendEmojiTo(target, EMOJI_IDX.RADIATION);
          }
        }
      },

      handleAutoEmbargo(game, myPlayer) {
        const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        for (const atk of incoming) {
          if (!atk) continue;
          const attacker = typeof atk.attacker === "function" ? atk.attacker() : null;
          if (attacker && !isFriendly(myPlayer, attacker)) {
            const aId = typeof attacker.id === "function" ? attacker.id() : attacker.id;
            if (aId) sendPacket({ type: "embargo", targetID: String(aId), action: "start" });
          }
        }
      },

      handleAutoDonate(game, myPlayer) {
        const now = Date.now();
        if (now - this.lastDonateAttemptTime < 3000) return;
        this.lastDonateAttemptTime = now;

        const myTr = playerTroops(myPlayer);
        if (myTr < 50000) return;

        const all = getAllPlayers(game);
        const alliesInCombat = all.filter(p => {
          if (!isFriendly(myPlayer, p) || !isAlive(p)) return false;
          const id1 = typeof myPlayer.id === "function" ? myPlayer.id() : myPlayer.id;
          const id2 = typeof p.id === "function" ? p.id() : p.id;
          if (id1 === id2) return false;
          const inAtk = typeof p.incomingAttacks === "function" ? p.incomingAttacks() : [];
          return inAtk.length > 0;
        });

        if (alliesInCombat.length === 0) return;
        alliesInCombat.sort((a, b) => playerTroops(a) - playerTroops(b));
        const ally = alliesInCombat[0];
        const allyId = typeof ally.id === "function" ? ally.id() : ally.id;
        const donateAmount = Math.floor(myTr * 0.15);
        if (donateAmount > 500 && allyId) {
          sendPacket({ type: "donate_troops", recipient: String(allyId), troops: donateAmount });
          if (botCfg.autoEmoji === true) this.sendEmojiTo(ally, EMOJI_IDX.HEART);
        }
      },

      handleEmojis(game, myPlayer) {
        if (botCfg.autoEmoji !== true) return;
        const now = Date.now();
        if (now - this.lastGlobalEmojiTime < 3000) return;

        const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        if (incoming.length > 0) {
          const totalInc = incoming.reduce((s, a) => s + (typeof a.troops === "function" ? Number(a.troops()) : Number(a.troops || 0)), 0);
          const myTr = playerTroops(myPlayer);
          if (totalInc >= myTr * 2.5) {
            this.sendEmojiTo("AllPlayers", EMOJI_IDX.SKULL);
            this.lastGlobalEmojiTime = now;
            return;
          }
        }
      },

      sendEmojiTo(target, emojiIndex) {
        if (botCfg.autoEmoji !== true) return false;
        const now = Date.now();
        const tId = typeof target === "string" ? target : (typeof target?.id === "function" ? target.id() : (target?.id || "AllPlayers"));
        const last = this.lastEmojiSentTime.get(String(tId)) || 0;
        if (now - last < 4000) return false;
        this.lastEmojiSentTime.set(String(tId), now);

        return sendPacket({
          type: "emoji",
          recipient: String(tId),
          emoji: Number.isInteger(emojiIndex) ? emojiIndex : EMOJI_IDX.HEART
        });
      }
    };

    function renderTab(panel) {
      panel.style.color = "#ccc";
      panel.style.fontFamily = "monospace";
      panel.style.fontSize = "11px";

      const themeColor = api.cfg?.guiColor || "#00ff66";

      panel.innerHTML = `
        <button id="blon-ext-auto-master-toggle" style="width:100%;padding:9px 0;background:${themeColor};border:none;color:#000;font-weight:700;font-size:11px;border-radius:4px;cursor:pointer;margin-bottom:10px;transition:all 0.2s ease;">
            ENABLE AUTOPLAY (Shift+B)
        </button>

        <div style="background:#111;border:1px solid #222;border-radius:6px;padding:8px 10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#aaa;font-size:10px;font-weight:700;">STRATEGY PRESET</span>
            <select id="blon-ext-mode-select" style="background:#222;color:#fff;border:1px solid #444;border-radius:3px;font-size:10px;padding:3px 6px;cursor:pointer;">
                <option value="v1v1" ${botCfg.activePreset === 'v1v1' || botCfg.mode === '1v1' ? 'selected' : ''}>1v1 Sweaty Meta</option>
                <option value="solo" ${botCfg.activePreset === 'solo' || botCfg.mode === 'solo' ? 'selected' : ''}>Solo Impossible AI</option>
            </select>
        </div>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-bottom:8px;">Combat & Expansion</div>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-attack" ${botCfg.autoAttack !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Attack & Cutoff
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-expand" ${botCfg.autoExpand !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Expand (Max Cap Burst)
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-defend" ${botCfg.autoDefend !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Defend & Intercept
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-spawn" ${botCfg.autoSpawn !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Spawn (Optimal Inland)
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-boat" ${botCfg.autoBoat !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Boat Awareness & Naval Flanking
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-embargo" ${botCfg.autoEmbargo !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Embargo Hostiles
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:12px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-emoji" ${botCfg.autoEmoji === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Emoji Reactions
        </label>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Structure & Defense</div>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-build-master" ${botCfg.autoBuild !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Build Structures
        </label>

        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-cities" ${botCfg.buildCities !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Cities (Inland Spacing)
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Cities</span>
                <input id="blon-ext-max-cities-slider" type="range" min="1" max="50" step="1" value="${botCfg.maxCities ?? 3}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-cities-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxCities ?? 3}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-defposts" ${botCfg.buildDefensePosts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Defense Posts (Border Radius)
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Defense Posts</span>
                <input id="blon-ext-max-defposts-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxDefensePosts ?? 4}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-defposts-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxDefensePosts ?? 4}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-silos" ${botCfg.buildSilos !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Missile Silos
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Silos</span>
                <input id="blon-ext-max-silos-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxSilos ?? 1}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-silos-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSilos ?? 1}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-sams" ${botCfg.buildSams !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> SAM Launchers
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max SAMs</span>
                <input id="blon-ext-max-sams-slider" type="range" min="0" max="20" step="1" value="${botCfg.maxSams ?? 0}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-sams-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSams ?? 0}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-ports" ${botCfg.buildPorts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Ports
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Ports</span>
                <input id="blon-ext-max-ports-slider" type="range" min="0" max="6" step="1" value="${botCfg.maxPorts ?? 0}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-ports-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxPorts ?? 0}</span>
            </div>
        </div>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Nuclear Strikes</div>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-nuke" ${botCfg.autoNuke !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Nuke
        </label>
        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-nuke-atom" ${botCfg.allowAtomBombs === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Atom Bombs ($750K)
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-nuke-hbomb" ${botCfg.allowHydrogenBombs !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Hydrogen Bombs ($5M)
            </label>
        </div>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">AI Tuning</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Attack Trigger Ratio</span>
                <input id="blon-ext-trigger-slider" type="range" min="30" max="90" step="1" value="${Math.round((botCfg.triggerRatio ?? 0.50) * 100)}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-trigger-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.triggerRatio ?? 0.50) * 100)}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Troop Reserve Floor</span>
                <input id="blon-ext-reserve-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.reserveRatio ?? 0.42) * 100)}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-reserve-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.reserveRatio ?? 0.42) * 100)}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Wilderness Expand Floor</span>
                <input id="blon-ext-expand-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.expandRatio ?? 0.42) * 100)}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-expand-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.expandRatio ?? 0.42) * 100)}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Bot Parallel Cap</span>
                <input id="blon-ext-parallel-slider" type="range" min="1" max="100" step="1" value="${botCfg.botParallelism ?? 60}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-parallel-value" style="color:#ffcc00;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.botParallelism ?? 60}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">AI Tick Interval</span>
                <input id="blon-ext-interval-slider" type="range" min="200" max="2500" step="50" value="${botCfg.tickIntervalMs ?? 650}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-interval-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.tickIntervalMs ?? 650}ms</span>
            </div>
        </div>
      `;

      const masterBtn = panel.querySelector("#blon-ext-auto-master-toggle");
      if (masterBtn) masterBtn.addEventListener("click", () => Engine.toggle());

      const modeSelect = panel.querySelector("#blon-ext-mode-select");
      if (modeSelect) {
        modeSelect.addEventListener("change", (e) => {
          applyPreset(e.target.value);
        });
      }

      [
        ["blon-ext-feat-attack", "autoAttack"],
        ["blon-ext-feat-expand", "autoExpand"],
        ["blon-ext-feat-defend", "autoDefend"],
        ["blon-ext-feat-spawn", "autoSpawn"],
        ["blon-ext-feat-embargo", "autoEmbargo"],
        ["blon-ext-feat-boat", "autoBoat"],
        ["blon-ext-feat-emoji", "autoEmoji"],
        ["blon-ext-build-master", "autoBuild"],
        ["blon-ext-build-cities", "buildCities"],
        ["blon-ext-build-sams", "buildSams"],
        ["blon-ext-build-silos", "buildSilos"],
        ["blon-ext-build-ports", "buildPorts"],
        ["blon-ext-build-defposts", "buildDefensePosts"],
        ["blon-ext-feat-nuke", "autoNuke"],
        ["blon-ext-nuke-atom", "allowAtomBombs"],
        ["blon-ext-nuke-hbomb", "allowHydrogenBombs"],
      ].forEach(([id, prop]) => {
        const cb = panel.querySelector("#" + id);
        if (cb) cb.addEventListener("change", (e) => {
          botCfg[prop] = e.target.checked;
          botCfg.activePreset = "custom";
          saveBotCfg();
        });
      });

      const bindSlider = (sliderId, labelId, prop, isPct = false, suffix = "") => {
        const sl = panel.querySelector("#" + sliderId);
        const lb = panel.querySelector("#" + labelId);
        if (sl) {
          sl.addEventListener("input", (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) {
              botCfg[prop] = isPct ? v / 100 : v;
              botCfg.activePreset = "custom";
              if (lb) lb.textContent = `${v}${suffix}`;
              saveBotCfg();
            }
          });
        }
      };

      bindSlider("blon-ext-max-cities-slider", "blon-ext-max-cities-val", "maxCities");
      bindSlider("blon-ext-max-sams-slider", "blon-ext-max-sams-val", "maxSams");
      bindSlider("blon-ext-max-silos-slider", "blon-ext-max-silos-val", "maxSilos");
      bindSlider("blon-ext-max-ports-slider", "blon-ext-max-ports-val", "maxPorts");
      bindSlider("blon-ext-max-defposts-slider", "blon-ext-max-defposts-val", "maxDefensePosts");

      bindSlider("blon-ext-trigger-slider", "blon-ext-trigger-value", "triggerRatio", true, "%");
      bindSlider("blon-ext-reserve-slider", "blon-ext-reserve-value", "reserveRatio", true, "%");
      bindSlider("blon-ext-expand-slider", "blon-ext-expand-value", "expandRatio", true, "%");
      bindSlider("blon-ext-parallel-slider", "blon-ext-parallel-value", "botParallelism");
      bindSlider("blon-ext-interval-slider", "blon-ext-interval-value", "tickIntervalMs", false, "ms");

      updateUI();
    }

    function updateUI() {
      const masterBtn = document.getElementById("blon-ext-auto-master-toggle");
      const isRunning = Engine.running;
      const themeColor = api.cfg?.guiColor || "#00ff66";

      if (masterBtn) {
        masterBtn.textContent = isRunning ? "DISABLE AUTOPLAY (Shift+B)" : "ENABLE AUTOPLAY (Shift+B)";
        masterBtn.style.background = isRunning ? "#331111" : themeColor;
        masterBtn.style.color = isRunning ? "#ff6666" : "#000";
        masterBtn.style.borderColor = isRunning ? "#ff4444" : "transparent";
      }
    }

    function onKeyDown(e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) return;
      if (e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        Engine.toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);

    api.registerExtension({
      id: "impossible-bot",
      name: "Autoplay Bot",
      version: "3.9.1",
      description: "Autoplay extension",
      author: "blon",
      tabLabel: "Auto",
      tabContent: renderTab,
      onUninstall: function() {
        Engine.stop();
        window.removeEventListener("keydown", onKeyDown, true);
      }
    });

    if (botCfg.enabled) Engine.start();
  }

  function waitForBlonAPI(callback, retries = 30) {
    if (window.__blonAPI && typeof window.__blonAPI.registerExtension === "function") {
      callback(window.__blonAPI);
    } else if (retries > 0) {
      setTimeout(() => waitForBlonAPI(callback, retries - 1), 300);
    } else {
      console.warn("[ImpossibleBot] window.__blonAPI not found. Is Project Blon installed?");
    }
  }

  waitForBlonAPI(initImpossibleBot);
})();
