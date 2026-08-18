// ==UserScript==
// @name         Blon Extension: Autoplay Bot
// @namespace    http://tampermonkey.net/
// @version      4.3.1
// @description  Advanced Autonomous Autoplay Extension for Project Blon
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
        maxFactories: 0,
        maxSilos: 1,
        maxSams: 0,
        samRatio: .35,
        maxPorts: 1,
        maxDefensePosts: 4,
        buildCities: true,
        buildFactories: false,
        buildSams: false,
        buildSilos: true,
        buildPorts: true,
        buildDefensePosts: true,
        allowAtomBombs: false,
        allowHydrogenBombs: true,
        allowMirv: false,
        triggerRatio: .41,
        reserveRatio: .42,
        expandRatio: .38,
        botParallelism: 80,
        autoAttack: true,
        autoExpand: true,
        autoDefend: true,
        autoBuild: true,
        autoNuke: true,
        autoSpawn: true,
        usePredeterminedSpawns: true,
        autoEmbargo: true,
        autoDonate: false,
        autoAlliance: false,
        autoBoat: true,
        autoWarship: true,
        winFixes: false,
        tickIntervalMs: 350
      },
      solo: {
        id: "solo",
        name: "Solo Impossible AI",
        mode: "solo",
        maxCities: 40,
        maxFactories: 20,
        maxSilos: 3,
        maxSams: 8,
        samRatio: .3,
        maxPorts: 3,
        maxDefensePosts: 5,
        buildCities: true,
        buildFactories: true,
        buildSams: true,
        buildSilos: true,
        buildPorts: true,
        buildDefensePosts: true,
        allowAtomBombs: true,
        allowHydrogenBombs: true,
        allowMirv: true,
        triggerRatio: .55,
        reserveRatio: .35,
        expandRatio: .15,
        botParallelism: 100,
        autoAttack: true,
        autoExpand: true,
        autoDefend: true,
        autoBuild: true,
        autoNuke: true,
        autoSpawn: true,
        usePredeterminedSpawns: false,
        autoEmbargo: true,
        autoDonate: true,
        autoAlliance: true,
        autoBoat: true,
        autoWarship: true,
        winFixes: true,
        tickIntervalMs: 300
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
      usePredeterminedSpawns: true,
      autoEmbargo: true,
      autoDonate: false,
      autoAlliance: false,
      autoEmoji: false,
      autoBoat: true,
      autoWarship: true,
      winFixes: true,
      buildCities: true,
      buildFactories: true,
      buildSams: false,
      buildSilos: true,
      buildPorts: false,
      buildDefensePosts: true,
      allowAtomBombs: false,
      allowHydrogenBombs: true,
      allowMirv: true,
      maxCities: 3,
      maxFactories: 0,
      maxSams: 0,
      samRatio: .35,
      maxSilos: 1,
      maxPorts: 1,
      maxDefensePosts: 4,
      triggerRatio: .5,
      reserveRatio: .42,
      expandRatio: .42,
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
      setCb("blon-ext-feat-pred-spawn", botCfg.usePredeterminedSpawns);
      setCb("blon-ext-feat-embargo", botCfg.autoEmbargo);
      setCb("blon-ext-feat-boat", botCfg.autoBoat);
      setCb("blon-ext-feat-warship", botCfg.autoWarship);
      setCb("blon-ext-feat-alliance", botCfg.autoAlliance);
      setCb("blon-ext-feat-donate", botCfg.autoDonate);
      setCb("blon-ext-feat-winfixes", botCfg.winFixes);
      setCb("blon-ext-feat-emoji", botCfg.autoEmoji);
      setCb("blon-ext-build-master", botCfg.autoBuild);
      setCb("blon-ext-build-cities", botCfg.buildCities);
      setCb("blon-ext-build-factories", botCfg.buildFactories);
      setCb("blon-ext-build-sams", botCfg.buildSams);
      setCb("blon-ext-build-silos", botCfg.buildSilos);
      setCb("blon-ext-build-ports", botCfg.buildPorts);
      setCb("blon-ext-build-defposts", botCfg.buildDefensePosts);
      setCb("blon-ext-feat-nuke", botCfg.autoNuke);
      setCb("blon-ext-nuke-atom", botCfg.allowAtomBombs);
      setCb("blon-ext-nuke-hbomb", botCfg.allowHydrogenBombs);
      setCb("blon-ext-nuke-mirv", botCfg.allowMirv);
      setSlider("blon-ext-max-cities-slider", "blon-ext-max-cities-val", botCfg.maxCities ?? 40);
      setSlider("blon-ext-max-factories-slider", "blon-ext-max-factories-val", botCfg.maxFactories ?? 20);
      setSlider("blon-ext-max-defposts-slider", "blon-ext-max-defposts-val", botCfg.maxDefensePosts ?? 5);
      setSlider("blon-ext-max-silos-slider", "blon-ext-max-silos-val", botCfg.maxSilos ?? 3);
      setSlider("blon-ext-max-sams-slider", "blon-ext-max-sams-val", botCfg.maxSams ?? 8);
      setSlider("blon-ext-max-ports-slider", "blon-ext-max-ports-val", botCfg.maxPorts ?? 3);
      setSlider("blon-ext-trigger-slider", "blon-ext-trigger-value", Math.round((botCfg.triggerRatio ?? .55) * 100), "%");
      setSlider("blon-ext-reserve-slider", "blon-ext-reserve-value", Math.round((botCfg.reserveRatio ?? .35) * 100), "%");
      setSlider("blon-ext-expand-slider", "blon-ext-expand-value", Math.round((botCfg.expandRatio ?? .15) * 100), "%");
      setSlider("blon-ext-parallel-slider", "blon-ext-parallel-value", botCfg.botParallelism ?? 100);
      setSlider("blon-ext-interval-slider", "blon-ext-interval-value", botCfg.tickIntervalMs ?? 300, "ms");
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
      GRIN: 0,
      SMILE: 1,
      LOVE: 2,
      ANGEL: 3,
      COOL: 4,
      DISAPPOINTED: 5,
      PLEADING: 6,
      CRYING: 7,
      SHOCKED: 8,
      ANGRY: 9,
      DEVIL: 10,
      CLOWN: 11,
      YAWN: 12,
      SALUTE: 13,
      MIDDLE_FINGER: 14,
      WAVE: 15,
      CLAP: 16,
      HAND: 17,
      PRAY: 18,
      FLEX: 19,
      THUMBS_UP: 20,
      THUMBS_DOWN: 21,
      PALM_UP: 22,
      PINCHED: 23,
      FACEPALM: 24,
      HANDSHAKE: 25,
      SOS: 26,
      DOVE: 27,
      WHITE_FLAG: 28,
      HOURGLASS: 29,
      FIRE: 30,
      BOOM: 31,
      SKULL: 32,
      RADIATION: 33,
      WARNING: 34,
      CROWN: 38,
      FIRST: 39,
      HEART: 48,
      BROKEN_HEART: 49,
      GOLD: 50,
      ANCHOR: 51,
      SAILBOAT: 52,
      HOUSE: 53,
      SHIELD: 54,
      FACTORY: 55,
      TRAIN: 56,
      QUESTION: 57,
      CHICKEN: 58,
      RAT: 59
    };
    function forEachNeighbor(game, tile, fn) {
      if (!game || tile == null) return;
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
      if (!myPlayer) return null;
      try {
        return typeof myPlayer.smallID === "function" ? myPlayer.smallID() : myPlayer.smallID ?? null;
      } catch (e) {
        return null;
      }
    }
    function getBorderTiles(game, myPlayer) {
      if (!game || !myPlayer) return new Set;
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
      if (!myID || !game) return new Set;
      const set = new Set;
      try {
        if (typeof myPlayer.tiles === "function") {
          const allTiles = myPlayer.tiles();
          const list = Array.isArray(allTiles) ? allTiles : allTiles instanceof Set ? Array.from(allTiles) : [];
          for (const tile of list) {
            let isBorder = false;
            forEachNeighbor(game, tile, (n => {
              if (isBorder) return;
              try {
                if (!game.isLand(n) || game.ownerID(n) !== myID) isBorder = true;
              } catch (e) {}
            }));
            if (isBorder) set.add(tile);
          }
        }
      } catch (e) {}
      return set;
    }
    function getBorderingPlayerIDs(game, myPlayer) {
      const myID = getMySmallID(myPlayer);
      if (!myID || !game) return new Map;
      const map = new Map;
      const bts = getBorderTiles(game, myPlayer);
      const scanNeighbors = tile => {
        forEachNeighbor(game, tile, (n => {
          try {
            const ownerID = game.ownerID(n);
            if (ownerID && ownerID > 0 && ownerID !== myID && !map.has(ownerID)) {
              const p = typeof game.playerBySmallID === "function" ? game.playerBySmallID(ownerID) : null;
              if (p) map.set(ownerID, p);
            }
          } catch (e) {}
        }));
      };
      for (const tile of bts) scanNeighbors(tile);
      return map;
    }
    function hasBorderWithTerraNullius(game, myPlayer) {
      const myID = getMySmallID(myPlayer);
      if (!myID || !game) return false;
      const bts = getBorderTiles(game, myPlayer);
      for (const tile of bts) {
        let found = false;
        forEachNeighbor(game, tile, (n => {
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
        }));
        if (found) return true;
      }
      return false;
    }
    function getMaxTroops(game, player) {
      if (!game || !player) return 1e3;
      try {
        const cfg = typeof game.config === "function" ? game.config() : null;
        if (cfg && typeof cfg.maxTroops === "function") return Number(cfg.maxTroops(player)) || 1e3;
      } catch (e) {}
      return 1e3;
    }
    function playerTroops(p) {
      if (!p) return 0;
      try {
        const t = typeof p.troops === "function" ? p.troops() : p.troops || 0;
        return typeof t === "bigint" ? Number(t) : Number(t || 0);
      } catch (e) {
        return 0;
      }
    }
    function playerGold(p) {
      if (!p) return 0;
      try {
        const g = typeof p.gold === "function" ? p.gold() : p.gold || 0;
        return typeof g === "bigint" ? Number(g) : Number(g || 0);
      } catch (e) {
        return 0;
      }
    }
    function playerType(p) {
      if (!p) return "";
      try {
        return typeof p.type === "function" ? p.type() : p.type || "";
      } catch (e) {
        return "";
      }
    }
    function isBot(p) {
      if (!p) return false;
      const t = playerType(p);
      return t === "BOT" || t === "NATION" || t === "Bot" || t === 2;
    }
    function isAlive(p) {
      if (!p) return false;
      try {
        return typeof p.isAlive === "function" ? p.isAlive() : true;
      } catch (e) {
        return false;
      }
    }
    function isFriendly(myPlayer, other) {
      if (!myPlayer || !other) return false;
      if (typeof other.isPlayer === "function" && !other.isPlayer()) return true;
      if (typeof api.isFriendlyPlayer === "function") {
        try {
          return api.isFriendlyPlayer(myPlayer, other);
        } catch (e) {}
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
      if (!p) return "Unknown";
      if (typeof api.getPlayerName === "function") return api.getPlayerName(p);
      try {
        return typeof p.displayName === "function" ? p.displayName() : typeof p.name === "function" ? p.name() : "Unknown";
      } catch (e) {
        return "Unknown";
      }
    }
    function getAllPlayers(game) {
      if (!game) return [];
      try {
        if (typeof api.getGamePlayers === "function") return api.getGamePlayers(game) || [];
        if (typeof game.players === "function") return game.players() || [];
      } catch (e) {}
      return [];
    }
    function playerOwnsStructures(p) {
      if (!p) return false;
      try {
        const units = typeof p.units === "function" ? p.units() : [];
        return units && units.length > 0;
      } catch (e) {
        return false;
      }
    }
    function playerUnits(p) {
      if (!p) return [];
      try {
        return typeof p.units === "function" ? p.units() : p.units || [];
      } catch (e) {
        return [];
      }
    }
    function unitType(u) {
      if (!u) return "";
      try {
        return typeof u.type === "function" ? u.type() : u.type || "";
      } catch (e) {
        return "";
      }
    }
    function calcTileDist(game, t1, t2) {
      if (t1 == null || t2 == null || !game) return Infinity;
      try {
        const w = typeof game.width === "function" ? game.width() : game.width || 500;
        const x1 = t1 % w, y1 = Math.floor(t1 / w);
        const x2 = t2 % w, y2 = Math.floor(t2 / w);
        return Math.hypot(x1 - x2, y1 - y2);
      } catch (e) {
        return Infinity;
      }
    }
    function getPlayerCenter(game, player) {
      if (!game || !player) return null;
      try {
        const w = typeof game.width === "function" ? game.width() : game.width || 500;
        const st = typeof player.spawnTile === "function" ? player.spawnTile() : player.spawnTile;
        if (st != null && typeof st === "number" && st >= 0) {
          return {
            x: st % w,
            y: Math.floor(st / w)
          };
        }
        const bts = getBorderTiles(game, player);
        const arr = Array.from(bts);
        if (arr.length === 0) return null;
        let sx = 0, sy = 0;
        const sample = Math.min(arr.length, 20);
        for (let i = 0; i < sample; i++) {
          const t = arr[Math.floor(i * arr.length / sample)];
          sx += t % w;
          sy += Math.floor(t / w);
        }
        return {
          x: sx / sample,
          y: sy / sample
        };
      } catch (e) {
        return null;
      }
    }
    function getInteriorTiles(game, myPlayer) {
      if (!game || !myPlayer) return [];
      const myID = getMySmallID(myPlayer);
      if (!myID) return [];
      const bts = getBorderTiles(game, myPlayer);
      const interiors = [];
      try {
        if (typeof myPlayer.tiles === "function") {
          const all = myPlayer.tiles();
          const list = Array.isArray(all) ? all : all instanceof Set ? Array.from(all) : [];
          for (const t of list) {
            if (!bts.has(t)) interiors.push(t);
          }
          if (interiors.length > 0) return interiors;
        }
      } catch (e) {}
      return interiors.length > 0 ? interiors : Array.from(bts);
    }
    function findInteriorTile(game, myPlayer) {
      if (!game || !myPlayer) return null;
      const ints = getInteriorTiles(game, myPlayer);
      if (ints.length > 0) {
        return ints[Math.floor(Math.random() * ints.length)];
      }
      const bts = Array.from(getBorderTiles(game, myPlayer));
      return bts[Math.floor(bts.length / 2)] || null;
    }
    function findOwnedShoreTile(game, myPlayer) {
      if (!game || !myPlayer) return null;
      const bts = getBorderTiles(game, myPlayer);
      for (const t of bts) {
        try {
          if (typeof game.isShore === "function" && game.isShore(t)) return t;
        } catch (e) {}
      }
      return null;
    }
    function findTargetShoreTile(game, target) {
      if (!game || !target) return null;
      const bts = getBorderTiles(game, target);
      for (const t of bts) {
        try {
          if (typeof game.isShore === "function" && game.isShore(t)) return t;
        } catch (e) {}
      }
      const arr = Array.from(bts);
      return arr[0] || null;
    }
    function findTargetCityTile(target) {
      if (!target) return null;
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
    function euclideanDist(game, t1, t2) {
      if (t1 == null || t2 == null) return Infinity;
      if (typeof game?.euclideanDist === "function") return game.euclideanDist(t1, t2);
      const w = typeof game?.width === "function" ? game.width() : game?.width || 500;
      const x1 = t1 % w, y1 = Math.floor(t1 / w);
      const x2 = t2 % w, y2 = Math.floor(t2 / w);
      return Math.hypot(x1 - x2, y1 - y2);
    }
    function euclideanDistSquared(game, t1, t2) {
      if (t1 == null || t2 == null) return Infinity;
      if (typeof game?.euclideanDistSquared === "function") return game.euclideanDistSquared(t1, t2);
      const w = typeof game?.width === "function" ? game.width() : game?.width || 500;
      const x1 = t1 % w, y1 = Math.floor(t1 / w);
      const x2 = t2 % w, y2 = Math.floor(t2 / w);
      const dx = x1 - x2, dy = y1 - y2;
      return dx * dx + dy * dy;
    }
    function manhattanDist(game, t1, t2) {
      if (t1 == null || t2 == null) return Infinity;
      if (typeof game?.manhattanDist === "function") return game.manhattanDist(t1, t2);
      const w = typeof game?.width === "function" ? game.width() : game?.width || 500;
      const x1 = t1 % w, y1 = Math.floor(t1 / w);
      const x2 = t2 % w, y2 = Math.floor(t2 / w);
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
    function closestTile(game, candidates, targetTile) {
      if (!candidates || candidates.length === 0 || targetTile == null) return [ null, Infinity ];
      let best = null;
      let minD = Infinity;
      for (const t of candidates) {
        const d = euclideanDistSquared(game, t, targetTile);
        if (d < minD) {
          minD = d;
          best = t;
        }
      }
      return [ best, Math.sqrt(minD) ];
    }
    function closestTwoTiles(game, listA, listB) {
      if (!listA || listA.length === 0 || !listB || listB.length === 0) return null;
      let bestA = null, bestB = null, minD = Infinity;
      for (const a of listA) {
        for (const b of listB) {
          const d = euclideanDistSquared(game, a, b);
          if (d < minD) {
            minD = d;
            bestA = a;
            bestB = b;
          }
        }
      }
      return bestA != null ? {
        x: bestA,
        y: bestB,
        dist: Math.sqrt(minD)
      } : null;
    }
    function randTerritoryTileArray(game, player, count = 25) {
      if (!player) return [];
      const ints = getInteriorTiles(game, player);
      const bts = Array.from(getBorderTiles(game, player));
      const pool = ints.concat(bts);
      if (pool.length === 0) return [];
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      return result;
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
      territoryRatio: .5,
      oppCentroidHistory: [],
      oppExpansionDir: null,
      update(opponent) {
        if (!opponent) return;
        const troops = playerTroops(opponent);
        const gold = playerGold(opponent);
        const tiles = typeof opponent.numTilesOwned === "function" ? Number(opponent.numTilesOwned()) || 0 : 0;
        const now = Date.now();
        if (this.lastTroops > 0 && troops < this.lastTroops * .78 && (this.lastTiles > 0 && tiles < this.lastTiles)) {
          this.isPunishWindow = true;
          this.punishExpiry = now + 1500;
        }
        if (now > this.punishExpiry) this.isPunishWindow = false;
        if (this.samples.length >= 3) {
          const oldest = this.samples[0];
          const dt = Math.max(1, (now - oldest.time) / 1e3);
          this.expansionRate = (tiles - oldest.tiles) / dt;
        }
        this.samples.push({
          troops: troops,
          gold: gold,
          tiles: tiles,
          time: now
        });
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
        this.territoryRatio = .5;
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
          this.oppCentroidHistory.push({
            x: oppCenter.x,
            y: oppCenter.y,
            time: Date.now()
          });
          if (this.oppCentroidHistory.length > 5) this.oppCentroidHistory.shift();
          if (this.oppCentroidHistory.length >= 2) {
            const oldest = this.oppCentroidHistory[0];
            const newest = this.oppCentroidHistory[this.oppCentroidHistory.length - 1];
            const dx = newest.x - oldest.x;
            const dy = newest.y - oldest.y;
            const mag = Math.hypot(dx, dy);
            this.oppExpansionDir = mag > 2 ? {
              x: dx / mag,
              y: dy / mag
            } : null;
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
        forEachNeighbor(game, tile, (n => {
          try {
            if (game.ownerID(n) === oppID) adj = true;
          } catch (e) {}
        }));
        if (adj) {
          sharedBorder.push(tile);
          let oppLandNeighbors = 0;
          forEachNeighbor(game, tile, (n => {
            try {
              if (game.ownerID(n) === oppID && game.isLand(n)) oppLandNeighbors++;
            } catch (e) {}
          }));
          if (oppLandNeighbors >= 3) weakPoints.push(tile);
        }
      }
      if (sharedBorder.length === 0) return null;
      let sx = 0, sy = 0;
      for (const t of sharedBorder) {
        sx += t % w;
        sy += Math.floor(t / w);
      }
      return {
        sharedBorder: sharedBorder,
        weakPoints: weakPoints,
        length: sharedBorder.length,
        midpoint: {
          x: sx / sharedBorder.length,
          y: sy / sharedBorder.length
        },
        vulnerability: weakPoints.length / Math.max(1, sharedBorder.length)
      };
    }
    function frontlineInDPRange(game, myPlayer, opponent) {
      const oppUnits = playerUnits(opponent);
      const oppDPs = oppUnits.filter((u => unitType(u) === "Defense Post"));
      if (oppDPs.length === 0) return false;
      const fl = analyzeFrontline(game, myPlayer, opponent);
      if (!fl || fl.sharedBorder.length === 0) return false;
      const dpRange = 35;
      for (const dp of oppDPs) {
        const dpTile = typeof dp.tile === "function" ? dp.tile() : dp.tile;
        if (dpTile == null) continue;
        for (const bt of fl.sharedBorder) {
          if (calcTileDist(game, dpTile, bt) <= dpRange) return true;
        }
      }
      return false;
    }
    function findCutTarget(game, opponent) {
      if (!opponent) return null;
      const oppID = getMySmallID(opponent);
      if (!oppID) return null;
      const oppBts = getBorderTiles(game, opponent);
      const w = typeof game.width === "function" ? game.width() : 500;
      let bestTile = null;
      let bestScore = -1;
      for (const tile of oppBts) {
        let emptyNeighbors = 0;
        let oppNeighbors = 0;
        forEachNeighbor(game, tile, (n => {
          try {
            const o = game.ownerID(n);
            if (!game.hasOwner(n) || o === null || o === undefined || o === 0 || o === -1) {
              if (game.isLand(n)) emptyNeighbors++;
            } else if (o === oppID) {
              oppNeighbors++;
            }
          } catch (e) {}
        }));
        if (emptyNeighbors >= 2 && oppNeighbors <= 2) {
          const x = tile % w, y = Math.floor(tile / w);
          let distFromEdge = Math.min(x, w - x, y);
          const score = emptyNeighbors * 10 - oppNeighbors * 5 + distFromEdge * .1;
          if (score > bestScore) {
            bestScore = score;
            bestTile = tile;
          }
        }
      }
      return bestTile;
    }
    function findEncirclementTarget(game, myPlayer, opponent) {
      if (!opponent || !myPlayer) return null;
      const myID = getMySmallID(myPlayer);
      const oppID = getMySmallID(opponent);
      if (!myID || !oppID) return null;
      const oppBts = getBorderTiles(game, opponent);
      const myBts = getBorderTiles(game, myPlayer);
      let bestTile = null;
      let maxEnclosed = 0;
      for (const bt of myBts) {
        let touchesOpp = false;
        forEachNeighbor(game, bt, (n => {
          try {
            if (game.ownerID(n) === oppID) touchesOpp = true;
          } catch (e) {}
        }));
        if (!touchesOpp) continue;
        let oppTilesNear = 0;
        let emptyTilesNear = 0;
        forEachNeighbor(game, bt, (n1 => {
          forEachNeighbor(game, n1, (n2 => {
            try {
              const o = game.ownerID(n2);
              if (o === oppID) oppTilesNear++; else if (!game.hasOwner(n2) || o === 0 || o === -1) emptyTilesNear++;
            } catch (e) {}
          }));
        }));
        if (emptyTilesNear > 0 && oppTilesNear > 5) {
          const score = oppTilesNear * 2 + emptyTilesNear;
          if (score > maxEnclosed) {
            maxEnclosed = score;
            bestTile = bt;
          }
        }
      }
      return bestTile ? {
        tile: bestTile,
        pocketSize: maxEnclosed
      } : null;
    }
    function findBotEncirclementPlan(game, myPlayer, bot) {
      if (!bot || !myPlayer) return null;
      const myID = getMySmallID(myPlayer);
      const botID = getMySmallID(bot);
      if (!myID || !botID) return null;
      const botBts = getBorderTiles(game, bot);
      if (botBts.size === 0) return null;
      let myBorderCount = 0;
      let otherPlayerCount = 0;
      const unownedNeighbors = new Set;
      const otherPlayerIDs = new Set;
      for (const tile of botBts) {
        forEachNeighbor(game, tile, (n => {
          try {
            if (!game.isLand(n)) return;
            const o = game.ownerID(n);
            if (o === myID) {
              myBorderCount++;
            } else if (!game.hasOwner(n) || o === null || o === undefined || o === 0 || o === -1) {
              unownedNeighbors.add(n);
            } else if (o !== botID) {
              otherPlayerCount++;
              otherPlayerIDs.add(o);
            }
          } catch (e) {}
        }));
      }
      const totalOuterBorder = myBorderCount + unownedNeighbors.size + otherPlayerCount;
      if (totalOuterBorder === 0) return null;
      const walledRatio = myBorderCount / totalOuterBorder;
      const botKillsNeeded = otherPlayerIDs.size;
      return {
        walledRatio: walledRatio,
        unownedCount: unownedNeighbors.size,
        botKillsNeeded: botKillsNeeded,
        otherPlayerIDs: Array.from(otherPlayerIDs),
        unownedTiles: Array.from(unownedNeighbors)
      };
    }
    function findOurVulnerableNecks(game, myPlayer, opponent) {
      if (!myPlayer || !opponent) return [];
      const myID = getMySmallID(myPlayer);
      const oppID = getMySmallID(opponent);
      if (!myID || !oppID) return [];
      const myBts = getBorderTiles(game, myPlayer);
      const vulnerableTiles = [];
      for (const tile of myBts) {
        let oppCount = 0;
        let emptyCount = 0;
        let myCount = 0;
        forEachNeighbor(game, tile, (n => {
          try {
            const o = game.ownerID(n);
            if (o === oppID) oppCount++; else if (o === myID) myCount++; else if (!game.hasOwner(n) || o === 0 || o === -1) emptyCount++;
          } catch (e) {}
        }));
        if (oppCount >= 2 && myCount <= 1) {
          vulnerableTiles.push({
            tile: tile,
            threat: oppCount * 2 + emptyCount
          });
        }
      }
      vulnerableTiles.sort(((a, b) => b.threat - a.threat));
      return vulnerableTiles.map((v => v.tile));
    }
    function getGamePhase(game) {
      try {
        const turn = typeof game.turnNumber === "function" ? game.turnNumber() : 0;
        if (turn < 300) return "early";
        if (turn < 900) return "mid";
        return "late";
      } catch (e) {
        return "mid";
      }
    }
    function getDynamicReserve(game, myPlayer, opponent, phase) {
      const base = botCfg.reserveRatio ?? .42;
      const fl = analyzeFrontline(game, myPlayer, opponent);
      let flMod = 0;
      if (fl && fl.vulnerability > .3) flMod = .08;
      let punishMod = OppTracker.isPunishWindow ? -.08 : 0;
      let phaseMod = phase === "early" ? -.05 : phase === "late" ? .05 : 0;
      return Math.max(.2, Math.min(.65, base + flMod + punishMod + phaseMod));
    }
    function find1v1CityTile(game, myPlayer, existingCities = [], opponent = null) {
      const ints = getInteriorTiles(game, myPlayer);
      if (ints.length === 0) return findInteriorTile(game, myPlayer);
      const w = typeof game.width === "function" ? game.width() : 500;
      const oppCenter = opponent ? getPlayerCenter(game, opponent) : null;
      const myBts = getBorderTiles(game, myPlayer);
      let bestTile = null;
      let bestScore = -Infinity;
      const minSpacing = 16;
      for (const tile of ints) {
        let tooClose = false;
        for (const c of existingCities) {
          const cTile = typeof c.tile === "function" ? c.tile() : c.tile;
          if (cTile != null && calcTileDist(game, tile, cTile) < minSpacing) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;
        let distToBorder = Infinity;
        for (const bt of myBts) {
          const d = calcTileDist(game, tile, bt);
          if (d < distToBorder) distToBorder = d;
        }
        let oppDist = 0;
        if (oppCenter) {
          const x = tile % w, y = Math.floor(tile / w);
          oppDist = Math.hypot(x - oppCenter.x, y - oppCenter.y);
        }
        const score = distToBorder * 2 + oppDist * 1.5;
        if (score > bestScore) {
          bestScore = score;
          bestTile = tile;
        }
      }
      return bestTile || ints[0] || null;
    }
    function find1v1DefensePostTile(game, myPlayer, opponent, existingDPs = [], activeAttacks = []) {
      const fl = analyzeFrontline(game, myPlayer, opponent);
      const myBts = getBorderTiles(game, myPlayer);
      const candidates = fl && fl.sharedBorder.length > 0 ? fl.sharedBorder : Array.from(myBts);
      if (candidates.length === 0) return findInteriorTile(game, myPlayer);
      const minSpacing = 28;
      let bestTile = null;
      let bestScore = -Infinity;
      for (const tile of candidates) {
        let tooClose = false;
        for (const dp of existingDPs) {
          const dpTile = typeof dp.tile === "function" ? dp.tile() : dp.tile;
          if (dpTile != null && calcTileDist(game, tile, dpTile) < minSpacing) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;
        let isWeak = fl && fl.weakPoints.includes(tile) ? 20 : 0;
        let underAttackBonus = 0;
        for (const atk of activeAttacks) {
          const src = typeof atk.sourceTile === "function" ? atk.sourceTile() : null;
          if (src != null && calcTileDist(game, tile, src) < 40) underAttackBonus += 15;
        }
        const score = isWeak + underAttackBonus;
        if (score > bestScore) {
          bestScore = score;
          bestTile = tile;
        }
      }
      return bestTile || candidates[0] || null;
    }
    function find1v1SiloTile(game, myPlayer, opponent) {
      const ints = getInteriorTiles(game, myPlayer);
      if (ints.length === 0) return findInteriorTile(game, myPlayer);
      const w = typeof game.width === "function" ? game.width() : 500;
      const oppCenter = opponent ? getPlayerCenter(game, opponent) : null;
      let bestTile = null;
      let maxDist = -1;
      for (const tile of ints) {
        let dist = 0;
        if (oppCenter) {
          const x = tile % w, y = Math.floor(tile / w);
          dist = Math.hypot(x - oppCenter.x, y - oppCenter.y);
        } else {
          dist = Math.random() * 100;
        }
        if (dist > maxDist) {
          maxDist = dist;
          bestTile = tile;
        }
      }
      return bestTile || ints[0] || null;
    }
    function find1v1FlankShoreTile(game, myPlayer, opponent) {
      const oppBts = getBorderTiles(game, opponent);
      const w = typeof game.width === "function" ? game.width() : 500;
      const myCenter = getPlayerCenter(game, myPlayer);
      const oppCenter = getPlayerCenter(game, opponent);
      const oppDPs = playerUnits(opponent).filter((u => unitType(u) === "Defense Post"));
      const shoreCandidates = [];
      for (const tile of oppBts) {
        if (typeof game.isShore === "function" && game.isShore(tile)) {
          const x = tile % w, y = Math.floor(tile / w);
          let inDPRange = false;
          for (const dp of oppDPs) {
            const dpTile = typeof dp.tile === "function" ? dp.tile() : dp.tile;
            if (dpTile != null && calcTileDist(game, tile, dpTile) < 35) {
              inDPRange = true;
              break;
            }
          }
          if (inDPRange) continue;
          let distFromFront = 0;
          if (myCenter && oppCenter) {
            const mx = (myCenter.x + oppCenter.x) / 2;
            const my = (myCenter.y + oppCenter.y) / 2;
            distFromFront = Math.hypot(x - mx, y - my);
          }
          shoreCandidates.push({
            tile: tile,
            distFromFront: distFromFront
          });
        }
      }
      if (shoreCandidates.length === 0) return findTargetShoreTile(game, opponent);
      shoreCandidates.sort(((a, b) => b.distFromFront - a.distFromFront));
      return shoreCandidates[0].tile;
    }
    function find1v1NukeTarget(game, opponent, prioritizeDPs = true) {
      const units = playerUnits(opponent);
      if (prioritizeDPs) {
        const dps = units.filter((u => unitType(u) === "Defense Post"));
        if (dps.length > 0) {
          const tile = typeof dps[0].tile === "function" ? dps[0].tile() : dps[0].tile;
          if (tile != null) return tile;
        }
      }
      const cities = units.filter((u => unitType(u) === "City"));
      if (cities.length > 0) {
        const tile = typeof cities[0].tile === "function" ? cities[0].tile() : cities[0].tile;
        if (tile != null) return tile;
      }
      const silos = units.filter((u => unitType(u) === "Missile Silo"));
      if (silos.length > 0) {
        const tile = typeof silos[0].tile === "function" ? silos[0].tile() : silos[0].tile;
        if (tile != null) return tile;
      }
      return findTargetShoreTile(game, opponent);
    }
    function getEffectiveReserveRatio(game, myPlayer, baseReserveRatio) {
      if (!botCfg.winFixes) return baseReserveRatio ?? .35;
      try {
        const totalLand = typeof game.numLandTiles === "function" ? game.numLandTiles() : 5e4;
        const myTiles = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) || 1 : 1;
        const territoryShare = myTiles / Math.max(1, totalLand);
        const scale = .5;
        const cap = .6;
        return Math.max(baseReserveRatio ?? .35, Math.min(cap, territoryShare * scale));
      } catch (e) {
        return baseReserveRatio ?? .35;
      }
    }
    function calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackSent = 0, reserveRatio = null) {
      const effReserve = getEffectiveReserveRatio(game, myPlayer, reserveRatio ?? (botCfg.reserveRatio ?? .35));
      const reserve = maxTroops * effReserve;
      let available = Math.max(0, myTroops - reserve - botAttackSent);
      if (available <= 0) return 0;
      if (!target || !target.isPlayer || !target.isPlayer()) {
        const expandFloor = maxTroops * (botCfg.expandRatio ?? .15);
        const availExpand = myTroops - expandFloor;
        if (availExpand <= 0) return 0;
        return Math.floor(Math.min(availExpand, Math.max(maxTroops * .04, myTroops * .3)));
      }
      const targetTroops = playerTroops(target);
      const needed = Math.ceil(targetTroops * 1.15 + 50);
      if (available >= needed) return needed;
      return available;
    }
    function sendLandAttack(game, myPlayer, target, myTroops, maxTroops, botAttackSent = 0, reserveRatio = null) {
      const sendAmt = calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackSent, reserveRatio);
      if (sendAmt < 1) return false;
      const targetID = target && (typeof target.isPlayer === "function" ? target.isPlayer() : true) ? typeof target.id === "function" ? target.id() : target.id : null;
      return sendPacket({
        type: "attack",
        targetID: targetID ? String(targetID) : null,
        troops: sendAmt
      });
    }
    const ImpossibleAI = {
      UPGRADE_DENSITY_THRESHOLD: 1 / 1500,
      HIGH_NATION_DENSITY_THRESHOLD: 1 / 7500,
      UNDER_ATTACK_THREAT_RATIO: .35,
      HIGH_STARTING_GOLD_THRESHOLD: 3e6,
      BOAT_SPREAD_RADIUS: 30,
      recentMirvHits: [],
      recentSentNukes: [],
      inflightBoatTargets: [],
      beachhead: null,
      lastFarAllyMs: 0,
      lastDonateMs: 0,
      lastOppBoatMs: 0,
      lastAttackRate: 40,
      attackTickCounter: 0,
      Structure: {
        cost(unit, myPlayer) {
          const units = playerUnits(myPlayer);
          const countOf = type => units.filter((u => unitType(u) === type)).length;
          switch (unit) {
           case "Port":
           case "Factory":
            {
              const total = countOf("Port") + countOf("Factory");
              return Math.min(1e6, Math.pow(2, total) * 125e3);
            }

           case "City":
            {
              const cities = countOf("City");
              return Math.min(1e6, Math.pow(2, cities) * 125e3);
            }

           case "SAM Launcher":
            {
              const sams = countOf("SAM Launcher");
              return Math.min(3e6, (sams + 1) * 15e5);
            }

           case "Missile Silo":
            return 1e6;

           case "Defense Post":
            {
              const dps = countOf("Defense Post");
              return Math.min(25e4, (dps + 1) * 5e4);
            }

           case "Atom Bomb":
            return 75e4;

           case "Hydrogen Bomb":
            return 5e6;

           case "MIRV":
            return 25e6;

           case "Warship":
            {
              const ws = countOf("Warship");
              return Math.min(1e6, (ws + 1) * 25e4);
            }

           default:
            return 0;
          }
        },
        getSaveUpTarget(game, myPlayer) {
          const gold = playerGold(myPlayer);
          const hasSilo = playerUnits(myPlayer).some((u => unitType(u) === "Missile Silo"));
          if (botCfg.allowMirv && (gold >= 15e6 || hasSilo)) return 25e6;
          if (botCfg.allowHydrogenBombs && hasSilo) return 5e6;
          if (botCfg.buildSams && playerUnits(myPlayer).filter((u => unitType(u) === "SAM Launcher")).length === 0) return 15e5;
          return 0;
        },
        getPerceivedCost(unit, myPlayer, saveUpTarget) {
          const baseCost = this.cost(unit, myPlayer);
          const gold = playerGold(myPlayer);
          if (saveUpTarget === 0 || gold >= saveUpTarget) return baseCost;
          const units = playerUnits(myPlayer);
          const owned = units.filter((u => unitType(u) === unit)).length;
          const mult = 1 + .5 * owned;
          return Math.ceil(baseCost * mult);
        },
        sampleTilesNearFront(game, myPlayer, frontTiles, count = 20) {
          if (!frontTiles || frontTiles.length === 0) return [];
          const myID = getMySmallID(myPlayer);
          const w = typeof game.width === "function" ? game.width() : 500;
          const h = typeof game.height === "function" ? game.height() : 500;
          const candidates = [];
          const spacing = 8;
          for (let i = 0; i < count * 4 && candidates.length < count; i++) {
            const base = frontTiles[Math.floor(Math.random() * frontTiles.length)];
            const bx = base % w, by = Math.floor(base / w);
            const nx = bx + (Math.floor(Math.random() * (spacing * 2 + 1)) - spacing);
            const ny = by + (Math.floor(Math.random() * (spacing * 2 + 1)) - spacing);
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const tile = ny * w + nx;
              try {
                if (game.ownerID(tile) === myID && game.isLand(tile)) {
                  candidates.push(tile);
                }
              } catch (e) {}
            }
          }
          return candidates.length > 0 ? candidates : frontTiles;
        },
        tryBuildDefensePost(game, myPlayer) {
          if (!botCfg.buildDefensePosts) return false;
          const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
          if (incoming.length === 0) return false;
          const myTr = playerTroops(myPlayer);
          if (myTr <= 0) return false;
          const totalInc = incoming.reduce(((s, a) => s + (typeof a.troops === "function" ? Number(a.troops()) : Number(a.troops || 0))), 0);
          if (totalInc / myTr < ImpossibleAI.UNDER_ATTACK_THREAT_RATIO) return false;
          const gold = playerGold(myPlayer);
          const cost = this.cost("Defense Post", myPlayer);
          if (gold < cost) return false;
          const units = playerUnits(myPlayer);
          const dps = units.filter((u => unitType(u) === "Defense Post"));
          const maxPosts = botCfg.maxDefensePosts ?? 5;
          if (dps.length >= maxPosts) return false;
          const attackerSmallIDs = new Set(incoming.map((a => {
            const att = typeof a.attacker === "function" ? a.attacker() : a.attacker;
            return att ? getMySmallID(att) : null;
          })).filter((id => id != null)));
          const myBts = getBorderTiles(game, myPlayer);
          const frontline = [];
          for (const bt of myBts) {
            let facingAttacker = false;
            forEachNeighbor(game, bt, (n => {
              try {
                const o = game.ownerID(n);
                if (o && attackerSmallIDs.has(o)) facingAttacker = true;
              } catch (e) {}
            }));
            if (facingAttacker) frontline.push(bt);
          }
          const targetTiles = this.sampleTilesNearFront(game, myPlayer, frontline.length > 0 ? frontline : Array.from(myBts), 15);
          for (const tile of targetTiles) {
            const tooClose = dps.some((dp => {
              const t = typeof dp.tile === "function" ? dp.tile() : dp.tile;
              return t != null && calcTileDist(game, tile, t) < 18;
            }));
            if (tooClose) continue;
            if (sendPacket({
              type: "build_unit",
              unit: "Defense Post",
              tile: tile
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          return false;
        },
        findBestStructureToUpgrade(game, myPlayer, upgradableUnits) {
          if (!upgradableUnits || upgradableUnits.length === 0) return null;
          const sams = playerUnits(myPlayer).filter((u => unitType(u) === "SAM Launcher"));
          let bestUnit = null;
          let bestScore = -Infinity;
          for (const u of upgradableUnits) {
            const tile = typeof u.tile === "function" ? u.tile() : u.tile;
            if (tile == null) continue;
            let samProtectionScore = 0;
            for (const sam of sams) {
              const sTile = typeof sam.tile === "function" ? sam.tile() : sam.tile;
              if (sTile == null) continue;
              const lvl = typeof sam.level === "function" ? sam.level() : sam.level || 1;
              const range = lvl * 15 + 45;
              if (calcTileDist(game, tile, sTile) <= range) {
                samProtectionScore += 10 + lvl * 5;
              }
            }
            const typeWeight = unitType(u) === "Missile Silo" ? 30 : unitType(u) === "City" ? 20 : 15;
            const score = samProtectionScore + typeWeight + Math.random() * 5;
            if (score > bestScore) {
              bestScore = score;
              bestUnit = u;
            }
          }
          return bestUnit || upgradableUnits[0];
        },
        handleStructures(game, myPlayer) {
          if (!botCfg.autoBuild) return false;
          if (this.tryBuildDefensePost(game, myPlayer)) return true;
          const gold = playerGold(myPlayer);
          const saveUpTarget = this.getSaveUpTarget(game, myPlayer);
          const units = playerUnits(myPlayer);
          const countOf = type => units.filter((u => unitType(u) === type)).length;
          const cities = countOf("City");
          const factories = countOf("Factory");
          const sams = countOf("SAM Launcher");
          const silos = countOf("Missile Silo");
          const ports = countOf("Port");
          const myTiles = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) || 1 : 1;
          const density = units.length / Math.max(1, myTiles);
          const isHighGold = gold >= ImpossibleAI.HIGH_STARTING_GOLD_THRESHOLD;
          if (isHighGold && sams === 0 && botCfg.buildSams) {
            const interior = findInteriorTile(game, myPlayer);
            if (interior != null && sendPacket({
              type: "build_unit",
              unit: "SAM Launcher",
              tile: interior
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          if (density > ImpossibleAI.UPGRADE_DENSITY_THRESHOLD && units.length > 0 && Math.random() < .4) {
            const upgradables = units.filter((u => {
              const lvl = typeof u.level === "function" ? u.level() : u.level || 1;
              return lvl < 5;
            }));
            if (upgradables.length > 0) {
              const bestToUpgrade = this.findBestStructureToUpgrade(game, myPlayer, upgradables);
              if (bestToUpgrade) {
                const uTile = typeof bestToUpgrade.tile === "function" ? bestToUpgrade.tile() : bestToUpgrade.tile;
                const uType = unitType(bestToUpgrade);
                const cost = this.cost(uType, myPlayer);
                if (gold >= cost && uTile != null) {
                  if (sendPacket({
                    type: "build_unit",
                    unit: uType,
                    tile: uTile
                  })) {
                    Engine.stats.structuresBuilt++;
                    return true;
                  }
                }
              }
            }
          }
          const wantPorts = Math.min(botCfg.maxPorts ?? 3, Math.max(1, Math.floor(cities * .75)));
          const wantFactories = Math.min(botCfg.maxFactories ?? 20, Math.max(1, Math.floor(cities * .75)));
          const wantSams = Math.min(botCfg.maxSams ?? 8, Math.max(1, Math.floor(cities * (botCfg.samRatio ?? .3))));
          const wantSilos = Math.min(botCfg.maxSilos ?? 3, silos === 0 ? cities >= 2 ? 1 : 0 : Math.floor(cities * .2));
          const maxCities = botCfg.maxCities ?? 40;
          if (botCfg.buildPorts && ports < wantPorts && gold >= this.getPerceivedCost("Port", myPlayer, saveUpTarget)) {
            const shore = findOwnedShoreTile(game, myPlayer);
            if (shore != null && sendPacket({
              type: "build_unit",
              unit: "Port",
              tile: shore
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          if (botCfg.buildSams && sams < wantSams && gold >= this.getPerceivedCost("SAM Launcher", myPlayer, saveUpTarget)) {
            const interior = findInteriorTile(game, myPlayer);
            if (interior != null && sendPacket({
              type: "build_unit",
              unit: "SAM Launcher",
              tile: interior
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          if (botCfg.buildSilos && silos < wantSilos && gold >= this.getPerceivedCost("Missile Silo", myPlayer, saveUpTarget)) {
            const interior = findInteriorTile(game, myPlayer);
            if (interior != null && sendPacket({
              type: "build_unit",
              unit: "Missile Silo",
              tile: interior
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          if (botCfg.buildFactories && factories < wantFactories && gold >= this.getPerceivedCost("Factory", myPlayer, saveUpTarget)) {
            const interior = findInteriorTile(game, myPlayer);
            if (interior != null && sendPacket({
              type: "build_unit",
              unit: "Factory",
              tile: interior
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          if (botCfg.buildCities && cities < maxCities && gold >= this.getPerceivedCost("City", myPlayer, saveUpTarget)) {
            const interior = findInteriorTile(game, myPlayer);
            if (interior != null && sendPacket({
              type: "build_unit",
              unit: "City",
              tile: interior
            })) {
              Engine.stats.structuresBuilt++;
              return true;
            }
          }
          return false;
        }
      },
      Attack: {
        effectiveReserveRatio(game, myPlayer, baseReserve) {
          if (!botCfg.winFixes) return baseReserve ?? .35;
          try {
            const totalLand = typeof game.numLandTiles === "function" ? game.numLandTiles() : 5e4;
            const myTiles = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) || 1 : 1;
            const territoryShare = myTiles / Math.max(1, totalLand);
            return Math.max(baseReserve ?? .35, Math.min(.6, territoryShare * .5));
          } catch (e) {
            return baseReserve ?? .35;
          }
        },
        calculateBotAttackTroops(bot, availableBudget) {
          const botTr = playerTroops(bot);
          const botTiles = typeof bot.numTilesOwned === "function" ? Number(bot.numTilesOwned()) || 1 : 1;
          const needed = Math.ceil(botTr * 1.25 + botTiles * 2.5 + 50);
          if (availableBudget >= needed) return needed;
          if (availableBudget >= Math.max(50, botTr * .9)) return availableBudget;
          return 0;
        },
        attackBots(game, myPlayer, bots, availableBudget) {
          if (!bots || bots.length === 0 || availableBudget < 1) return false;
          let attacked = 0;
          const cap = Math.max(1, Math.min(100, botCfg.botParallelism || 100));
          bots.sort(((a, b) => {
            const aTr = playerTroops(a), bTr = playerTroops(b);
            const aTiles = typeof a.numTilesOwned === "function" ? Number(a.numTilesOwned()) || 1 : 1;
            const bTiles = typeof b.numTilesOwned === "function" ? Number(b.numTilesOwned()) || 1 : 1;
            return aTr / aTiles - bTr / bTiles;
          }));
          for (const bot of bots.slice(0, cap)) {
            if (availableBudget <= 0) break;
            const botId = typeof bot.id === "function" ? bot.id() : bot.id;
            const sendAmt = this.calculateBotAttackTroops(bot, availableBudget);
            if (sendAmt >= 1) {
              if (sendPacket({
                type: "attack",
                targetID: String(botId),
                troops: sendAmt
              })) {
                attacked++;
                availableBudget -= sendAmt;
                Engine.botAttackTroopsSent += sendAmt;
                Engine.stats.attacksSent++;
                Engine.stats.troopsSentTotal += sendAmt;
              }
            }
          }
          return attacked > 0;
        },
        donateTroops(game, myPlayer) {
          if (!botCfg.autoDonate) return false;
          const now = Date.now();
          if (now - ImpossibleAI.lastDonateMs < 3e3) return false;
          ImpossibleAI.lastDonateMs = now;
          const isTeam = typeof game.config === "function" && game.config()?.gameConfig?.()?.gameMode === "Team";
          if (!isTeam) return false;
          const myTr = playerTroops(myPlayer);
          const maxTr = getMaxTroops(game, myPlayer);
          const reserve = maxTr * (botCfg.reserveRatio ?? .35);
          const excess = myTr - reserve;
          if (excess < maxTr * .05) return false;
          const all = getAllPlayers(game);
          const allies = all.filter((p => isFriendly(myPlayer, p) && isAlive(p) && getMySmallID(p) !== getMySmallID(myPlayer)));
          if (allies.length === 0) return false;
          const needEntries = allies.map((p => {
            const pMax = getMaxTroops(game, p);
            const pTr = playerTroops(p);
            const ratio = pTr / Math.max(1, pMax);
            const inCombat = typeof p.incomingAttacks === "function" && p.incomingAttacks().length > 0 || typeof p.outgoingAttacks === "function" && p.outgoingAttacks().length > 0;
            return {
              player: p,
              ratio: ratio,
              inCombat: inCombat
            };
          })).filter((e => e.ratio < .8));
          if (needEntries.length === 0) return false;
          needEntries.sort(((a, b) => {
            if (a.inCombat !== b.inCombat) return a.inCombat ? -1 : 1;
            return a.ratio - b.ratio;
          }));
          const targetAlly = needEntries[0].player;
          const allyId = typeof targetAlly.id === "function" ? targetAlly.id() : targetAlly.id;
          const donateAmt = Math.floor(Math.min(excess, myTr * .2));
          if (donateAmt > 1e3 && allyId) {
            if (sendPacket({
              type: "donate_troops",
              recipient: String(allyId),
              troops: donateAmt
            })) {
              if (botCfg.autoEmoji === true) sendPacket({
                type: "emoji",
                recipient: String(allyId),
                emoji: EMOJI_IDX.HEART
              });
              return true;
            }
          }
          return false;
        },
        findTraitor(game, myPlayer, enemies) {
          return enemies.find((e => {
            try {
              return typeof e.isTraitor === "function" && e.isTraitor() && playerTroops(e) < playerTroops(myPlayer) * 1.2;
            } catch (err) {
              return false;
            }
          })) || null;
        },
        findVeryWeakEnemy(game, myPlayer, enemies) {
          return enemies.find((e => {
            const eMax = getMaxTroops(game, e);
            return playerTroops(e) < eMax * .15 && playerTroops(e) < playerTroops(myPlayer) * 1.2;
          })) || null;
        },
        findFFALeader(game, myPlayer) {
          const all = getAllPlayers(game);
          const enemies = all.filter((p => !isFriendly(myPlayer, p) && isAlive(p)));
          if (enemies.length === 0) return null;
          enemies.sort(((a, b) => {
            const aTiles = typeof a.numTilesOwned === "function" ? Number(a.numTilesOwned()) || 0 : 0;
            const bTiles = typeof b.numTilesOwned === "function" ? Number(b.numTilesOwned()) || 0 : 0;
            return bTiles - aTiles;
          }));
          const leader = enemies[0];
          const myTiles = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) || 1 : 1;
          const leadTiles = typeof leader.numTilesOwned === "function" ? Number(leader.numTilesOwned()) || 0 : 0;
          if (leadTiles > myTiles * 1.3) return leader;
          return null;
        },
        findDominantEnemyTeam(game, myPlayer) {
          const all = getAllPlayers(game);
          const teamMap = new Map;
          for (const p of all) {
            if (!isAlive(p)) continue;
            const team = typeof p.team === "function" ? p.team() : null;
            if (team === null || isFriendly(myPlayer, p)) continue;
            const tiles = typeof p.numTilesOwned === "function" ? Number(p.numTilesOwned()) || 0 : 0;
            teamMap.set(team, (teamMap.get(team) || 0) + tiles);
          }
          if (teamMap.size === 0) return null;
          const sorted = Array.from(teamMap.entries()).sort(((a, b) => b[1] - a[1]));
          const topTeam = sorted[0][0];
          const teamPlayers = all.filter((p => isAlive(p) && typeof p.team === "function" && p.team() === topTeam));
          teamPlayers.sort(((a, b) => playerTroops(a) - playerTroops(b)));
          return teamPlayers[0] || null;
        },
        handleAttacks(game, myPlayer) {
          const myTroops = playerTroops(myPlayer);
          if (myTroops <= 0) return;
          const maxTroops = getMaxTroops(game, myPlayer);
          const triggerRatio = botCfg.triggerRatio ?? .55;
          const reserveRatio = botCfg.reserveRatio ?? .35;
          const expandRatio = botCfg.expandRatio ?? .15;
          const effReserve = this.effectiveReserveRatio(game, myPlayer, reserveRatio);
          const troopRatio = myTroops / maxTroops;
          const borderingMap = getBorderingPlayerIDs(game, myPlayer);
          const borderingPlayers = Array.from(borderingMap.values()).filter((p => isAlive(p)));
          const borderingEnemies = borderingPlayers.filter((p => !isFriendly(myPlayer, p)));
          borderingEnemies.sort(((a, b) => playerTroops(a) - playerTroops(b)));
          const borderingBots = borderingEnemies.filter((p => isBot(p)));
          const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
          if (incoming.length > 0) {
            for (const atk of incoming) {
              const attacker = typeof atk.attacker === "function" ? atk.attacker() : atk.attacker;
              if (attacker && !isFriendly(myPlayer, attacker) && isAlive(attacker)) {
                if (sendLandAttack(game, myPlayer, attacker, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
                  Engine.lastAttackMs = Date.now();
                  Engine.stats.attacksSent++;
                  return;
                }
              }
            }
          }
          if (botCfg.autoAttack && borderingBots.length > 0) {
            const availBudget = Math.max(0, myTroops - maxTroops * effReserve - Engine.botAttackTroopsSent);
            if (availBudget > 0 && this.attackBots(game, myPlayer, borderingBots, availBudget)) {
              return;
            }
          }
          if (this.donateTroops(game, myPlayer)) return;
          if (botCfg.autoBoat) {
            ImpossibleAI.Naval.handleOpportunisticBoats(game, myPlayer);
          }
          if (botCfg.autoExpand && hasBorderWithTerraNullius(game, myPlayer)) {
            const now = Date.now();
            if (now - Engine.lastExpandMs >= 700) {
              const expandReserve = maxTroops * expandRatio;
              const available = myTroops - expandReserve;
              if (available > 0) {
                const troopsToSend = Math.floor(Math.min(available, Math.max(maxTroops * .04, myTroops * .3)));
                if (troopsToSend >= Math.max(1, maxTroops * .02)) {
                  if (sendPacket({
                    type: "attack",
                    targetID: null,
                    troops: troopsToSend
                  })) {
                    Engine.lastExpandMs = now;
                    Engine.stats.attacksSent++;
                    Engine.stats.expandsDone++;
                    Engine.stats.troopsSentTotal += troopsToSend;
                    return;
                  }
                }
              }
            }
          }
          if (!botCfg.autoAttack || troopRatio < effReserve) return;
          const now = Date.now();
          if (now - Engine.lastAttackMs < 1e3) return;
          const veryWeak = this.findVeryWeakEnemy(game, myPlayer, borderingEnemies);
          if (veryWeak && sendLandAttack(game, myPlayer, veryWeak, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
            Engine.lastAttackMs = now;
            Engine.stats.attacksSent++;
            if (botCfg.autoEmoji === true) sendPacket({
              type: "emoji",
              recipient: String(getMySmallID(veryWeak)),
              emoji: EMOJI_IDX.DEVIL
            });
            return;
          }
          const traitor = this.findTraitor(game, myPlayer, borderingEnemies);
          if (traitor && sendLandAttack(game, myPlayer, traitor, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
            Engine.lastAttackMs = now;
            Engine.stats.attacksSent++;
            if (botCfg.autoEmoji === true) sendPacket({
              type: "emoji",
              recipient: String(getMySmallID(traitor)),
              emoji: EMOJI_IDX.ANGRY
            });
            return;
          }
          const disconnectedEnemy = borderingEnemies.find((e => {
            try {
              return typeof e.isDisconnected === "function" && e.isDisconnected();
            } catch (err) {
              return false;
            }
          }));
          if (disconnectedEnemy && sendLandAttack(game, myPlayer, disconnectedEnemy, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
            Engine.lastAttackMs = now;
            Engine.stats.attacksSent++;
            return;
          }
          if (troopRatio >= triggerRatio) {
            const ffaLeader = this.findFFALeader(game, myPlayer);
            if (ffaLeader && borderingEnemies.some((e => getMySmallID(e) === getMySmallID(ffaLeader)))) {
              if (sendLandAttack(game, myPlayer, ffaLeader, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
                Engine.lastAttackMs = now;
                Engine.stats.attacksSent++;
                return;
              }
            }
            const domTeamEnemy = this.findDominantEnemyTeam(game, myPlayer);
            if (domTeamEnemy && borderingEnemies.some((e => getMySmallID(e) === getMySmallID(domTeamEnemy)))) {
              if (sendLandAttack(game, myPlayer, domTeamEnemy, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
                Engine.lastAttackMs = now;
                Engine.stats.attacksSent++;
                return;
              }
            }
            if (borderingEnemies.length > 0) {
              const weakest = borderingEnemies[0];
              if (playerTroops(weakest) < myTroops) {
                if (sendLandAttack(game, myPlayer, weakest, myTroops, maxTroops, Engine.botAttackTroopsSent, reserveRatio)) {
                  Engine.lastAttackMs = now;
                  Engine.stats.attacksSent++;
                  return;
                }
              }
            }
          }
          if (borderingEnemies.length === 0 && botCfg.autoBoat) {
            const allPlayers = getAllPlayers(game);
            const remotes = allPlayers.filter((p => !isFriendly(myPlayer, p) && isAlive(p)));
            if (remotes.length > 0) {
              remotes.sort(((a, b) => playerTroops(a) - playerTroops(b)));
              const target = remotes[0];
              const destTile = findTargetCityTile(target) || findTargetShoreTile(game, target);
              if (destTile != null) {
                const boatTroops = Math.floor(Math.min(myTroops * .15, 2e5));
                if (boatTroops > 1e3) {
                  if (sendPacket({
                    type: "boat",
                    dst: destTile,
                    troops: boatTroops
                  })) {
                    Engine.lastAttackMs = now;
                    Engine.stats.attacksSent++;
                    Engine.stats.boatsSent++;
                  }
                }
              }
            }
          }
        }
      },
      Naval: {
        isTargetTileTaken(game, tile) {
          if (tile == null) return false;
          const w = typeof game.width === "function" ? game.width() : 500;
          const tx = tile % w, ty = Math.floor(tile / w);
          for (const item of ImpossibleAI.inflightBoatTargets) {
            if (Math.hypot(item.x - tx, item.y - ty) <= ImpossibleAI.BOAT_SPREAD_RADIUS) return true;
          }
          return false;
        },
        handleOpportunisticBoats(game, myPlayer) {
          if (!botCfg.autoBoat) return false;
          const now = Date.now();
          if (now - ImpossibleAI.lastOppBoatMs < 1200) return false;
          const myTr = playerTroops(myPlayer);
          const maxTr = getMaxTroops(game, myPlayer);
          const fill = maxTr > 0 ? myTr / maxTr : 1;
          if (fill < .35) return false;
          const bts = Array.from(getBorderTiles(game, myPlayer));
          const shores = bts.filter((t => typeof game.isShore === "function" && game.isShore(t)));
          if (shores.length === 0) return false;
          if (ImpossibleAI.beachhead && ImpossibleAI.beachhead.tile != null && fill >= .7) {
            const bhTile = ImpossibleAI.beachhead.tile;
            const w = typeof game.width === "function" ? game.width() : 500;
            const bx = bhTile % w, by = Math.floor(bhTile / w);
            let landingHeld = false;
            for (let dy = -4; dy <= 4; dy += 2) {
              for (let dx = -4; dx <= 4; dx += 2) {
                const checkTile = (by + dy) * w + (bx + dx);
                try {
                  if (game.ownerID(checkTile) === getMySmallID(myPlayer)) landingHeld = true;
                } catch (e) {}
              }
            }
            if (landingHeld) {
              const surgeTroops = Math.floor(myTr * .25);
              if (surgeTroops > 2e3 && sendPacket({
                type: "boat",
                dst: bhTile,
                troops: surgeTroops
              })) {
                ImpossibleAI.lastOppBoatMs = now;
                ImpossibleAI.beachhead.surged = true;
                Engine.stats.boatsSent++;
                return true;
              }
            }
          }
          if (ImpossibleAI.recentMirvHits.length > 0) {
            for (let i = ImpossibleAI.recentMirvHits.length - 1; i >= 0; i--) {
              const hit = ImpossibleAI.recentMirvHits[i];
              if (hit.tile != null && !this.isTargetTileTaken(game, hit.tile)) {
                const troops = Math.max(5e3, Math.floor(myTr * .05));
                if (sendPacket({
                  type: "boat",
                  dst: hit.tile,
                  troops: troops
                })) {
                  ImpossibleAI.lastOppBoatMs = now;
                  Engine.stats.boatsSent++;
                  return true;
                }
              }
            }
          }
          const all = getAllPlayers(game);
          const disconnected = all.filter((p => {
            try {
              return isAlive(p) && !isFriendly(myPlayer, p) && typeof p.isDisconnected === "function" && p.isDisconnected();
            } catch (e) {
              return false;
            }
          }));
          for (const d of disconnected) {
            const targetShore = findTargetShoreTile(game, d);
            if (targetShore != null && !this.isTargetTileTaken(game, targetShore)) {
              const troops = Math.max(5e3, Math.floor(myTr * .05));
              if (sendPacket({
                type: "boat",
                dst: targetShore,
                troops: troops
              })) {
                ImpossibleAI.lastOppBoatMs = now;
                ImpossibleAI.beachhead = {
                  tile: targetShore,
                  time: now,
                  surged: false
                };
                Engine.stats.boatsSent++;
                return true;
              }
            }
          }
          return false;
        },
        handleWarships(game, myPlayer) {
          if (!botCfg.autoWarship) return false;
          const units = playerUnits(myPlayer);
          const ports = units.filter((u => unitType(u) === "Port"));
          if (ports.length === 0) return false;
          const warships = units.filter((u => unitType(u) === "Warship"));
          const gold = playerGold(myPlayer);
          const wCost = ImpossibleAI.Structure.cost("Warship", myPlayer);
          if (warships.length < 5 && gold >= wCost && Math.random() < .5) {
            const port = ports[Math.floor(Math.random() * ports.length)];
            const pTile = typeof port.tile === "function" ? port.tile() : port.tile;
            if (pTile != null) {
              const w = typeof game.width === "function" ? game.width() : 500;
              const px = pTile % w, py = Math.floor(pTile / w);
              for (let r = 2; r <= 8; r += 2) {
                let spawned = false;
                for (let dy = -r; dy <= r; dy += 2) {
                  for (let dx = -r; dx <= r; dx += 2) {
                    const candidate = (py + dy) * w + (px + dx);
                    try {
                      if (game.isWater(candidate)) {
                        if (sendPacket({
                          type: "build_unit",
                          unit: "Warship",
                          tile: candidate
                        })) {
                          Engine.stats.structuresBuilt++;
                          spawned = true;
                          break;
                        }
                      }
                    } catch (e) {}
                  }
                  if (spawned) break;
                }
                if (spawned) return true;
              }
            }
          }
          try {
            const gameUnits = typeof game.units === "function" ? game.units("TransportShip") : [];
            const hostileTransports = (gameUnits || []).filter((u => {
              try {
                const owner = typeof u.owner === "function" ? u.owner() : u.owner;
                const tgt = typeof u.targetTile === "function" ? u.targetTile() : u.targetTile;
                return owner && !isFriendly(myPlayer, owner) && tgt != null && game.ownerID(tgt) === getMySmallID(myPlayer);
              } catch (e) {
                return false;
              }
            }));
            if (hostileTransports.length > 0 && warships.length > 0) {
              const tgtTransport = hostileTransports[0];
              const tTile = typeof tgtTransport.tile === "function" ? tgtTransport.tile() : tgtTransport.tile;
              if (tTile != null) {
                const ws = warships[0];
                const wsId = typeof ws.id === "function" ? ws.id() : ws.id;
                if (wsId != null) {
                  sendPacket({
                    type: "move_warship",
                    unitIDs: [ wsId ],
                    dst: tTile
                  });
                }
              }
            }
          } catch (e) {}
          return false;
        }
      },
      Nuclear: {
        findFFACrownTarget(game, myPlayer) {
          const all = getAllPlayers(game);
          const enemies = all.filter((p => !isFriendly(myPlayer, p) && isAlive(p)));
          if (enemies.length === 0) return null;
          enemies.sort(((a, b) => {
            const aTiles = typeof a.numTilesOwned === "function" ? Number(a.numTilesOwned()) || 0 : 0;
            const bTiles = typeof b.numTilesOwned === "function" ? Number(b.numTilesOwned()) || 0 : 0;
            return bTiles - aTiles;
          }));
          const totalLand = typeof game.numLandTiles === "function" ? game.numLandTiles() : 5e4;
          const top = enemies[0];
          const topTiles = typeof top.numTilesOwned === "function" ? Number(top.numTilesOwned()) || 0 : 0;
          if (topTiles / Math.max(1, totalLand) > .4) return top;
          return null;
        },
        findHighDensityTarget(game, myPlayer) {
          const all = getAllPlayers(game);
          const enemies = all.filter((p => !isFriendly(myPlayer, p) && isAlive(p) && !isBot(p)));
          if (enemies.length === 0) return null;
          let best = null;
          let maxDensity = 1 / 75;
          for (const e of enemies) {
            const tiles = typeof e.numTilesOwned === "function" ? Number(e.numTilesOwned()) || 0 : 0;
            if (tiles <= 0) continue;
            const units = playerUnits(e);
            let sumLvl = 0;
            for (const u of units) {
              const lvl = typeof u.level === "function" ? u.level() : u.level || 1;
              sumLvl += lvl;
            }
            if (sumLvl < 5) continue;
            const dens = sumLvl / tiles;
            if (dens > maxDensity) {
              maxDensity = dens;
              best = e;
            }
          }
          return best;
        },
        findBestNukeTarget(game, myPlayer) {
          const crown = this.findFFACrownTarget(game, myPlayer);
          if (crown) return crown;
          const highDens = this.findHighDensityTarget(game, myPlayer);
          if (highDens) return highDens;
          const all = getAllPlayers(game);
          const enemies = all.filter((p => !isFriendly(myPlayer, p) && isAlive(p) && !isBot(p)));
          if (enemies.length > 0) {
            enemies.sort(((a, b) => playerUnits(b).length - playerUnits(a).length));
            return enemies[0];
          }
          return null;
        },
        isTrajectoryInterceptableBySam(game, myPlayer, srcTile, dstTile, ignoreSamIds = new Set) {
          const all = getAllPlayers(game);
          const enemies = all.filter((p => !isFriendly(myPlayer, p) && isAlive(p)));
          const enemySams = [];
          for (const e of enemies) {
            const units = playerUnits(e);
            for (const u of units) {
              if (unitType(u) === "SAM Launcher") {
                const uId = typeof u.id === "function" ? u.id() : u.id;
                if (!ignoreSamIds.has(uId)) {
                  enemySams.push(u);
                }
              }
            }
          }
          if (enemySams.length === 0) return false;
          const w = typeof game.width === "function" ? game.width() : 500;
          const x1 = srcTile % w, y1 = Math.floor(srcTile / w);
          const x2 = dstTile % w, y2 = Math.floor(dstTile / w);
          for (let step = 1; step <= 10; step++) {
            const fx = x1 + (x2 - x1) * (step / 10);
            const fy = y1 + (y2 - y1) * (step / 10);
            for (const sam of enemySams) {
              const sTile = typeof sam.tile === "function" ? sam.tile() : sam.tile;
              if (sTile == null) continue;
              const sx = sTile % w, sy = Math.floor(sTile / w);
              const lvl = typeof sam.level === "function" ? sam.level() : sam.level || 1;
              const range = lvl * 15 + 45;
              if (Math.hypot(fx - sx, fy - sy) <= range) return true;
            }
          }
          return false;
        },
        nukeTileScore(game, target, tile, nukeType, mySilos) {
          const radius = nukeType === "Hydrogen Bomb" ? 60 : 25;
          const units = playerUnits(target);
          let score = 0;
          for (const u of units) {
            const uTile = typeof u.tile === "function" ? u.tile() : u.tile;
            if (uTile == null) continue;
            if (calcTileDist(game, tile, uTile) <= radius) {
              const lvl = typeof u.level === "function" ? u.level() : u.level || 1;
              const t = unitType(u);
              if (t === "City") score += 25e3 * lvl; else if (t === "Missile Silo") score += 5e4 * lvl; else if (t === "SAM Launcher") score += 35e3 * lvl; else if (t === "Factory" || t === "Port") score += 15e3 * lvl; else if (t === "Defense Post") score += 5e3 * lvl;
            }
          }
          if (mySilos.length > 0) {
            const sTile = typeof mySilos[0].tile === "function" ? mySilos[0].tile() : mySilos[0].tile;
            if (sTile != null) {
              const dist = calcTileDist(game, tile, sTile);
              score -= dist * 20;
            }
          }
          return score;
        },
        handleMirv(game, myPlayer) {
          if (!botCfg.allowMirv) return false;
          const gold = playerGold(myPlayer);
          if (gold < 25e6) return false;
          const silos = playerUnits(myPlayer).filter((u => unitType(u) === "Missile Silo"));
          if (silos.length === 0) return false;
          const target = this.findBestNukeTarget(game, myPlayer);
          if (!target) return false;
          const targetTile = findTargetCityTile(target) || findTargetShoreTile(game, target);
          if (targetTile != null) {
            if (sendPacket({
              type: "build_unit",
              unit: "MIRV",
              tile: targetTile
            })) {
              Engine.stats.nukesLaunched++;
              ImpossibleAI.recentMirvHits.push({
                tile: targetTile,
                time: Date.now()
              });
              if (botCfg.autoEmoji === true) sendPacket({
                type: "emoji",
                recipient: String(getMySmallID(target)),
                emoji: EMOJI_IDX.RADIATION
              });
              return true;
            }
          }
          return false;
        },
        maybeDestroyEnemySam(game, myPlayer, targetPlayer) {
          if (!botCfg.allowAtomBombs) return false;
          const gold = playerGold(myPlayer);
          if (gold < 75e4) return false;
          const sams = playerUnits(targetPlayer).filter((u => unitType(u) === "SAM Launcher"));
          if (sams.length === 0) return false;
          const silos = playerUnits(myPlayer).filter((u => unitType(u) === "Missile Silo"));
          if (silos.length === 0) return false;
          for (const sam of sams) {
            const samTile = typeof sam.tile === "function" ? sam.tile() : sam.tile;
            if (samTile != null) {
              if (sendPacket({
                type: "build_unit",
                unit: "Atom Bomb",
                tile: samTile
              })) {
                Engine.stats.nukesLaunched++;
                return true;
              }
            }
          }
          return false;
        },
        handleNukes(game, myPlayer) {
          if (!botCfg.autoNuke) return false;
          if (this.handleMirv(game, myPlayer)) return true;
          const now = Date.now();
          if (now - Engine.lastNukeAttemptTime < 4e3) return false;
          Engine.lastNukeAttemptTime = now;
          const silos = playerUnits(myPlayer).filter((u => unitType(u) === "Missile Silo"));
          if (silos.length === 0) return false;
          const target = this.findBestNukeTarget(game, myPlayer);
          if (!target) return false;
          const gold = playerGold(myPlayer);
          let nukeType = null;
          if (botCfg.allowHydrogenBombs && gold >= 5e6) nukeType = "Hydrogen Bomb"; else if (botCfg.allowAtomBombs && gold >= 75e4) nukeType = "Atom Bomb";
          if (!nukeType) return false;
          const structures = playerUnits(target);
          const structTiles = structures.map((u => typeof u.tile === "function" ? u.tile() : u.tile)).filter((t => t != null));
          const randTiles = randTerritoryTileArray(game, target, 30);
          const candidateTiles = Array.from(new Set(structTiles.concat(randTiles)));
          const mySiloTile = typeof silos[0].tile === "function" ? silos[0].tile() : silos[0].tile;
          let bestTile = null;
          let bestScore = -Infinity;
          for (const tile of candidateTiles) {
            if (mySiloTile != null && this.isTrajectoryInterceptableBySam(game, myPlayer, mySiloTile, tile)) {
              continue;
            }
            const score = this.nukeTileScore(game, target, tile, nukeType, silos);
            if (score > bestScore) {
              bestScore = score;
              bestTile = tile;
            }
          }
          if (bestTile != null && bestScore > 0) {
            if (sendPacket({
              type: "build_unit",
              unit: nukeType,
              tile: bestTile
            })) {
              Engine.stats.nukesLaunched++;
              if (botCfg.autoEmoji === true) sendPacket({
                type: "emoji",
                recipient: String(getMySmallID(target)),
                emoji: EMOJI_IDX.RADIATION
              });
              return true;
            }
          } else {
            return this.maybeDestroyEnemySam(game, myPlayer, target);
          }
          return false;
        }
      },
      Diplomacy: {
        handleAlliances(game, myPlayer) {
          if (!botCfg.autoAlliance) return;
          try {
            const requests = typeof myPlayer?.incomingAllianceRequests === "function" ? myPlayer.incomingAllianceRequests() : [];
            for (const req of requests) {
              const requestor = typeof req.requestor === "function" ? req.requestor() : req.requestor;
              if (!requestor || isBot(requestor)) {
                if (typeof req.reject === "function") req.reject(); else sendPacket({
                  type: "alliance_reply",
                  targetID: String(getMySmallID(requestor)),
                  accept: false
                });
                continue;
              }
              if (typeof req.accept === "function") req.accept(); else sendPacket({
                type: "alliance_reply",
                targetID: String(getMySmallID(requestor)),
                accept: true
              });
            }
          } catch (e) {}
          const now = Date.now();
          if (now - ImpossibleAI.lastFarAllyMs > 5e3) {
            ImpossibleAI.lastFarAllyMs = now;
            const all = getAllPlayers(game);
            const farCandidates = all.filter((p => !isFriendly(myPlayer, p) && isAlive(p) && !isBot(p)));
            if (farCandidates.length > 0) {
              const pick = farCandidates[Math.floor(Math.random() * farCandidates.length)];
              const pickId = typeof pick.id === "function" ? pick.id() : pick.id;
              if (pickId) sendPacket({
                type: "alliance_request",
                targetID: String(pickId)
              });
            }
          }
        },
        handleEmbargos(game, myPlayer) {
          if (!botCfg.autoEmbargo || !myPlayer) return;
          try {
            const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
            for (const atk of incoming) {
              const attacker = typeof atk.attacker === "function" ? atk.attacker() : atk.attacker;
              if (attacker && !isFriendly(myPlayer, attacker)) {
                const aId = typeof attacker.id === "function" ? attacker.id() : attacker.id;
                if (aId) sendPacket({
                  type: "embargo",
                  targetID: String(aId),
                  action: "start"
                });
              }
            }
          } catch (e) {}
        }
      },
      Spawn: {
        pickSpawnTile(game, myPlayer) {
          try {
            if (!game) return null;
            const t = game;
            const n = typeof t.width === "function" ? t.width() : t.width || 500;
            const o = typeof t.height === "function" ? t.height() : t.height || 500;
            let r = 30;
            try {
              const p = typeof t.config === "function" ? t.config()?.minDistanceBetweenPlayers?.() : 30;
              if (Number.isFinite(p)) r = p;
            } catch (p) {}
            let a = null;
            try {
              const team = myPlayer && typeof myPlayer.team === "function" ? myPlayer.team() : myPlayer?.team ?? null;
              if (team !== null && team !== undefined) {
                if (typeof t.teamSpawnArea === "function") {
                  a = t.teamSpawnArea(team) ?? null;
                } else if (typeof t.__src?.teamSpawnArea === "function") {
                  a = t.__src.teamSpawnArea(team) ?? null;
                }
              }
            } catch (p) {}
            const allPlayers = getAllPlayers(t);
            const myID = getMySmallID(myPlayer);
            const spawnedEnemies = allPlayers.filter((p => {
              try {
                if (!p) return false;
                const pID = getMySmallID(p);
                if (myID != null && pID === myID) return false;
                if (isFriendly(myPlayer, p)) return false;
                return typeof p.hasSpawned === "function" ? p.hasSpawned() : Boolean(p.spawnTile?.());
              } catch (e) {
                return false;
              }
            }));
            const isTooCloseToEnemy = tile => {
              const tx = typeof t.x === "function" ? t.x(tile) : tile % n;
              const ty = typeof t.y === "function" ? t.y(tile) : Math.floor(tile / n);
              for (const g of spawnedEnemies) {
                const loc = typeof g.nameLocation === "function" ? g.nameLocation() : null;
                const st = typeof g.spawnTile === "function" ? g.spawnTile() : g.spawnTile;
                const gx = loc ? loc.x : st != null ? typeof t.x === "function" ? t.x(st) : st % n : null;
                const gy = loc ? loc.y : st != null ? typeof t.y === "function" ? t.y(st) : Math.floor(st / n) : null;
                if (gx != null && gy != null) {
                  const dist = Math.abs(gx - tx) + Math.abs(gy - ty);
                  if (dist < r) return true;
                }
              }
              return false;
            };
            const isCandidateValid = tile => {
              if (tile == null) return false;
              try {
                if (typeof t.isValidRef === "function" && !t.isValidRef(tile)) return false;
                if (typeof t.isLand === "function" && !t.isLand(tile)) return false;
                if (typeof t.hasOwner === "function" && t.hasOwner(tile)) return false;
                if (typeof t.isBorder === "function" && t.isBorder(tile)) return false;
                if (typeof t.isImpassable === "function" && t.isImpassable(tile)) return false;
                if (isTooCloseToEnemy(tile)) return false;
                return true;
              } catch (e) {
                return false;
              }
            };
            const scoreTile = tile => {
              const tx = typeof t.x === "function" ? t.x(tile) : tile % n;
              const ty = typeof t.y === "function" ? t.y(tile) : Math.floor(tile / n);
              let totalScore = 0;
              const c = 12;
              let landCount = 0;
              let totalChecked = 0;
              for (let h = -c; h <= c; h += 3) {
                for (let m = -c; m <= c; m += 3) {
                  const gx = tx + m;
                  const gy = ty + h;
                  if (gx < 0 || gx >= n || gy < 0 || gy >= o) continue;
                  if (typeof t.isValidCoord === "function" && !t.isValidCoord(gx, gy)) continue;
                  totalChecked++;
                  const ref = typeof t.ref === "function" ? t.ref(gx, gy) : gy * n + gx;
                  try {
                    if (t.isLand(ref) && !t.hasOwner(ref)) landCount++;
                  } catch (e) {}
                }
              }
              totalScore += (totalChecked > 0 ? landCount / totalChecked : 0) * 40;
              let minEnemyDist = Infinity;
              for (const g of spawnedEnemies) {
                const loc = typeof g.nameLocation === "function" ? g.nameLocation() : null;
                const st = typeof g.spawnTile === "function" ? g.spawnTile() : g.spawnTile;
                const gx = loc ? loc.x : st != null ? typeof t.x === "function" ? t.x(st) : st % n : null;
                const gy = loc ? loc.y : st != null ? typeof t.y === "function" ? t.y(st) : Math.floor(st / n) : null;
                if (gx != null && gy != null) {
                  const dist = Math.abs(gx - tx) + Math.abs(gy - ty);
                  if (dist < minEnemyDist) minEnemyDist = dist;
                }
              }
              totalScore += Math.min(1, minEnemyDist / 200) * 30;
              const edgeDist = Math.min(tx, ty, n - 1 - tx, o - 1 - ty);
              totalScore += Math.min(1, edgeDist / 30) * 20;
              if (a) {
                const cx = a.x + a.width / 2;
                const cy = a.y + a.height / 2;
                const distFromTeamCenter = Math.abs(tx - cx) + Math.abs(ty - cy);
                const teamSpan = (a.width + a.height) / 2;
                totalScore += Math.max(0, 1 - distFromTeamCenter / Math.max(1, teamSpan)) * 25;
              }
              return totalScore;
            };
            let bestTile = null;
            let bestScore = -Infinity;
            const minX = a ? Math.max(0, a.x) : 0;
            const maxX = a ? Math.min(n, a.x + a.width) : n;
            const minY = a ? Math.max(0, a.y) : 0;
            const maxY = a ? Math.min(o, a.y + a.height) : o;
            const spanX = Math.max(1, maxX - minX);
            const spanY = Math.max(1, maxY - minY);
            for (let sample = 0; sample < 150; sample++) {
              const rx = Math.floor(Math.random() * spanX) + minX;
              const ry = Math.floor(Math.random() * spanY) + minY;
              if (typeof t.isValidCoord === "function" && !t.isValidCoord(rx, ry)) continue;
              const ref = typeof t.ref === "function" ? t.ref(rx, ry) : ry * n + rx;
              if (!isCandidateValid(ref)) continue;
              const score = scoreTile(ref);
              if (score > bestScore) {
                bestScore = score;
                bestTile = ref;
              }
            }
            if (bestTile == null) {
              for (let sample = 0; sample < 50; sample++) {
                const rx = Math.floor(Math.random() * spanX) + minX;
                const ry = Math.floor(Math.random() * spanY) + minY;
                const ref = typeof t.ref === "function" ? t.ref(rx, ry) : ry * n + rx;
                try {
                  if (t.isLand(ref) && !t.hasOwner(ref)) return ref;
                } catch (e) {}
              }
            }
            return bestTile;
          } catch (err) {
            console.error("[ImpossibleBot] Spawn pick error:", err);
            return null;
          }
        }
      }
    };
    const Engine = {
      running: botCfg.enabled,
      timer: null,
      spawnSent: false,
      lastSpawnTile: null,
      lastSpawnPickTime: 0,
      behaviorsInitialized: false,
      lastNukeAttemptTime: 0,
      lastStructureAttemptTime: 0,
      lastEmojiSentTime: new Map,
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
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
        botCfg.enabled = false;
        saveBotCfg();
        this.targetDetail = "None";
        this.activeProbeBoat = null;
        this.justLandedBeachhead = false;
        updateUI();
      },
      toggle() {
        if (this.running) this.stop(); else this.start();
      },
      scheduleNextTick() {
        if (!this.running) return;
        if (this.timer) clearTimeout(this.timer);
        const interval = Math.max(200, Math.min(3e3, botCfg.tickIntervalMs || 300));
        this.timer = setTimeout((() => {
          try {
            this.tick();
          } catch (e) {
            console.warn("[ImpossibleBot] Tick error:", e);
          }
          if (this.running) this.scheduleNextTick();
        }), interval);
      },
      tick() {
        if (!this.running) return;
        const state = api.getGameState();
        if (!state || !state.game) {
          updateUI();
          return;
        }
        const game = state.game;
        let inSpawn = false;
        try {
          inSpawn = typeof game.inSpawnPhase === "function" && game.inSpawnPhase();
        } catch (e) {}
        if (!inSpawn && this.spawnSent) {
          this.spawnSent = false;
          this.lastSpawnTile = null;
        }
        if (inSpawn) {
          if (botCfg.autoSpawn) {
            try {
              this.handleAutoSpawn(game);
            } catch (e) {
              console.error("[ImpossibleBot] AutoSpawn error:", e);
            }
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
            const burstTroops = Math.floor(Math.max(0, playerTroops(myPlayer) - maxTr * .35));
            if (burstTroops >= 1) {
              if (sendPacket({
                type: "attack",
                targetID: null,
                troops: burstTroops
              })) {
                this.stats.expandsDone++;
                this.lastExpandMs = Date.now();
              }
            }
          }
          updateUI();
          return;
        }
        this.botAttackTroopsSent = 0;
        const is1v1 = botCfg.mode === "1v1" || botCfg.mode === "v1v1";
        if (is1v1) {
          if (botCfg.autoEmbargo) this.handle1v1AutoEmbargo(game, myPlayer);
          if (botCfg.autoEmoji === true) this.handleEmojis(game, myPlayer);
          this.tick1v1(game, myPlayer);
        } else {
          this.tickImpossible(game, myPlayer);
        }
        updateUI();
      },
      tickImpossible(game, myPlayer) {
        this.myTroopCap = getMaxTroops(game, myPlayer);
        this.oppTroopCap = 0;
        this.opponentName = "Multi / FFA";
        if (botCfg.autoAlliance) ImpossibleAI.Diplomacy.handleAlliances(game, myPlayer);
        if (botCfg.autoEmbargo) ImpossibleAI.Diplomacy.handleEmbargos(game, myPlayer);
        if (botCfg.autoWarship) ImpossibleAI.Naval.handleWarships(game, myPlayer);
        ImpossibleAI.attackTickCounter++;
        const cadence = botCfg.winFixes ? 2 : 1;
        if (botCfg.autoAttack || botCfg.autoExpand) {
          ImpossibleAI.Attack.handleAttacks(game, myPlayer);
        }
        if (ImpossibleAI.attackTickCounter % cadence === 0) {
          if (botCfg.autoBuild || botCfg.autoDefend) {
            ImpossibleAI.Structure.handleStructures(game, myPlayer);
          }
          if (botCfg.autoNuke) {
            ImpossibleAI.Nuclear.handleNukes(game, myPlayer);
          }
        }
        if (botCfg.autoEmoji === true) this.handleEmojis(game, myPlayer);
      },
      handle1v1AutoEmbargo(game, myPlayer) {
        const incoming = typeof myPlayer?.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        for (const atk of incoming) {
          if (!atk) continue;
          const attacker = typeof atk.attacker === "function" ? atk.attacker() : null;
          if (attacker && !isFriendly(myPlayer, attacker)) {
            const aId = typeof attacker.id === "function" ? attacker.id() : attacker.id;
            if (aId) sendPacket({
              type: "embargo",
              targetID: String(aId),
              action: "start"
            });
          }
        }
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
        const humanOpponents = all.filter((p => {
          if (!p || !isAlive(p)) return false;
          if (myID != null && getMySmallID(p) === myID) return false;
          if (isFriendly(myPlayer, p)) return false;
          const pType = typeof p.type === "function" ? p.type() : p.type || "";
          return pType !== "BOT" && pType !== "NATION" && !isBot(p);
        }));
        if (humanOpponents.length > 0) {
          humanOpponents.sort(((a, b) => playerTroops(b) - playerTroops(a)));
          return humanOpponents[0];
        }
        const anyOpponents = all.filter((p => {
          if (!p || !isAlive(p)) return false;
          return (myID == null || getMySmallID(p) !== myID) && !isFriendly(myPlayer, p);
        }));
        anyOpponents.sort(((a, b) => playerTroops(b) - playerTroops(a)));
        return anyOpponents[0] || null;
      },
      handleAutoSpawn(game) {
        const now = Date.now();
        if (now - this.lastSpawnPickTime < 500) return;
        this.lastSpawnPickTime = now;
        const tile = this.pickSpawnTile(game);
        if (tile == null) return;
        if (this.spawnSent && this.lastSpawnTile === tile) return;
        const ok = sendPacket({
          type: "spawn",
          tile: Number(tile)
        });
        if (ok) {
          this.spawnSent = true;
          this.lastSpawnTile = tile;
          this.stats.expandsDone++;
        }
      },
      pickSpawnTile(game) {
        if (!game) return null;
        const is1v1 = botCfg.mode === "1v1" || botCfg.mode === "v1v1";
        if (is1v1 && botCfg.usePredeterminedSpawns !== false) {
          let mapName = "";
          try {
            if (typeof game.mapName === "function") mapName = game.mapName() || "";
            if (!mapName && typeof game.config === "function") {
              const c = game.config();
              if (c && typeof c.mapName === "function") mapName = c.mapName() || "";
            }
          } catch (e) {}
          const PRESET_SPAWNS = {
            europe: [ 135, 142 ],
            britannia: [ 180, 210 ],
            baikal: [ 250, 260 ],
            deglaciatedantarctica: [ 310, 280 ],
            world: [ 350, 250 ],
            asia: [ 400, 280 ],
            northamerica: [ 220, 240 ]
          };
          const key = Object.keys(PRESET_SPAWNS).find((k => mapName.toLowerCase().includes(k)));
          let targetTile = null;
          if (key) {
            const [x, y] = PRESET_SPAWNS[key];
            const w = typeof game.width === "function" ? game.width() : game.width || 500;
            const h = typeof game.height === "function" ? game.height() : game.height || 500;
            if (x >= 0 && x < w && y >= 0 && y < h) {
              targetTile = typeof game.ref === "function" ? game.ref(x, y) : y * w + x;
            }
          }
          if (targetTile != null && targetTile >= 0) {
            try {
              if (typeof game.isValidRef === "function" && game.isValidRef(targetTile) && game.isLand(targetTile)) {
                return targetTile;
              }
              if (typeof game.isLand === "function" && game.isLand(targetTile)) {
                return targetTile;
              }
            } catch (e) {}
          }
        }
        const state = api.getGameState();
        const myPlayer = state ? state.myPlayer : null;
        return ImpossibleAI.Spawn.pickSpawnTile(game, myPlayer);
      },
      handle1v1BoatDefense(game, myPlayer, opponent) {
        const now = Date.now();
        if (now - this.lastBoatDefenseTime < 400) return;
        this.lastBoatDefenseTime = now;
        const myID = getMySmallID(myPlayer);
        if (!myID || !opponent) return;
        const oppUnits = playerUnits(opponent);
        const incomingBoats = oppUnits.filter((u => {
          const t = unitType(u);
          return (t === "TransportShip" || t === "Boat" || t === "transport_ship") && isAlive(u);
        }));
        for (const unit of incomingBoats) {
          const targetTile = typeof unit.targetTile === "function" ? unit.targetTile() : unit.targetTile;
          const boatTroops = typeof unit.troops === "function" ? Number(unit.troops()) || 0 : unit.troops || 0;
          if (targetTile == null || boatTroops <= 0) continue;
          const w = typeof game.width === "function" ? game.width() : 500;
          const tx = targetTile % w, ty = Math.floor(targetTile / w);
          let isOurLand = false;
          try {
            if (game.ownerID(targetTile) === myID) isOurLand = true;
          } catch (e) {}
          if (!isOurLand) {
            forEachNeighbor(game, targetTile, (n => {
              try {
                if (game.ownerID(n) === myID) isOurLand = true;
              } catch (e) {}
            }));
          }
          const myCenter = getPlayerCenter(game, myPlayer);
          const isFlankingBehindUs = myCenter && Math.hypot(tx - myCenter.x, ty - myCenter.y) < 60;
          if (isOurLand || isFlankingBehindUs) {
            const myTr = playerTroops(myPlayer);
            const sendAmt = Math.floor(Math.min(myTr * .4, Math.max(boatTroops * 1.35 + 200, 1e3)));
            if (sendAmt > 200) {
              const ok = sendPacket({
                type: "attack",
                targetID: null,
                troops: sendAmt
              });
              if (ok) {
                this.stats.attacksSent++;
                this.stats.boatDefenses++;
                this.stats.troopsSentTotal += sendAmt;
                this.targetDetail = `INTERCEPT BOAT @ ${tx},${ty} (${sendAmt} troops)`;
                return;
              }
            }
          }
        }
      },
      handle1v1Structures(game, myPlayer, opponent, phase = "mid") {
        const now = Date.now();
        if (now - this.lastStructureAttemptTime < 800) return;
        this.lastStructureAttemptTime = now;
        const gold = playerGold(myPlayer);
        const units = playerUnits(myPlayer);
        const cities = units.filter((u => unitType(u) === "City"));
        const defensePosts = units.filter((u => unitType(u) === "Defense Post"));
        const silos = units.filter((u => unitType(u) === "Missile Silo")).length;
        const ports = units.filter((u => unitType(u) === "Port")).length;
        const maxPosts = botCfg.maxDefensePosts ?? 4;
        const maxCities = botCfg.maxCities ?? 3;
        if (botCfg.buildCities && cities.length < 2) {
          const nextCityCost = Math.pow(2, cities.length) * 125e3;
          if (gold >= nextCityCost) {
            const cityTile = find1v1CityTile(game, myPlayer, cities, opponent);
            if (cityTile != null) {
              const ok = sendPacket({
                type: "build_unit",
                unit: "City",
                tile: cityTile
              });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Build City #${cities.length + 1}`;
                return;
              }
            }
          }
        }
        if (botCfg.buildDefensePosts && defensePosts.length < 1 && cities.length >= 1 && opponent) {
          const nextDPCost = (defensePosts.length + 1) * 5e4;
          if (gold >= nextDPCost) {
            const dpTile = find1v1DefensePostTile(game, myPlayer, opponent, defensePosts);
            if (dpTile != null) {
              const ok = sendPacket({
                type: "build_unit",
                unit: "Defense Post",
                tile: dpTile
              });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Build DP #${defensePosts.length + 1}`;
                return;
              }
            }
          }
        }
        if (botCfg.buildCities && cities.length < 3) {
          const nextCityCost = Math.pow(2, cities.length) * 125e3;
          if (gold >= nextCityCost) {
            const cityTile = find1v1CityTile(game, myPlayer, cities, opponent);
            if (cityTile != null) {
              const ok = sendPacket({
                type: "build_unit",
                unit: "City",
                tile: cityTile
              });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Build City #${cities.length + 1}`;
                return;
              }
            }
          }
        }
        if (botCfg.buildDefensePosts && defensePosts.length < maxPosts && opponent) {
          const nextDPCost = (defensePosts.length + 1) * 5e4;
          if (gold >= nextDPCost) {
            const dpTile = find1v1DefensePostTile(game, myPlayer, opponent, defensePosts);
            if (dpTile != null) {
              const ok = sendPacket({
                type: "build_unit",
                unit: "Defense Post",
                tile: dpTile
              });
              if (ok) {
                this.stats.structuresBuilt++;
                this.targetDetail = `Build DP #${defensePosts.length + 1}`;
                return;
              }
            }
          }
        }
        if (botCfg.buildSilos && silos < 1 && cities.length >= 3 && gold >= 1e6) {
          const siloTile = find1v1SiloTile(game, myPlayer, opponent);
          if (siloTile != null) {
            const ok = sendPacket({
              type: "build_unit",
              unit: "Missile Silo",
              tile: siloTile
            });
            if (ok) {
              this.stats.structuresBuilt++;
              this.targetDetail = "Build Missile Silo";
              return;
            }
          }
        }
      },
      handle1v1Nukes(game, myPlayer, opponent) {
        const now = Date.now();
        if (now - this.lastNukeAttemptTime < 3e3) return;
        this.lastNukeAttemptTime = now;
        const gold = playerGold(myPlayer);
        const units = playerUnits(myPlayer);
        const silos = units.filter((u => unitType(u) === "Missile Silo"));
        if (silos.length === 0 || !opponent) return;
        let bombType = null;
        if (botCfg.allowHydrogenBombs && gold >= 5e6) {
          bombType = "Hydrogen Bomb";
        } else if (botCfg.allowAtomBombs && gold >= 75e4) {
          bombType = "Atom Bomb";
        }
        if (!bombType) return;
        const targetTile = find1v1NukeTarget(game, opponent, true);
        if (targetTile != null) {
          const ok = sendPacket({
            type: "build_unit",
            unit: bombType,
            tile: targetTile
          });
          if (ok) {
            this.stats.nukesLaunched++;
            this.targetDetail = `Launch ${bombType} @ DP/City`;
            if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.RADIATION);
            const myTr = playerTroops(myPlayer);
            const assaultTroops = Math.floor(myTr * .35);
            if (assaultTroops > 1e3) {
              setTimeout((() => {
                sendPacket({
                  type: "attack",
                  targetID: String(getMySmallID(opponent)),
                  troops: assaultTroops
                });
              }), 400);
            }
          }
        }
      },
      handle1v1Attacks(game, myPlayer, opponent, phase = "mid") {
        const myTroops = playerTroops(myPlayer);
        if (myTroops <= 0) return;
        const maxTroops = getMaxTroops(game, myPlayer);
        const triggerRatio = botCfg.triggerRatio ?? .5;
        const dynamicReserve = getDynamicReserve(game, myPlayer, opponent, phase);
        const expandRatio = botCfg.expandRatio ?? .42;
        const troopRatio = myTroops / maxTroops;
        const now = Date.now();
        if (this.activeProbeBoat) {
          const isTargetTileOurs = typeof game.ownerID === "function" && game.ownerID(this.activeProbeBoat) === getMySmallID(myPlayer);
          let neighborOurs = false;
          forEachNeighbor(game, this.activeProbeBoat, (n => {
            try {
              if (game.ownerID(n) === getMySmallID(myPlayer)) neighborOurs = true;
            } catch (e) {}
          }));
          if (isTargetTileOurs || neighborOurs) {
            this.justLandedBeachhead = true;
            this.lastLandingAssaultTime = now;
            this.activeProbeBoat = null;
          } else if (now - this.lastProbeBoatTime > 15e3) {
            this.activeProbeBoat = null;
          }
        }
        const expandInterval = 250;
        if (now - this.lastExpandMs >= expandInterval) {
          const expandReserve = maxTroops * expandRatio;
          const available = myTroops - expandReserve;
          if (available > 0) {
            if (OppTracker.territoryRatio < .45) {
              const neckTiles = findOurVulnerableNecks(game, myPlayer, opponent);
              for (const nTile of neckTiles) {
                sendPacket({
                  type: "attack",
                  targetID: null,
                  troops: Math.floor(available * .3)
                });
              }
            }
            const troopsToSend = Math.floor(Math.min(available, Math.max(maxTroops * .05, myTroops * .35)));
            if (troopsToSend >= 1) {
              const ok = sendPacket({
                type: "attack",
                targetID: null,
                troops: troopsToSend
              });
              if (ok) {
                this.lastExpandMs = now;
                this.stats.attacksSent++;
                this.stats.expandsDone++;
                this.stats.troopsSentTotal += troopsToSend;
                this.targetDetail = `Expand TN (${troopsToSend} troops)`;
                return;
              }
            }
          }
        }
        if (!botCfg.autoAttack || !opponent) return;
        const borderingMap = getBorderingPlayerIDs(game, myPlayer);
        const borderingEnemies = Array.from(borderingMap.values()).filter((p => !isFriendly(myPlayer, p) && isAlive(p)));
        const borderingBots = borderingEnemies.filter((p => isBot(p)));
        if (borderingBots.length > 0) {
          const botReserve = .3;
          if (troopRatio >= botReserve) {
            for (const bot of borderingBots) {
              const plan = findBotEncirclementPlan(game, myPlayer, bot);
              if (plan && plan.walledRatio >= .2 && plan.unownedCount > 0 && plan.unownedCount <= 8) {
                const myTr = playerTroops(myPlayer);
                const sendAmt = Math.floor(Math.min(myTr * .25, 5e3));
                for (const t of plan.unownedTiles.slice(0, 3)) {
                  sendPacket({
                    type: "attack",
                    targetID: null,
                    troops: sendAmt
                  });
                }
              }
            }
            if (this.attackBots(borderingBots, game, myPlayer, myTroops, maxTroops, botReserve)) return;
          }
        }
        const oppTroops = playerTroops(opponent);
        const oppMax = getMaxTroops(game, opponent);
        const isOppKillShot = myTroops > oppTroops * 1.3 && troopRatio > dynamicReserve;
        const oppInDPRange = frontlineInDPRange(game, myPlayer, opponent);
        if (this.justLandedBeachhead && now - this.lastLandingAssaultTime < 4e3) {
          this.justLandedBeachhead = false;
          if (!isOppKillShot) {
            const assaultTroops = Math.floor(myTroops * .45);
            const ok = sendPacket({
              type: "attack",
              targetID: String(getMySmallID(opponent)),
              troops: assaultTroops
            });
            if (ok) {
              this.lastAttackMs = now;
              this.stats.attacksSent++;
              this.stats.troopsSentTotal += assaultTroops;
              this.targetDetail = `BEACHHEAD ASSAULT (${assaultTroops} troops)`;
              if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.DEVIL);
              return;
            }
          }
        }
        if (isOppKillShot) {
          const killTroops = Math.floor(myTroops * .9);
          const ok = sendPacket({
            type: "attack",
            targetID: String(getMySmallID(opponent)),
            troops: killTroops
          });
          if (ok) {
            this.lastAttackMs = now;
            this.stats.attacksSent++;
            this.stats.troopsSentTotal += killTroops;
            this.targetDetail = `KILL SHOT (${killTroops} troops)`;
            if (botCfg.autoEmoji === true) this.sendEmojiTo(opponent, EMOJI_IDX.SKULL);
            return;
          }
        }
        const shouldProbe = !this.activeProbeBoat && botCfg.autoBoat && now - this.lastProbeBoatTime > 7e3 && troopRatio > .4;
        if (shouldProbe) {
          const flankTile = find1v1FlankShoreTile(game, myPlayer, opponent);
          if (flankTile != null) {
            const probeTroops = 1;
            const ok = sendPacket({
              type: "boat",
              dst: flankTile,
              troops: probeTroops
            });
            if (ok) {
              this.activeProbeBoat = flankTile;
              this.lastProbeBoatTime = now;
              this.stats.boatsSent++;
              this.stats.attacksSent++;
              this.stats.troopsSentTotal += probeTroops;
              this.targetDetail = `1% Probe Boat #${flankTile}`;
              return;
            }
          }
        }
      },
      attackBots(bots, game, myPlayer, myTroops, maxTroops, reserveRatio) {
        return ImpossibleAI.Attack.attackBots(game, myPlayer, bots, Math.max(0, myTroops - maxTroops * (reserveRatio ?? .35)));
      },
      handleEmojis(game, myPlayer) {
        if (botCfg.autoEmoji !== true || !myPlayer) return;
        const now = Date.now();
        if (now - this.lastGlobalEmojiTime < 3e3) return;
        try {
          const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
          if (incoming.length > 0) {
            const totalInc = incoming.reduce(((s, a) => s + (typeof a.troops === "function" ? Number(a.troops()) : Number(a.troops || 0))), 0);
            const myTr = playerTroops(myPlayer);
            if (totalInc >= myTr * 2.5) {
              this.sendEmojiTo("AllPlayers", EMOJI_IDX.SKULL);
              this.lastGlobalEmojiTime = now;
              return;
            }
          }
        } catch (e) {}
      },
      sendEmojiTo(target, emojiIndex) {
        if (botCfg.autoEmoji !== true) return false;
        const now = Date.now();
        const tId = typeof target === "string" ? target : typeof target?.id === "function" ? target.id() : target?.id || "AllPlayers";
        const last = this.lastEmojiSentTime.get(String(tId)) || 0;
        if (now - last < 4e3) return false;
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
      panel.innerHTML = `\n        <button id="blon-ext-auto-master-toggle" style="width:100%;padding:9px 0;background:${themeColor};border:none;color:#000;font-weight:700;font-size:11px;border-radius:4px;cursor:pointer;margin-bottom:10px;transition:all 0.2s ease;">\n            ENABLE AUTOPLAY (Shift+B)\n        </button>\n\n        <div style="background:#111;border:1px solid #222;border-radius:6px;padding:8px 10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">\n            <span style="color:#aaa;font-size:10px;font-weight:700;">STRATEGY PRESET</span>\n            <select id="blon-ext-mode-select" style="background:#222;color:#fff;border:1px solid #444;border-radius:3px;font-size:10px;padding:3px 6px;cursor:pointer;">\n                <option value="v1v1" ${botCfg.activePreset === "v1v1" || botCfg.mode === "1v1" ? "selected" : ""}>1v1 Sweaty Meta</option>\n                <option value="solo" ${botCfg.activePreset === "solo" || botCfg.mode === "solo" ? "selected" : ""}>Solo Impossible AI</option>\n            </select>\n        </div>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-bottom:8px;">Combat & Expansion</div>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-attack" ${botCfg.autoAttack !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Attack & Target Priority\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-expand" ${botCfg.autoExpand !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Expand (Land & Fallout Grab)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-defend" ${botCfg.autoDefend !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Defend (Frontline DP Placement)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-spawn" ${botCfg.autoSpawn !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Spawn (Optimal Density Scoring)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;margin-left:14px;">\n            <input type="checkbox" id="blon-ext-feat-pred-spawn" ${botCfg.usePredeterminedSpawns !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Use Predetermined 1v1 Spawns\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-boat" ${botCfg.autoBoat !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Boat (Surge Beachhead & Islands)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-warship" ${botCfg.autoWarship !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Warships (Retaliation & Intercept)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-alliance" ${botCfg.autoAlliance !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Alliances & Diplomatic Outreach\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-donate" ${botCfg.autoDonate !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Donate Troops to Allies in Combat\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-embargo" ${botCfg.autoEmbargo !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Embargo Hostiles & Attackers\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-winfixes" ${botCfg.winFixes !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Competitive Win-Fixes (Cadence & Scale)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:12px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-emoji" ${botCfg.autoEmoji === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Emoji Reactions\n        </label>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Structure & Defense</div>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-build-master" ${botCfg.autoBuild !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Build Structures & Upgrades\n        </label>\n\n        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-cities" ${botCfg.buildCities !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Cities (Inland Spacing)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Cities</span>\n                <input id="blon-ext-max-cities-slider" type="range" min="1" max="50" step="1" value="${botCfg.maxCities ?? 40}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-cities-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxCities ?? 40}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-factories" ${botCfg.buildFactories !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Factories (Coastal Multiplier)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Factories</span>\n                <input id="blon-ext-max-factories-slider" type="range" min="0" max="30" step="1" value="${botCfg.maxFactories ?? 20}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-factories-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxFactories ?? 20}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-defposts" ${botCfg.buildDefensePosts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Defense Posts (Frontline Sampling)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Defense Posts</span>\n                <input id="blon-ext-max-defposts-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxDefensePosts ?? 5}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-defposts-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxDefensePosts ?? 5}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-silos" ${botCfg.buildSilos !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Missile Silos (Protected under SAMs)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Silos</span>\n                <input id="blon-ext-max-silos-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxSilos ?? 3}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-silos-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSilos ?? 3}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-sams" ${botCfg.buildSams !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> SAM Launchers (Air Defense Umbrella)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max SAMs</span>\n                <input id="blon-ext-max-sams-slider" type="range" min="0" max="20" step="1" value="${botCfg.maxSams ?? 8}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-sams-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSams ?? 8}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-ports" ${botCfg.buildPorts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Ports (Major Sea Bodies)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Ports</span>\n                <input id="blon-ext-max-ports-slider" type="range" min="0" max="6" step="1" value="${botCfg.maxPorts ?? 3}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-ports-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxPorts ?? 3}</span>\n            </div>\n        </div>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Nuclear Strikes & Superweapons</div>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-nuke" ${botCfg.autoNuke !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Nuke & Trajectory SAM Evasion\n        </label>\n        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-nuke-atom" ${botCfg.allowAtomBombs === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Atom Bombs / SAM Burn ($750K)\n            </label>\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-nuke-hbomb" ${botCfg.allowHydrogenBombs !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Hydrogen Bombs ($5M)\n            </label>\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-nuke-mirv" ${botCfg.allowMirv !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> MIRV Victory Denial ($25M)\n            </label>\n        </div>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">AI Tuning</div>\n        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Attack Trigger Ratio</span>\n                <input id="blon-ext-trigger-slider" type="range" min="30" max="90" step="1" value="${Math.round((botCfg.triggerRatio ?? .55) * 100)}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-trigger-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.triggerRatio ?? .55) * 100)}%</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Troop Reserve Floor</span>\n                <input id="blon-ext-reserve-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.reserveRatio ?? .35) * 100)}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-reserve-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.reserveRatio ?? .35) * 100)}%</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Wilderness Expand Floor</span>\n                <input id="blon-ext-expand-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.expandRatio ?? .15) * 100)}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-expand-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.expandRatio ?? .15) * 100)}%</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Bot Parallel Cap</span>\n                <input id="blon-ext-parallel-slider" type="range" min="1" max="100" step="1" value="${botCfg.botParallelism ?? 100}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-parallel-value" style="color:#ffcc00;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.botParallelism ?? 100}</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">AI Tick Interval</span>\n                <input id="blon-ext-interval-slider" type="range" min="200" max="2500" step="50" value="${botCfg.tickIntervalMs ?? 300}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-interval-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.tickIntervalMs ?? 300}ms</span>\n            </div>\n        </div>\n      `;
      const masterBtn = panel.querySelector("#blon-ext-auto-master-toggle");
      if (masterBtn) masterBtn.addEventListener("click", (() => Engine.toggle()));
      const modeSelect = panel.querySelector("#blon-ext-mode-select");
      if (modeSelect) {
        modeSelect.addEventListener("change", (e => {
          applyPreset(e.target.value);
        }));
      }
      [ [ "blon-ext-feat-attack", "autoAttack" ], [ "blon-ext-feat-expand", "autoExpand" ], [ "blon-ext-feat-defend", "autoDefend" ], [ "blon-ext-feat-spawn", "autoSpawn" ], [ "blon-ext-feat-pred-spawn", "usePredeterminedSpawns" ], [ "blon-ext-feat-embargo", "autoEmbargo" ], [ "blon-ext-feat-boat", "autoBoat" ], [ "blon-ext-feat-warship", "autoWarship" ], [ "blon-ext-feat-alliance", "autoAlliance" ], [ "blon-ext-feat-donate", "autoDonate" ], [ "blon-ext-feat-winfixes", "winFixes" ], [ "blon-ext-feat-emoji", "autoEmoji" ], [ "blon-ext-build-master", "autoBuild" ], [ "blon-ext-build-cities", "buildCities" ], [ "blon-ext-build-factories", "buildFactories" ], [ "blon-ext-build-sams", "buildSams" ], [ "blon-ext-build-silos", "buildSilos" ], [ "blon-ext-build-ports", "buildPorts" ], [ "blon-ext-build-defposts", "buildDefensePosts" ], [ "blon-ext-feat-nuke", "autoNuke" ], [ "blon-ext-nuke-atom", "allowAtomBombs" ], [ "blon-ext-nuke-hbomb", "allowHydrogenBombs" ], [ "blon-ext-nuke-mirv", "allowMirv" ] ].forEach((([id, prop]) => {
        const cb = panel.querySelector("#" + id);
        if (cb) cb.addEventListener("change", (e => {
          botCfg[prop] = e.target.checked;
          botCfg.activePreset = "custom";
          saveBotCfg();
        }));
      }));
      const bindSlider = (sliderId, labelId, prop, isPct = false, suffix = "") => {
        const sl = panel.querySelector("#" + sliderId);
        const lb = panel.querySelector("#" + labelId);
        if (sl) {
          sl.addEventListener("input", (e => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) {
              botCfg[prop] = isPct ? v / 100 : v;
              botCfg.activePreset = "custom";
              if (lb) lb.textContent = `${v}${suffix}`;
              saveBotCfg();
            }
          }));
        }
      };
      bindSlider("blon-ext-max-cities-slider", "blon-ext-max-cities-val", "maxCities");
      bindSlider("blon-ext-max-factories-slider", "blon-ext-max-factories-val", "maxFactories");
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
      const btn = document.getElementById("blon-ext-auto-master-toggle");
      if (btn) {
        if (Engine.running) {
          btn.textContent = "AUTOPLAY RUNNING (Shift+B)";
          btn.style.background = "#ff4444";
          btn.style.color = "#fff";
        } else {
          btn.textContent = "ENABLE AUTOPLAY (Shift+B)";
          const themeColor = api.cfg?.guiColor || "#00ff66";
          btn.style.background = themeColor;
          btn.style.color = "#000";
        }
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
      version: "4.3.1",
      description: "Advanced Autonomous Autoplay Extension for Project Blon",
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
      setTimeout((() => waitForBlonAPI(callback, retries - 1)), 300);
    } else {
      console.warn("[ImpossibleBot] window.__blonAPI not found. Is Project Blon installed?");
    }
  }
  waitForBlonAPI(initImpossibleBot);
})();