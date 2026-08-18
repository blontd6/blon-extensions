// ==UserScript==
// @name         Impossible Bot
// @namespace    blon-extensions
// @version      4.5.2
// @description  Advanced Autonomous Autoplay Extension for Project Blon
// @author       blon
// @match        https://openfront.io/*
// @grant        none
// @run-at       document-start
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
      botParallelism: 80,
      tickIntervalMs: 350
    };
    function loadBotCfg() {
      try {
        const saved = window?.localStorage?.getItem?.(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(botCfg, parsed);
        }
      } catch (e) {
        console.warn("[ImpossibleBot] Failed to load saved config:", e);
      }
    }
    loadBotCfg();
    function saveBotCfg() {
      try {
        window?.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(botCfg));
      } catch (e) {
        console.warn("[ImpossibleBot] Failed to save config:", e);
      }
    }
    function syncAllUIControls() {
      const modeSelect = document.getElementById("blon-ext-mode-select");
      if (modeSelect) {
        modeSelect.value = botCfg.activePreset || (botCfg.mode === "1v1" ? "v1v1" : "solo");
      }
      const setCb = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!val;
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
    function getPlayerID(p) {
      if (!p) return null;
      try {
        const id = typeof p.id === "function" ? p.id() : p.id ?? null;
        if (typeof id === "string" && /^[A-Za-z0-9]{8}$/.test(id)) return id;
        const clientID = typeof p.clientID === "function" ? p.clientID() : p.clientID ?? null;
        if (typeof clientID === "string" && /^[A-Za-z0-9]{8}$/.test(clientID)) return clientID;
      } catch (e) {}
      return null;
    }
    function getPlayerBySmallID(game, smallID) {
      if (!game || smallID == null || smallID <= 0) return null;
      try {
        if (typeof game.playerBySmallID === "function") {
          const p = game.playerBySmallID(smallID);
          if (p) return p;
        }
        const all = getAllPlayers(game);
        return all.find((p => getMySmallID(p) === smallID)) || null;
      } catch (e) {
        return null;
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
      try {
        const myID = getMySmallID(myPlayer);
        if (!myID) return new Set;
        const myTiles = typeof myPlayer.tiles === "function" ? myPlayer.tiles() : [];
        const result = new Set;
        for (const tile of myTiles) {
          let isBorder = false;
          forEachNeighbor(game, tile, (n => {
            try {
              if (game.ownerID(n) !== myID) isBorder = true;
            } catch (e) {}
          }));
          if (isBorder) result.add(tile);
        }
        return result;
      } catch (e) {
        return new Set;
      }
    }
    function getInteriorTiles(game, myPlayer) {
      if (!game || !myPlayer) return [];
      try {
        const myID = getMySmallID(myPlayer);
        if (!myID) return [];
        const myTiles = typeof myPlayer.tiles === "function" ? myPlayer.tiles() : [];
        const result = [];
        for (const tile of myTiles) {
          let interior = true;
          forEachNeighbor(game, tile, (n => {
            try {
              if (game.ownerID(n) !== myID) interior = false;
            } catch (e) {}
          }));
          if (interior) result.push(tile);
        }
        return result;
      } catch (e) {
        return [];
      }
    }
    function playerTroops(p) {
      if (!p) return 0;
      try {
        const t = typeof p.troops === "function" ? p.troops() : p.troops;
        if (typeof t === "bigint") return Number(t);
        return Number(t) || 0;
      } catch (e) {
        return 0;
      }
    }
    function playerGold(p) {
      if (!p) return 0;
      try {
        const g = typeof p.gold === "function" ? p.gold() : p.gold;
        if (typeof g === "bigint") return Number(g);
        return Number(g) || 0;
      } catch (e) {
        return 0;
      }
    }
    function getMaxTroops(game, p) {
      if (!p) return 1e5;
      try {
        if (game && typeof game.config === "function") {
          const cfg = game.config();
          if (cfg && typeof cfg.maxTroops === "function") {
            const res = cfg.maxTroops(p);
            if (Number.isFinite(res) && res > 0) return res;
          }
        }
      } catch (e) {}
      try {
        if (typeof p.maxTroops === "function") {
          const res = p.maxTroops();
          if (Number.isFinite(res) && res > 0) return res;
        }
      } catch (e) {}
      return 1e5;
    }
    function isAlive(p) {
      if (!p) return false;
      try {
        if (typeof p.isAlive === "function") return p.isAlive();
        return playerTroops(p) > 0;
      } catch (e) {
        return false;
      }
    }
    function isFriendly(myPlayer, other) {
      if (!myPlayer || !other) return false;
      try {
        if (typeof myPlayer.isFriendly === "function") return myPlayer.isFriendly(other);
      } catch (e) {}
      try {
        const id1 = typeof myPlayer.id === "function" ? myPlayer.id() : myPlayer.id;
        const id2 = typeof other.id === "function" ? other.id() : other.id;
        if (id1 && id1 === id2) return true;
      } catch (e) {}
      return false;
    }
    function validateAndSanitizeIntent(intent) {
      if (!intent || typeof intent !== "object" || typeof intent.type !== "string") return null;
      const isValidID = id => typeof id === "string" && /^[A-Za-z0-9]{8}$/.test(id);
      switch (intent.type) {
       case "spawn":
        {
          const tile = Math.floor(Number(intent.tile));
          if (!Number.isFinite(tile) || tile < 0) return null;
          return {
            type: "spawn",
            tile: tile
          };
        }

       case "attack":
        {
          const targetID = intent.targetID ? String(intent.targetID) : null;
          if (targetID !== null && !isValidID(targetID)) return null;
          const troops = intent.troops != null ? Math.max(0, Math.floor(Number(intent.troops))) : null;
          return {
            type: "attack",
            targetID: targetID,
            troops: troops
          };
        }

       case "boat":
        {
          const dst = Math.floor(Number(intent.dst));
          const troops = Math.max(0, Math.floor(Number(intent.troops)));
          if (!Number.isFinite(dst) || dst < 0 || !Number.isFinite(troops) || troops <= 0) return null;
          return {
            type: "boat",
            dst: dst,
            troops: troops
          };
        }

       case "build_unit":
        {
          const VALID_UNITS = new Set([ "City", "Port", "Factory", "Defense Post", "SAM Launcher", "Missile Silo", "Atom Bomb", "Hydrogen Bomb", "MIRV", "Warship" ]);
          if (!VALID_UNITS.has(intent.unit)) return null;
          const tile = Math.floor(Number(intent.tile));
          if (!Number.isFinite(tile) || tile < 0) return null;
          const out = {
            type: "build_unit",
            unit: intent.unit,
            tile: tile
          };
          if (typeof intent.rocketDirectionUp === "boolean") out.rocketDirectionUp = intent.rocketDirectionUp;
          return out;
        }

       case "move_warship":
        {
          const rawIds = Array.isArray(intent.unitIds) ? intent.unitIds : Array.isArray(intent.unitIDs) ? intent.unitIDs : [];
          const unitIds = rawIds.map((n => Math.floor(Number(n)))).filter((n => Number.isFinite(n)));
          const tile = Math.floor(Number(intent.tile ?? intent.dst));
          if (unitIds.length === 0 || !Number.isFinite(tile) || tile < 0) return null;
          return {
            type: "move_warship",
            unitIds: unitIds,
            tile: tile
          };
        }

       case "allianceRequest":
       case "alliance_request":
        {
          const recipient = String(intent.recipient ?? intent.targetID);
          if (!isValidID(recipient)) return null;
          return {
            type: "allianceRequest",
            recipient: recipient
          };
        }

       case "allianceReject":
       case "alliance_reply":
        {
          const requestor = String(intent.requestor ?? intent.targetID);
          if (!isValidID(requestor)) return null;
          return {
            type: "allianceReject",
            requestor: requestor
          };
        }

       case "allianceExtension":
        {
          const recipient = String(intent.recipient ?? intent.targetID);
          if (!isValidID(recipient)) return null;
          return {
            type: "allianceExtension",
            recipient: recipient
          };
        }

       case "breakAlliance":
        {
          const recipient = String(intent.recipient ?? intent.targetID);
          if (!isValidID(recipient)) return null;
          return {
            type: "breakAlliance",
            recipient: recipient
          };
        }

       case "donate_troops":
        {
          const recipient = String(intent.recipient ?? intent.targetID);
          if (!isValidID(recipient)) return null;
          const troops = Math.max(1, Math.floor(Number(intent.troops)));
          if (!Number.isFinite(troops) || troops <= 0) return null;
          return {
            type: "donate_troops",
            recipient: recipient,
            troops: troops
          };
        }

       case "embargo":
        {
          const targetID = String(intent.targetID ?? intent.recipient);
          if (!isValidID(targetID)) return null;
          const action = intent.action === "stop" ? "stop" : "start";
          return {
            type: "embargo",
            targetID: targetID,
            action: action
          };
        }

       case "emoji":
        {
          const recipient = intent.recipient === "AllPlayers" ? "AllPlayers" : String(intent.recipient);
          if (recipient !== "AllPlayers" && !isValidID(recipient)) return null;
          const emoji = Math.floor(Number(intent.emoji));
          if (!Number.isFinite(emoji) || emoji < 0 || emoji > 59) return null;
          return {
            type: "emoji",
            recipient: recipient,
            emoji: emoji
          };
        }

       default:
        return null;
      }
    }
    function sendPacket(intent) {
      if (!intent) return false;
      if (intent.type === "emoji" && botCfg.autoEmoji !== true) {
        return false;
      }
      const sanitized = validateAndSanitizeIntent(intent);
      if (!sanitized) {
        return false;
      }
      if (typeof api.sendPacket === "function") return api.sendPacket(sanitized);
      if (typeof api.sendIntent === "function") return api.sendIntent(sanitized);
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
    function getPlayerCenter(game, p) {
      if (!p || !game) return null;
      try {
        if (typeof p.nameLocation === "function") {
          const loc = p.nameLocation();
          if (loc && Number.isFinite(loc.x) && Number.isFinite(loc.y)) return loc;
        }
      } catch (e) {}
      try {
        const bts = getBorderTiles(game, p);
        if (bts.size === 0) return null;
        const w = typeof game.width === "function" ? game.width() : game.width || 500;
        let sx = 0, sy = 0, c = 0;
        for (const t of bts) {
          sx += t % w;
          sy += Math.floor(t / w);
          c++;
        }
        return c > 0 ? {
          x: sx / c,
          y: sy / c
        } : null;
      } catch (e) {
        return null;
      }
    }
    function getBorderingPlayerIDs(game, myPlayer) {
      if (!game || !myPlayer) return new Map;
      const myID = getMySmallID(myPlayer);
      const bordering = new Map;
      const myBts = getBorderTiles(game, myPlayer);
      for (const tile of myBts) {
        forEachNeighbor(game, tile, (n => {
          try {
            const o = game.ownerID(n);
            if (o && o !== myID && !bordering.has(o)) {
              const p = getPlayerBySmallID(game, o);
              if (p) bordering.set(o, p);
            }
          } catch (e) {}
        }));
      }
      return bordering;
    }
    function hasBorderWithTerraNullius(game, myPlayer) {
      if (!game || !myPlayer) return false;
      const myBts = getBorderTiles(game, myPlayer);
      for (const tile of myBts) {
        let touchesTN = false;
        forEachNeighbor(game, tile, (n => {
          try {
            if (game.isLand(n) && !game.hasOwner(n)) touchesTN = true;
          } catch (e) {}
        }));
        if (touchesTN) return true;
      }
      return false;
    }
    function isBot(p) {
      if (!p) return false;
      try {
        const t = typeof p.type === "function" ? p.type() : p.type;
        return t === "BOT" || t === "NATION";
      } catch (e) {
        return false;
      }
    }
    function findInteriorTile(game, myPlayer) {
      const ints = getInteriorTiles(game, myPlayer);
      if (ints.length > 0) return ints[Math.floor(Math.random() * ints.length)];
      const bts = Array.from(getBorderTiles(game, myPlayer));
      if (bts.length > 0) return bts[Math.floor(Math.random() * bts.length)];
      return null;
    }
    function findOwnedShoreTile(game, myPlayer) {
      const bts = Array.from(getBorderTiles(game, myPlayer));
      const shores = bts.filter((t => typeof game.isShore === "function" && game.isShore(t)));
      if (shores.length > 0) return shores[Math.floor(Math.random() * shores.length)];
      return findInteriorTile(game, myPlayer);
    }
    function findTargetCityTile(p) {
      if (!p) return null;
      const cities = playerUnits(p).filter((u => unitType(u) === "City"));
      if (cities.length > 0) {
        const c = cities[Math.floor(Math.random() * cities.length)];
        return typeof c.tile === "function" ? c.tile() : c.tile;
      }
      return null;
    }
    function findTargetShoreTile(game, p) {
      if (!p || !game) return null;
      const bts = Array.from(getBorderTiles(game, p));
      const shores = bts.filter((t => typeof game.isShore === "function" && game.isShore(t)));
      if (shores.length > 0) return shores[Math.floor(Math.random() * shores.length)];
      if (bts.length > 0) return bts[Math.floor(Math.random() * bts.length)];
      return null;
    }
    function randTerritoryTileArray(game, p, count = 20) {
      if (!p || !game) return [];
      const bts = Array.from(getBorderTiles(game, p));
      if (bts.length === 0) return [];
      const results = [];
      for (let i = 0; i < count; i++) {
        results.push(bts[Math.floor(Math.random() * bts.length)]);
      }
      return results;
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
    function getGamePhase(game) {
      if (!game) return "mid";
      try {
        const totalLand = typeof game.numLandTiles === "function" ? game.numLandTiles() : 5e4;
        const all = getAllPlayers(game);
        let ownedLand = 0;
        for (const p of all) {
          if (isAlive(p)) {
            ownedLand += typeof p.numTilesOwned === "function" ? Number(p.numTilesOwned()) || 0 : 0;
          }
        }
        const landClaimedPct = ownedLand / Math.max(1, totalLand);
        if (landClaimedPct < .65) return "early";
        if (landClaimedPct < .9) return "mid";
        return "late";
      } catch (e) {
        return "mid";
      }
    }
    function getDynamicReserve(game, myPlayer, opponent, phase = "mid") {
      const baseReserve = botCfg.reserveRatio ?? .42;
      const effBase = getEffectiveReserveRatio(game, myPlayer, baseReserve);
      const isPunish = OppTracker.isPunishWindow;
      const inDPRange = frontlineInDPRange(game, myPlayer, opponent);
      let mult = 1;
      if (isPunish) mult = .55; else if (inDPRange) mult = 1.45; else if (phase === "early") mult = .85; else if (phase === "late") mult = 1.25;
      return Math.max(.2, Math.min(.7, effBase * mult));
    }
    function findOurVulnerableNecks(game, myPlayer, opponent) {
      if (!opponent || !myPlayer) return [];
      const myID = getMySmallID(myPlayer);
      const myBts = getBorderTiles(game, myPlayer);
      const necks = [];
      for (const tile of myBts) {
        let emptyCount = 0;
        let myCount = 0;
        forEachNeighbor(game, tile, (n => {
          try {
            const o = game.ownerID(n);
            if (!game.hasOwner(n) || o === null || o === undefined || o === 0 || o === -1) {
              if (game.isLand(n)) emptyCount++;
            } else if (o === myID) {
              myCount++;
            }
          } catch (e) {}
        }));
        if (emptyCount >= 2 && myCount <= 2) necks.push(tile);
      }
      return necks;
    }
    function find1v1CityTile(game, myPlayer, existingCities = [], opponent = null) {
      const ints = getInteriorTiles(game, myPlayer);
      if (ints.length === 0) return findInteriorTile(game, myPlayer);
      const minSpacing = 16;
      const oppCenter = opponent ? getPlayerCenter(game, opponent) : null;
      const w = typeof game.width === "function" ? game.width() : 500;
      let bestTile = null;
      let maxDistFromOpp = -1;
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
        let distFromOpp = 0;
        if (oppCenter) {
          const x = tile % w, y = Math.floor(tile / w);
          distFromOpp = Math.hypot(x - oppCenter.x, y - oppCenter.y);
        } else {
          distFromOpp = Math.random() * 100;
        }
        if (distFromOpp > maxDistFromOpp) {
          maxDistFromOpp = distFromOpp;
          bestTile = tile;
        }
      }
      return bestTile || ints[0] || null;
    }
    function find1v1DefensePostTile(game, myPlayer, opponent, existingDPs = []) {
      const fl = analyzeFrontline(game, myPlayer, opponent);
      const candidates = fl && fl.sharedBorder.length > 0 ? fl.sharedBorder : Array.from(getBorderTiles(game, myPlayer));
      if (candidates.length === 0) return null;
      const minSpacing = 20;
      const activeAttacks = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
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
      const targetID = target && (typeof target.isPlayer === "function" ? target.isPlayer() : true) ? getPlayerID(target) : null;
      return sendPacket({
        type: "attack",
        targetID: targetID,
        troops: sendAmt
      });
    }
    const RatioNationEngine = function() {
      function setStatus(s) {
        state.status = s;
      }
      function setLastAction(a, cat) {
        state.lastAction = a;
      }
      function refreshGateBanner() {}
      function renderHeader() {}
      function renderStatus() {}
      function renderLog() {}
      function pushLog() {}
      const UNIT = {
        City: "City",
        Port: "Port",
        Factory: "Factory",
        SAMLauncher: "SAM Launcher",
        MissileSilo: "Missile Silo",
        DefensePost: "Defense Post",
        TransportShip: "Transport",
        TradeShip: "Trade",
        Warship: "Warship",
        AtomBomb: "Atom Bomb",
        HydrogenBomb: "Hydrogen Bomb",
        MIRV: "MIRV",
        MIRVWarhead: "MIRV Warhead"
      };
      const PANEL_ID = "openfront-helper-auto-bot-panel";
      const STYLE_ID = "openfront-helper-auto-bot-styles";
      const STORAGE_KEY = "openfront-helper-autobot-v1";
      const DEFAULTS = {
        enabled: true,
        difficulty: "Impossible",
        features: {
          spawn: true,
          expand: true,
          build: true,
          boat: true,
          nuke: true,
          warship: true,
          alliance: true,
          embargo: true,
          donate: true,
          betray: true
        },
        buildStructures: {
          [UNIT.City]: true,
          [UNIT.Port]: true,
          [UNIT.Factory]: true,
          [UNIT.DefensePost]: true,
          [UNIT.SAMLauncher]: true,
          [UNIT.MissileSilo]: true
        },
        winFixes: true,
        smartSpawn: true,
        combatCadenceScale: .6,
        sizeReserveScale: 1.5,
        sizeReserveCap: .6,
        mirvLeaderShare: .4,
        mirvPreemptFrac: .85,
        mirvTargetMinShare: .35,
        mirvTargetTopN: 3,
        mirvEarlyGameTicks: 6e3,
        teamWonShare: null,
        factoryRailShare: .75,
        boatProbeFrac: .01,
        boatProbeMinTroops: 1e3,
        boatSurgeFrac: .25,
        oppBoatThrottleMs: 350,
        maxConcurrentBoats: 3,
        boatSpreadRadius: 30,
        mirvBoatWindowTicks: 150,
        donateThrottleMs: 1200,
        donateNeedThreshold: .8,
        donateKeepFrac: .45,
        farAllyThrottleMs: 4e3,
        warshipPatrolThrottleMs: 1500,
        warshipMoveMaxDist: 160,
        warshipMoveCooldownTicks: 60,
        warshipLossMinDist: 25,
        warshipLossWindowTicks: 900,
        warshipRaidWindowTicks: 400,
        warshipLossZoneMin: 2,
        warshipLossZoneRadius: 35,
        warshipRetreatHealthPct: 50,
        warshipHuntTrade: true,
        warshipCombatThrottleMs: 800,
        warshipAutoSpawn: true,
        warshipEvade: true,
        warshipNukeDodge: true,
        warshipServiceCellSize: 40,
        warshipZoneServiceTicks: 90,
        warshipNukeDodgeMargin: 8,
        warshipNukeDodgeBuffer: 20,
        warshipNukeDodgeSamples: 8,
        warshipNukeDodgeRings: 3,
        donateMinExcessFrac: .05,
        donateMinDonatePct: .2,
        boatWeakTroopFrac: .6,
        distantBoatProbeMax: 12,
        boatSurplusFill: .4,
        boatIslandFill: .15,
        islandScanRadius: 40,
        islandScanStep: 2,
        islandScanSamples: 6,
        islandProbeMax: 4,
        tickMs: 200,
        minimized: false,
        hidden: false,
        statusOpen: false,
        featsOpen: true,
        pos: null
      };
      const MAX_DEFENSE_RESERVE = .8;
      const EARLY_EXPAND_COMMIT = .6;
      const BUILD_THROTTLE_MS = 1800;
      const NUKE_THROTTLE_MS = 6e3;
      const MIRV_COOLDOWN_MS = 3e4;
      const MIRV_DOMINANCE_SHARE = .5;
      const MIRV_STEAMROLL_MIN_CITIES = 10;
      const MIRV_STEAMROLL_GAP = 1.25;
      const WARSHIP_THROTTLE_MS = 4e3;
      const ALLIANCE_THROTTLE_MS = 2e3;
      const BORDER_CACHE_MS = 2200;
      const UNDER_ATTACK_RATIO = .35;
      const state = {
        settings: loadSettings(),
        tickTimer: null,
        tickIntervalMs: 0,
        tickInFlight: false,
        tickStartedAt: 0,
        lastCombatMs: 0,
        lastPlayerAttackMs: 0,
        lastRetaliateMs: 0,
        lastBuildMs: 0,
        lastNukeMs: 0,
        lastWarshipMs: 0,
        lastWarshipMoveMs: 0,
        lastWarshipPatrolMs: 0,
        lastAllianceMs: 0,
        lastEmbargoMs: 0,
        lastDonateMs: 0,
        beachhead: null,
        recentMirvHits: [],
        lastOppBoatMs: 0,
        lastNuker: null,
        recentNukes: [],
        hostility: new Map,
        nukeReserveGold: 0,
        nukeWantSlots: null,
        lastMirv: null,
        navalThreatAt: 0,
        speed: {
          lastTick: null,
          lastMs: 0,
          factor: 1
        },
        border: {
          tiles: null,
          atMs: 0
        },
        landBorderEnemySids: new Set,
        status: "",
        lastAction: "—",
        stats: {
          spawns: 0,
          attacks: 0,
          builds: 0,
          nukes: 0
        },
        live: {
          troops: 0,
          gold: 0,
          tiles: 0,
          fill: 0
        },
        log: [],
        activeTab: "control",
        logFilter: "all"
      };
      const LOG_CATS = {
        spawn: {
          label: "Spawn",
          emoji: "🏁"
        },
        combat: {
          label: "Combat",
          emoji: "⚔️"
        },
        naval: {
          label: "Naval",
          emoji: "🚢"
        },
        build: {
          label: "Building",
          emoji: "🏗️"
        },
        nuke: {
          label: "Strikes",
          emoji: "☢️"
        },
        diplo: {
          label: "Diplomacy",
          emoji: "🤝"
        }
      };
      const LOG_CAP = 200;
      function loadSettings() {
        const e = [ "enabled", "difficulty", "winFixes", "smartSpawn", "minimized", "hidden", "statusOpen", "featsOpen", "pos", "tickMs", "donateKeepFrac", "donateNeedThreshold", "donateThrottleMs", "donateMinDonatePct", "warshipRetreatHealthPct", "warshipHuntTrade", "warshipCombatThrottleMs", "warshipAutoSpawn", "warshipEvade", "warshipNukeDodge", "warshipPatrolThrottleMs" ];
        const t = JSON.parse(JSON.stringify(DEFAULTS));
        try {
          const n = window?.localStorage?.getItem?.(STORAGE_KEY);
          if (n) {
            const o = JSON.parse(n);
            for (const r of e) {
              if (o[r] !== void 0) t[r] = o[r];
            }
            t.features = {
              ...DEFAULTS.features,
              ...o.features || {}
            };
            t.buildStructures = {
              ...DEFAULTS.buildStructures,
              ...o.buildStructures || {}
            };
          }
        } catch (n) {
          console.warn("[AutoBot] failed to load settings:", n);
        }
        return t;
      }
      function saveSettings() {
        try {
          window?.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(state.settings));
        } catch (e) {
          console.warn("[AutoBot] failed to save settings:", e);
        }
      }
      "use strict";
      let autoBotBundle = null;
      let autoBotLang = "en";
      function tr(e, t) {
        let n = autoBotBundle && autoBotBundle[e] || e;
        if (t) {
          for (const o in t) {
            n = n.split("{" + o + "}").join(String(t[o]));
          }
        }
        return n;
      }
      function setAutoBotI18n(e, t) {
        const n = e || "en";
        const o = n !== autoBotLang;
        const r = t && typeof t === "object" && t !== autoBotBundle;
        autoBotLang = n;
        if (t && typeof t === "object") {
          autoBotBundle = t;
        }
        if (o || r) {
          relocalizeAutoBotPanel();
        }
      }
      function relocalizeAutoBotPanel() {
        if (!state.settings.enabled) {
          state.status = "";
        }
        const e = document.getElementById(PANEL_ID);
        if (e && typeof buildPanel === "function") {
          e.remove();
          buildPanel();
        }
        if (typeof renderStatus === "function") renderStatus();
        if (typeof renderLog === "function") renderLog();
      }
      "use strict";
      function gameType(e) {
        try {
          return e?.config?.().gameConfig?.().gameType ?? null;
        } catch (t) {
          return null;
        }
      }
      function isPublicLobby(e) {
        return false;
      }
      function randInt(e, t) {
        return Math.floor(Math.random() * (t - e + 1)) + e;
      }
      function clamp(e, t, n) {
        return Math.max(t, Math.min(n, e));
      }
      function shuffleInPlace(e) {
        for (let t = e.length - 1; t > 0; t--) {
          const n = Math.floor(Math.random() * (t + 1));
          [e[t], e[n]] = [ e[n], e[t] ];
        }
        return e;
      }
      function toNum(e) {
        if (typeof e === "bigint") return Number(e);
        const t = Number(e);
        return Number.isFinite(t) ? t : 0;
      }
      function withTimeout(e, t, n) {
        return Promise.race([ Promise.resolve(e).catch((() => n)), new Promise((o => window.setTimeout((() => o(n)), t))) ]);
      }
      const WORKER_TIMEOUT_MS = 2500;
      function updateSpeedFactor(e) {
        let t = NaN;
        try {
          t = Number(e.ticks?.());
        } catch (i) {
          t = NaN;
        }
        if (!Number.isFinite(t)) return;
        const n = performance.now();
        const o = state.speed;
        if (o.lastTick === null) {
          o.lastTick = t;
          o.lastMs = n;
          return;
        }
        const r = t - o.lastTick;
        const a = n - o.lastMs;
        if (a >= 1500) {
          if (r > 0) {
            const i = r / a * 1e3;
            const s = clamp(i / 10, .25, 12);
            o.factor = o.factor * .6 + s * .4;
          }
          o.lastTick = t;
          o.lastMs = n;
        }
      }
      function scaled(e) {
        return e / Math.max(.25, state.speed.factor || 1);
      }
      function safeMaxTroops(e, t) {
        try {
          const n = e.config().maxTroops(t);
          return Number.isFinite(n) && n > 0 ? n : 0;
        } catch (n) {
          return 0;
        }
      }
      function safeName(e) {
        try {
          return String(e.displayName?.() ?? e.name?.() ?? "?");
        } catch (t) {
          return "?";
        }
      }
      "use strict";
      function findContext() {
        try {
          if (typeof getOpenFrontGameContext === "function") {
            const t = getOpenFrontGameContext();
            if (t?.game?.myPlayer) return t;
          }
        } catch (t) {}
        try {
          if (lastOpenFrontGameContext?.game?.myPlayer) {
            return lastOpenFrontGameContext;
          }
        } catch (t) {}
        const e = [ "main-radial-menu", "build-menu", "control-panel", "leader-board", "options-menu" ];
        for (const t of e) {
          const n = document.querySelector(t);
          if (n?.game?.myPlayer) {
            return {
              game: n.game,
              transform: n.transformHandler || n.transform || null
            };
          }
        }
        return null;
      }
      function getGame() {
        return findContext()?.game ?? null;
      }
      function getRadialMenu() {
        return document.querySelector("main-radial-menu");
      }
      function getBuildMenu() {
        return document.querySelector("build-menu") || getRadialMenu()?.buildMenu || null;
      }
      function getEventBus() {
        const e = getBuildMenu();
        if (e?.eventBus) return e.eventBus;
        const t = document.querySelector("control-panel");
        if (t?.eventBus) return t.eventBus;
        const n = document.querySelector("leader-board");
        if (n?.eventBus) return n.eventBus;
        return getRadialMenu()?.eventBus ?? null;
      }
      const _ctors = {
        bus: null,
        spawn: null,
        attack: null,
        boat: null,
        moveWarship: null,
        embargo: null,
        donateTroops: null,
        emoji: null,
        target: null,
        allianceRequest: null
      };
      const _alliancesActioned = new WeakSet;
      function getListenersMap(e) {
        if (e?.listeners instanceof Map) return e.listeners;
        for (const t of Object.getOwnPropertyNames(e || {})) {
          try {
            if (e[t] instanceof Map) return e[t];
          } catch (n) {}
        }
        return null;
      }
      function discoverCtors(e) {
        if (_ctors.bus === e && _ctors.attack && _ctors.spawn && _ctors.boat && _ctors.moveWarship && _ctors.embargo && _ctors.donateTroops) {
          return _ctors;
        }
        const t = getListenersMap(e);
        if (!t) return _ctors;
        _ctors.bus = e;
        for (const n of t.keys()) {
          if (typeof n !== "function") continue;
          if (!_ctors.moveWarship) {
            try {
              const o = new n([ 7, 8 ], 99);
              if (o && Array.isArray(o.unitIds) && o.unitIds[0] === 7 && o.tile === 99) {
                _ctors.moveWarship = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.embargo) {
            try {
              const o = {
                __probe: 1
              };
              const r = new n(o, "start");
              if (r && r.target === o && r.action === "start") {
                _ctors.embargo = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.donateTroops) {
            try {
              const o = {
                __probe: 1
              };
              const r = new n(o, 123);
              if (r && r.recipient === o && r.troops === 123) {
                _ctors.donateTroops = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.emoji) {
            try {
              const o = {
                __probe: 1
              };
              const r = new n(o, 7);
              if (r && r.recipient === o && r.emoji === 7 && r.troops === void 0 && r.action === void 0) {
                _ctors.emoji = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.target) {
            try {
              const o = new n("§tp", 456);
              if (o && o.targetID === "§tp" && o.troops === void 0 && o.recipient === void 0 && o.dst === void 0 && o.emoji === void 0) {
                _ctors.target = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.attack) {
            try {
              const o = new n("§p", 123);
              if (o && o.targetID === "§p" && o.troops === 123 && o.dst === void 0) {
                _ctors.attack = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.boat) {
            try {
              const o = new n(77, 123);
              if (o && o.dst === 77 && o.troops === 123) {
                _ctors.boat = n;
                continue;
              }
            } catch (o) {}
          }
          if (!_ctors.spawn) {
            try {
              const o = new n(55);
              if (o && o.tile === 55 && o.targetID === void 0 && o.dst === void 0 && o.unit === void 0 && o.troops === void 0) {
                _ctors.spawn = n;
                continue;
              }
            } catch (o) {}
          }
        }
        return _ctors;
      }
      function emitIntent(e, ...t) {
        const n = getEventBus();
        if (n && typeof e === "function") {
          try {
            n.emit(new e(...t));
            return true;
          } catch (o) {
            console.error("[AutoBot] emit failed:", o);
          }
        }
        if (typeof sendPacket === "function") {
          try {
            if (e === _ctors.spawn || e === "spawn") {
              return sendPacket({
                type: "spawn",
                tile: Math.floor(Number(t[0]))
              });
            }
            if (e === _ctors.attack || e === "attack") {
              const target = t[0];
              const troops = t[1];
              const targetID = target ? typeof getPlayerID === "function" ? getPlayerID(target) : target.id ? target.id() : String(target) : null;
              return sendPacket({
                type: "attack",
                targetID: targetID,
                troops: typeof troops === "number" ? troops : null
              });
            }
            if (e === _ctors.boat || e === "boat") {
              return sendPacket({
                type: "boat",
                dst: Math.floor(Number(t[0])),
                troops: Number(t[1])
              });
            }
            if (e === _ctors.moveWarship || e === "move_warship") {
              const unitIds = Array.isArray(t[0]) ? t[0] : [ Number(t[0]) ];
              return sendPacket({
                type: "move_warship",
                unitIds: unitIds,
                tile: Math.floor(Number(t[1]))
              });
            }
            if (e === _ctors.allianceRequest || e === "allianceRequest") {
              const recipient = t[1] || t[0];
              const rId = typeof getPlayerID === "function" ? getPlayerID(recipient) : recipient.id ? recipient.id() : String(recipient);
              if (rId) return sendPacket({
                type: "allianceRequest",
                recipient: rId
              });
            }
            if (e === _ctors.embargo || e === "embargo") {
              const target = t[0];
              const action = t[1] || "start";
              const tId = typeof getPlayerID === "function" ? getPlayerID(target) : target.id ? target.id() : String(target);
              if (tId) return sendPacket({
                type: "embargo",
                targetID: tId,
                action: action
              });
            }
            if (e === _ctors.donateTroops || e === "donate_troops") {
              const recipient = t[0];
              const troops = t[1];
              const rId = typeof getPlayerID === "function" ? getPlayerID(recipient) : recipient.id ? recipient.id() : String(recipient);
              if (rId) return sendPacket({
                type: "donate_troops",
                recipient: rId,
                troops: Number(troops)
              });
            }
            if (e === _ctors.emoji || e === "emoji") {
              const recipient = t[0];
              const emoji = t[1];
              const rId = recipient === "AllPlayers" ? "AllPlayers" : typeof getPlayerID === "function" ? getPlayerID(recipient) : recipient.id ? recipient.id() : String(recipient);
              if (rId) return sendPacket({
                type: "emoji",
                recipient: rId,
                emoji: Number(emoji)
              });
            }
          } catch (err) {}
        }
        return false;
      }
      function diagnose() {
        const e = getGame();
        const t = getEventBus();
        const n = t ? discoverCtors(t) : _ctors;
        const o = getBuildMenu();
        const r = e?.myPlayer?.();
        const a = {
          game: !!e,
          gameType: e ? gameType(e) : null,
          inSpawnPhase: e?.inSpawnPhase?.() ?? null,
          myPlayer: !!r,
          hasSpawned: r?.hasSpawned?.() ?? null,
          buildMenu: !!o,
          sendBuildOrUpgrade: typeof o?.sendBuildOrUpgrade,
          eventBus: !!t,
          ctorSpawn: !!n.spawn,
          ctorAttack: !!n.attack,
          ctorBoat: !!n.boat,
          ctorMoveWarship: !!n.moveWarship,
          ctorEmbargo: !!n.embargo,
          ctorDonateTroops: !!n.donateTroops,
          ctorEmoji: !!n.emoji,
          ctorAllianceRequest: !!n.allianceRequest,
          speedFactor: Math.round((state.speed?.factor ?? 1) * 100) / 100,
          gold: r ? Math.round(toNum(r.gold?.())) : 0,
          troops: r ? Math.round(toNum(r.troops?.())) : 0,
          tiles: r ? toNum(r.numTilesOwned?.()) : 0,
          botStatus: (() => {
            try {
              return typeof _bot !== "undefined" && _bot ? _bot.status : "no-bot";
            } catch (i) {
              return "n/a";
            }
          })(),
          eventsDisplayEvents: (() => {
            try {
              return document.querySelector("events-display")?.events?.length ?? null;
            } catch (i) {
              return null;
            }
          })()
        };
        console.log("[AutoBot] DIAG", a);
        return a;
      }
      window.__autoBotDiag = diagnose;
      "use strict";
      async function getBorderTiles(e, t) {
        const n = performance.now();
        if (state.border.tiles && n - state.border.atMs < scaled(BORDER_CACHE_MS)) {
          return state.border.tiles;
        }
        let o = [];
        try {
          const r = await withTimeout(t.borderTiles(), WORKER_TIMEOUT_MS, null);
          const a = r?.borderTiles ?? r;
          o = a ? Array.from(a) : [];
        } catch (r) {
          console.warn("[AutoBot] borderTiles failed:", r);
          o = [];
        }
        state.border = {
          tiles: o,
          atMs: n
        };
        return o;
      }
      function isOceanAdjacent(e, t) {
        try {
          if (typeof e.isOceanShore === "function") return e.isOceanShore(t);
        } catch (n) {}
        for (const n of e.neighbors(t)) {
          if (e.isOcean?.(n)) return true;
        }
        return false;
      }
      function analyzeBorder(e, t, n) {
        const o = t.smallID?.();
        let r = false;
        let a = false;
        let i = false;
        let s = false;
        const l = new Map;
        const c = new Map;
        for (const u of n) {
          if (!i && e.isShore?.(u)) i = true;
          if (!s && isOceanAdjacent(e, u)) s = true;
          for (const d of e.neighbors(u)) {
            if (!e.isLand(d)) continue;
            if (e.ownerID(d) === o) continue;
            if (!e.hasOwner(d)) {
              if (e.hasFallout?.(d)) {
                a = true;
              } else {
                r = true;
              }
              continue;
            }
            const f = e.owner(d);
            if (!f?.isPlayer?.()) continue;
            if (f.smallID?.() === o) continue;
            if (t.isFriendly?.(f)) {
              c.set(f.smallID(), f);
              continue;
            }
            l.set(f.smallID(), f);
          }
        }
        return {
          hasOpenLand: r,
          hasNukedLand: a,
          hasShore: i,
          hasCoastal: s,
          enemies: Array.from(l.values()),
          friends: Array.from(c.values())
        };
      }
      function boundingBox(e, t) {
        let n = Infinity;
        let o = Infinity;
        let r = -Infinity;
        let a = -Infinity;
        for (const i of t) {
          const s = e.x(i);
          const l = e.y(i);
          if (s < n) n = s;
          if (s > r) r = s;
          if (l < o) o = l;
          if (l > a) a = l;
        }
        if (!Number.isFinite(n)) return null;
        return {
          minX: n,
          minY: o,
          maxX: r,
          maxY: a
        };
      }
      "use strict";
      const Difficulty = {
        Easy: "Easy",
        Medium: "Medium",
        Hard: "Hard",
        Impossible: "Impossible"
      };
      const GameType = {
        Singleplayer: "Singleplayer",
        Public: "Public",
        Private: "Private"
      };
      const GameMode = {
        FFA: "Free For All",
        Team: "Team"
      };
      const PlayerType = {
        Bot: "BOT",
        Human: "HUMAN",
        Nation: "NATION"
      };
      const TerrainType = {
        Plains: 0,
        Highland: 1,
        Mountain: 2,
        Lake: 3,
        Ocean: 4
      };
      function currentDifficulty() {
        const e = state && state.settings ? state.settings.difficulty : null;
        switch (e) {
         case "Easy":
         case "Medium":
         case "Hard":
         case "Impossible":
          return e;

         default:
          return Difficulty.Impossible;
        }
      }
      class PseudoRandom {
        constructor(t) {
          let n = Number(t) >>> 0 || 1;
          this._next01 = function() {
            n |= 0;
            n = n + 1831565813 | 0;
            let o = Math.imul(n ^ n >>> 15, 1 | n);
            o = o + Math.imul(o ^ o >>> 7, 61 | o) ^ o;
            return ((o ^ o >>> 14) >>> 0) / 4294967296;
          };
        }
        next() {
          return this._next01();
        }
        nextInt(t, n) {
          const o = Math.floor(t);
          const r = Math.floor(n);
          return Math.floor(this._next01() * (r - o)) + o;
        }
        nextFloat(t, n) {
          return this._next01() * (n - t) + t;
        }
        randElement(t) {
          if (t.length === 0) throw new Error("array must not be empty");
          return t[this.nextInt(0, t.length)];
        }
        randFromSet(t) {
          const n = t.size;
          if (n === 0) throw new Error("set must not be empty");
          const o = this.nextInt(0, n);
          let r = 0;
          for (const a of t) {
            if (r === o) return a;
            r++;
          }
          throw new Error("Unexpected error selecting element from set");
        }
        chance(t) {
          return this.nextInt(0, t) === 0;
        }
        shuffleArray(t) {
          const n = [ ...t ];
          for (let o = n.length - 1; o > 0; o--) {
            const r = this.nextInt(0, o + 1);
            [n[o], n[r]] = [ n[r], n[o] ];
          }
          return n;
        }
      }
      function simpleHash(e) {
        let t = 0;
        for (let n = 0; n < e.length; n++) {
          const o = e.charCodeAt(n);
          t = (t << 5) - t + o;
          t = t & t;
        }
        return Math.abs(t);
      }
      function within(e, t, n) {
        return Math.min(Math.max(e, t), n);
      }
      function closestTile(e, t, n) {
        let o = Infinity;
        let r = null;
        for (const a of t) {
          const i = e.manhattanDist(a, n);
          if (i < o) {
            o = i;
            r = a;
          }
        }
        return [ r, o ];
      }
      function closestTwoTiles(e, t, n) {
        const o = Array.from(t).sort(((c, u) => e.x(c) - e.x(u)));
        const r = Array.from(n).sort(((c, u) => e.x(c) - e.x(u)));
        if (o.length === 0 || r.length === 0) return null;
        let a = 0;
        let i = 0;
        let s = Infinity;
        let l = {
          x: o[0],
          y: r[0]
        };
        while (a < o.length && i < r.length) {
          const c = o[a];
          const u = r[i];
          const d = Math.abs(e.x(c) - e.x(u)) + Math.abs(e.y(c) - e.y(u));
          if (d < s) {
            s = d;
            l = {
              x: c,
              y: u
            };
          }
          if (a === o.length - 1) {
            i++;
          } else if (i === r.length - 1) {
            a++;
          } else if (e.x(c) < e.x(u)) {
            a++;
          } else {
            i++;
          }
        }
        return l;
      }
      function calculateBoundingBox(e, t) {
        let n = Infinity, o = Infinity, r = -Infinity, a = -Infinity;
        for (const i of t) {
          const s = e.x(i);
          const l = e.y(i);
          n = Math.min(n, s);
          o = Math.min(o, l);
          r = Math.max(r, s);
          a = Math.max(a, l);
        }
        return {
          min: {
            x: n,
            y: o
          },
          max: {
            x: r,
            y: a
          }
        };
      }
      function boundingBoxCenter(e) {
        return {
          x: e.min.x + Math.floor((e.max.x - e.min.x) / 2),
          y: e.min.y + Math.floor((e.max.y - e.min.y) / 2)
        };
      }
      function calculateBoundingBoxCenter(e, t) {
        return boundingBoxCenter(calculateBoundingBox(e, t));
      }
      function boundingBoxTiles(e, t, n) {
        const o = [];
        const r = e.x(t);
        const a = e.y(t);
        const i = r - n;
        const s = r + n;
        const l = a - n;
        const c = a + n;
        for (let u = i; u <= s; u++) {
          if (e.isValidCoord(u, l)) o.push(e.ref(u, l));
          if (e.isValidCoord(u, c) && l !== c) o.push(e.ref(u, c));
        }
        for (let u = l + 1; u < c; u++) {
          if (e.isValidCoord(i, u)) o.push(e.ref(i, u));
          if (e.isValidCoord(s, u) && i !== s) o.push(e.ref(s, u));
        }
        return o;
      }
      function calculateTerritoryCenter(e, t) {
        const n = t.borderTiles();
        if (n.size === 0) return null;
        let o = Infinity, r = -Infinity, a = Infinity, i = -Infinity;
        for (const p of n) {
          const h = e.x(p);
          const m = e.y(p);
          if (h < o) o = h;
          if (h > r) r = h;
          if (m < a) a = m;
          if (m > i) i = m;
        }
        const s = Math.floor((o + r) / 2);
        const l = Math.floor((a + i) / 2);
        const c = e.ref(s, l);
        const u = e.owner(c);
        if (u && u.isPlayer && u.isPlayer() && u.smallID() === t.smallID()) {
          return c;
        }
        let d = null;
        let f = Infinity;
        for (const p of n) {
          const h = e.x(p) - s;
          const m = e.y(p) - l;
          const g = h * h + m * m;
          if (g < f) {
            f = g;
            d = p;
          }
        }
        return d;
      }
      function randTerritoryTileArray(e, t, n, o) {
        const r = calculateBoundingBox(t, n.borderTiles());
        const a = [];
        for (let i = 0; i < o; i++) {
          const s = randTerritoryTile(e, t, n, r);
          if (s !== null) a.push(s);
        }
        return a;
      }
      function randTerritoryTile(e, t, n, o) {
        if (o == null) {
          o = calculateBoundingBox(t, n.borderTiles());
        }
        for (let a = 0; a < 100; a++) {
          const i = e.nextInt(o.min.x, o.max.x);
          const s = e.nextInt(o.min.y, o.max.y);
          if (!t.isValidCoord(i, s)) continue;
          const l = t.ref(i, s);
          const c = t.owner(l);
          if (c && c.isPlayer && c.isPlayer() && c.smallID() === n.smallID()) {
            return l;
          }
        }
        const r = n.borderTiles();
        if (n.numTilesOwned() > 0 && n.numTilesOwned() <= 100 && r.size > 0) {
          return e.randElement(Array.from(r));
        }
        return null;
      }
      "use strict";
      const Relation = {
        Hostile: 0,
        Distrustful: 1,
        Neutral: 2,
        Friendly: 3
      };
      function relationFromValue(e) {
        if (e < -50) return Relation.Hostile;
        if (e < 0) return Relation.Distrustful;
        if (e < 50) return Relation.Neutral;
        return Relation.Friendly;
      }
      function bucketMidpoint(e) {
        switch (e) {
         case Relation.Hostile:
          return -75;

         case Relation.Distrustful:
          return -25;

         case Relation.Friendly:
          return 75;

         default:
          return 25;
        }
      }
      function createGameApi(e) {
        const t = new Map;
        const n = new Map;
        const o = new Map;
        let r = new Map;
        let a = [];
        let i = null;
        let s = -1;
        const l = k => k && k.__src ? k.__src : k;
        function c(k) {
          try {
            return !!(k && typeof k.isPlayer === "function" && k.isPlayer());
          } catch (I) {
            return false;
          }
        }
        function u(k) {
          if (k == null) return k;
          const I = (B, C) => (...F) => typeof k[B] === "function" ? k[B](...F) : C;
          return {
            __src: k,
            owner: () => h(k.owner()),
            type: I("type", null),
            tile: I("tile", null),
            level: I("level", 1),
            id: I("id", null),
            isActive: I("isActive", false),
            isUnderConstruction: I("isUnderConstruction", false),
            isInCombat: I("isInCombat", false),
            hasTrainStation: I("hasTrainStation", false),
            missileTimerQueue: I("missileTimerQueue", []),
            targetTile: I("targetTile", void 0),
            patrolTile: I("patrolTile", void 0),
            warshipState: I("warshipState", void 0),
            transportShipState: I("transportShipState", void 0),
            health: I("health", void 0),
            ticksLeftInCooldown: I("ticksLeftInCooldown", 0),
            lastSetSafeFromPirates: I("lastSetSafeFromPirates", void 0)
          };
        }
        function d(k) {
          const I = B => typeof B === "function" ? B() : B;
          return {
            __src: k,
            troops: () => Number(I(k.troops) ?? 0),
            attacker: () => h(typeof k.attacker === "function" ? k.attacker() : f(k.attackerID)),
            target: () => h(typeof k.target === "function" ? k.target() : f(k.targetID)),
            retreating: () => I(k.retreating) ?? false,
            id: () => I(k.id),
            hasSourceTile: () => k.sourceTile !== void 0,
            sourceTile: () => k.sourceTile !== void 0 ? I(k.sourceTile) : null
          };
        }
        function f(k) {
          if (k == null) return null;
          try {
            return e.playerBySmallID(k);
          } catch (I) {
            return null;
          }
        }
        function p(k) {
          const I = r.has(k) ? r.get(k) : Relation.Neutral;
          const B = o.get(k) ?? 0;
          return bucketMidpoint(I) + B;
        }
        function h(k) {
          if (k == null) return null;
          if (!c(k)) {
            return k;
          }
          const I = k.smallID();
          let B = t.get(I);
          if (B) {
            B.__src = k;
            return B;
          }
          B = m(k);
          t.set(I, B);
          return B;
        }
        function m(k) {
          const I = (C, F) => (...H) => typeof k[C] === "function" ? k[C](...H.map((X => X && X.__src ? X.__src : X))) : F;
          const B = {
            __src: k,
            isPlayer: () => true,
            isAlive: I("isAlive", false),
            hasSpawned: I("hasSpawned", false),
            smallID: () => k.smallID(),
            id: () => k.id(),
            clientID: I("clientID", null),
            type: I("type", null),
            name: I("name", "?"),
            displayName: I("displayName", "?"),
            troops: () => Number(k.troops?.() ?? 0),
            gold: () => k.gold?.() ?? 0n,
            numTilesOwned: () => Number(k.numTilesOwned?.() ?? 0),
            team: I("team", null),
            maxTroops: () => j.config().maxTroops(B),
            isTraitor: I("isTraitor", false),
            isDisconnected: I("isDisconnected", false),
            betrayals: I("betrayals", 0),
            getTraitorRemainingTicks: I("getTraitorRemainingTicks", 0),
            units: (...C) => k.units(...C).map(u),
            unitCount: C => k.units(C).length,
            unitsOwned: C => k.units(C).filter((F => !(F.isUnderConstruction?.() ?? false))).length,
            unitsConstructed: C => k.units(C).some((F => !(F.isUnderConstruction?.() ?? false))),
            totalUnitLevels: C => k.units(C).filter((F => !(F.isUnderConstruction?.() ?? false))).reduce(((F, H) => F + (H.level?.() ?? 1)), 0),
            incomingAttacks: () => k.incomingAttacks().map(d),
            outgoingAttacks: () => k.outgoingAttacks().map(d),
            targets: () => k.targets ? k.targets().map(h) : [],
            allies: () => k.allies ? k.allies().map(h) : [],
            transitiveTargets: () => k.transitiveTargets ? k.transitiveTargets().map(h) : [],
            alliances: () => k.alliances ? k.alliances() : [],
            isFriendly: C => k.isFriendly(l(C)),
            isAlliedWith: C => k.isAlliedWith(l(C)),
            isOnSameTeam: C => k.isOnSameTeam(l(C)),
            isRequestingAllianceWith: C => k.isRequestingAllianceWith ? k.isRequestingAllianceWith(l(C)) : false,
            hasEmbargoAgainst: C => k.hasEmbargoAgainst ? k.hasEmbargoAgainst(l(C)) : false,
            nameLocation: () => k.nameLocation ? k.nameLocation() : {
              x: 0,
              y: 0
            },
            borderTiles: () => {
              const C = n.get(k.smallID());
              return C && C.set ? C.set : new Set;
            },
            relation: C => {
              const F = g(C);
              return relationFromValue(within(p(F), -100, 100));
            },
            allRelationsSorted: () => {
              const C = new Set;
              for (const H of r.keys()) C.add(H);
              for (const H of o.keys()) C.add(H);
              const F = [];
              for (const H of C) {
                if (H === k.smallID()) continue;
                const X = j.playerBySmallID(H);
                if (!X || !X.isPlayer || !X.isPlayer() || !X.isAlive()) continue;
                F.push({
                  player: X,
                  raw: p(H),
                  sid: H
                });
              }
              F.sort(((H, X) => H.raw - X.raw || H.sid - X.sid));
              return F.map((H => ({
                player: H.player,
                relation: relationFromValue(within(H.raw, -100, 100))
              })));
            },
            updateRelation: (C, F) => {
              const H = g(C);
              if (H == null || H === k.smallID()) return;
              o.set(H, within((o.get(H) ?? 0) + F, -100, 100));
            },
            nearby: () => y(B),
            sharesBorderWith: C => b(B, C),
            borderTilesAsync: () => k.borderTiles(),
            buildables: (C, F) => k.buildables(C, F),
            bestTransportShipSpawn: C => k.bestTransportShipSpawn(C),
            profile: () => k.profile(),
            actions: (C, F) => k.actions ? k.actions(C, F) : Promise.resolve(null)
          };
          return B;
        }
        function g(k) {
          if (k == null) return null;
          if (typeof k === "number") return k;
          if (typeof k.smallID === "function") return k.smallID();
          return null;
        }
        function y(k) {
          const I = new Map;
          const B = k.smallID();
          const C = Y => {
            if (Y === B) return;
            if (Y == null) {
              const ee = j.terraNullius();
              I.set("TN", ee);
            } else {
              const ee = j.playerBySmallID(Y);
              if (ee) I.set(Y, ee);
            }
          };
          const F = k.borderTiles();
          for (const Y of F) {
            for (const ee of e.neighbors(Y)) {
              if (!e.isLand(ee)) continue;
              const oe = e.hasOwner(ee) ? e.ownerID(ee) : null;
              if (oe !== B) C(oe);
            }
          }
          const H = [];
          for (const Y of F) if (e.isShore(Y)) H.push(Y);
          const X = [ [ 0, -1 ], [ 0, 1 ], [ -1, 0 ], [ 1, 0 ] ];
          for (let Y = 0; Y < H.length; Y += 10) {
            const ee = H[Y];
            const oe = e.x(ee);
            const be = e.y(ee);
            for (const [le, de] of X) {
              const ke = oe + le;
              const pe = be + de;
              if (!e.isValidCoord(ke, pe) || !e.isWater(e.ref(ke, pe))) continue;
              const Le = oe + le * 5;
              const Oe = be + de * 5;
              if (!e.isValidCoord(Le, Oe)) continue;
              const ve = e.ref(Le, Oe);
              if (!e.isLand(ve)) continue;
              if (!e.hasOwner(ve) && e.hasFallout(ve)) continue;
              const Fe = e.hasOwner(ve) ? e.ownerID(ve) : null;
              if (Fe !== B) C(Fe);
            }
          }
          return Array.from(I.values());
        }
        function b(k, I) {
          const B = g(I);
          if (B == null) {
            for (const C of k.borderTiles()) {
              for (const F of e.neighbors(C)) {
                if (e.isLand(F) && !e.hasOwner(F)) return true;
              }
            }
            return false;
          }
          for (const C of k.borderTiles()) {
            for (const F of e.neighbors(C)) {
              if (e.isLand(F) && e.hasOwner(F) && e.ownerID(F) === B) return true;
            }
          }
          return false;
        }
        let w = null;
        let v = null;
        function x() {
          const k = e.config();
          if (v && w === k) return v;
          w = k;
          v = new Proxy(k, {
            get(I, B) {
              if (B === "maxTroops") return F => k.maxTroops(l(F));
              const C = I[B];
              return typeof C === "function" ? C.bind(I) : C;
            }
          });
          return v;
        }
        let T = null;
        let N = null;
        let M = null;
        function A() {
          const k = e.width();
          const I = e.height();
          const B = k * I;
          const C = new Int32Array(B).fill(-2);
          const F = [];
          const H = [];
          let X = 0;
          for (let Y = 0; Y < B; Y++) {
            if (!e.isWater(Y) || C[Y] !== -2) continue;
            const ee = X++;
            let oe = false;
            const be = new Set;
            const le = [ Y ];
            C[Y] = ee;
            let de = 0;
            while (de < le.length) {
              const ke = le[de++];
              if (e.isOcean(ke)) oe = true;
              for (const pe of e.neighbors(ke)) {
                if (e.isWater(pe)) {
                  if (C[pe] === -2) {
                    C[pe] = ee;
                    le.push(pe);
                  }
                } else if (e.isLand(pe)) {
                  be.add(pe);
                }
              }
            }
            F[ee] = oe;
            H[ee] = oe ? null : Array.from(be);
          }
          T = C;
          N = F;
          M = H;
        }
        function E() {
          if (T === null) A();
        }
        function D(k) {
          E();
          if (k < 0 || k >= T.length) return null;
          const I = T[k];
          return I >= 0 ? I : null;
        }
        const O = -1;
        function $(k) {
          if (k == null) return null;
          try {
            if (k.type && k.type() === PlayerType.Bot) return null;
          } catch (X) {}
          E();
          const I = k.borderTiles();
          const B = k.smallID();
          let C = false;
          const F = new Set;
          for (const X of I) {
            if (!e.isShore(X)) continue;
            for (const Y of e.neighbors(X)) {
              if (!e.isWater(Y)) continue;
              if (e.isOcean(Y)) {
                C = true;
                continue;
              }
              const ee = T[Y];
              if (ee >= 0) F.add(ee);
            }
          }
          const H = new Set;
          if (C) H.add(O);
          for (const X of F) {
            const Y = M[X];
            if (!Y) continue;
            let ee = false;
            const oe = new Set;
            for (const be of Y) {
              if (!e.hasOwner(be)) continue;
              const le = e.ownerID(be);
              if (le == null || le === B) continue;
              if (oe.has(le)) continue;
              oe.add(le);
              const de = h(e.playerBySmallID(le));
              if (!de || !de.isPlayer || !de.isPlayer()) continue;
              if (de.type && de.type() === PlayerType.Bot) continue;
              if (k.id() !== de.id() && !k.hasEmbargoAgainst(de) && !de.hasEmbargoAgainst(k)) {
                ee = true;
                break;
              }
            }
            if (ee) H.add(X);
          }
          return H.size > 0 ? H : null;
        }
        function K() {
          try {
            if (typeof e.frameData !== "function") return null;
            const k = e.frameData();
            return k && k.railroadState ? k.railroadState : null;
          } catch (k) {
            return null;
          }
        }
        const q = k => (...I) => e[k](...I);
        const j = {
          __src: e,
          ticks: () => e.ticks(),
          inSpawnPhase: () => e.inSpawnPhase(),
          isSpawnImmunityActive: (...k) => typeof e.isSpawnImmunityActive === "function" ? e.isSpawnImmunityActive(...k) : false,
          config: () => x(),
          myPlayer: () => i,
          players: () => e.players().map(h),
          playerViews: () => e.players().map(h),
          playerBySmallID: k => h(e.playerBySmallID(k)),
          nations: () => (e.nations ? e.nations() : e.players().filter((k => k.type?.() === "Nation"))).map(h),
          terraNullius: () => {
            if (typeof e.terraNullius === "function") return e.terraNullius();
            return {
              isPlayer: () => false,
              smallID: () => 0,
              id: () => "TerraNullius"
            };
          },
          owner: k => h(e.owner(k)),
          ownerID: k => e.ownerID(k),
          hasOwner: k => e.hasOwner(k),
          numLandTiles: () => e.numLandTiles(),
          numTilesWithFallout: () => typeof e.numTilesWithFallout === "function" ? e.numTilesWithFallout() : 0,
          getWinner: () => typeof e.getWinner === "function" ? e.getWinner() : null,
          units: (...k) => e.units(...k).map(u),
          unitCount: k => e.units(k).length,
          ref: q("ref"),
          x: q("x"),
          y: q("y"),
          cell: q("cell"),
          width: q("width"),
          height: q("height"),
          isValidCoord: q("isValidCoord"),
          isOnMap: k => typeof e.isOnMap === "function" ? e.isOnMap(k) : e.isValidCoord(k.x, k.y),
          isLand: q("isLand"),
          isWater: q("isWater"),
          isOcean: q("isOcean"),
          isShore: q("isShore"),
          isOceanShore: q("isOceanShore"),
          isBorder: k => typeof e.isBorder === "function" ? e.isBorder(k) : false,
          magnitude: q("magnitude"),
          hasFallout: q("hasFallout"),
          neighbors: q("neighbors"),
          manhattanDist: q("manhattanDist"),
          euclideanDistSquared: q("euclideanDistSquared"),
          terrainType: k => typeof e.terrainType === "function" ? e.terrainType(k) : null,
          nearbyUnits: (...k) => typeof e.nearbyUnits === "function" ? e.nearbyUnits(...k) : [],
          hasUnitNearby: (...k) => typeof e.hasUnitNearby === "function" ? e.hasUnitNearby(...k) : false,
          ensureBorderTiles: k => V(k),
          getWaterComponent: k => D(k),
          sharedWaterComponents: k => $(k),
          railroadState: () => K(),
          _wrapPlayer: h,
          _wrapUnit: u
        };
        async function V(k) {
          const I = l(k);
          const B = I.smallID();
          const C = e.ticks();
          const F = n.get(B);
          const H = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
          const X = 1500;
          if (F && F.set && F.set.size > 0 && H - (F.at || 0) < X) {
            return F.set;
          }
          if (F && F.inFlight) {
            return F.set || new Set;
          }
          const Y = F || {
            at: 0,
            set: new Set,
            inFlight: false
          };
          Y.inFlight = true;
          n.set(B, Y);
          let ee = null;
          try {
            const oe = await withTimeout(I.borderTiles(), 4e3, null);
            const be = oe && oe.borderTiles ? oe.borderTiles : oe;
            if (be) {
              const le = new Set(be);
              if (le.size > 0) ee = le;
            }
          } catch (oe) {}
          Y.inFlight = false;
          if (ee !== null) {
            Y.set = ee;
            Y.at = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
          }
          n.set(B, Y);
          return Y.set || new Set;
        }
        async function G(k) {
          i = h(k);
          const I = e.ticks();
          if (s >= 0 && I > s) {
            const B = Math.min(I - s, 50);
            for (const [C, F] of o) {
              let H = F;
              for (let X = 0; X < B; X++) {
                const Y = -1 * Math.sign(H);
                H += Y * .05;
                if (Math.abs(H) < .1) {
                  H = 0;
                  break;
                }
              }
              if (H === 0) o.delete(C); else o.set(C, H);
            }
          }
          s = I;
          await V(i);
          try {
            const B = await withTimeout(l(i).profile(), WORKER_TIMEOUT_MS, null);
            if (B && B.relations) {
              r = new Map(Object.entries(B.relations).map((([C, F]) => [ Number(C), Number(F) ])));
              a = (B.alliances || []).map(Number);
            }
          } catch (B) {}
          return i;
        }
        return {
          game: j,
          beginTick: G,
          ensureBorderTiles: V,
          wrapPlayer: h,
          overlay: o
        };
      }
      "use strict";
      const emojiTable = [ [ "😀", "😊", "🥰", "😇", "😎" ], [ "😞", "🥺", "😭", "😱", "😡" ], [ "😈", "🤡", "🥱", "🫡", "🖕" ], [ "👋", "👏", "✋", "🙏", "💪" ], [ "👍", "👎", "🫴", "🤌", "🤦‍♂️" ], [ "🤝", "🆘", "🕊️", "🏳️", "⏳" ], [ "🔥", "💥", "💀", "☢️", "⚠️" ], [ "↖️", "⬆️", "↗️", "👑", "🥇" ], [ "⬅️", "🎯", "➡️", "🥈", "🥉" ], [ "↙️", "⬇️", "↘️", "❤️", "💔" ], [ "💰", "⚓", "⛵", "🏡", "🛡️" ], [ "🏭", "🚂", "❓", "🐔", "🐀" ] ];
      const flattenedEmojiTable = emojiTable.flat();
      const emojiId = e => flattenedEmojiTable.indexOf(e);
      const EMOJI_ASSIST_ACCEPT = [ "👍", "🤝", "🎯" ].map(emojiId);
      const EMOJI_ASSIST_RELATION_TOO_LOW = [ "🥱", "🤦‍♂️" ].map(emojiId);
      const EMOJI_ASSIST_TARGET_ME = [ "🥺", "💀" ].map(emojiId);
      const EMOJI_ASSIST_TARGET_ALLY = [ "🕊️", "👎" ].map(emojiId);
      const EMOJI_AGGRESSIVE_ATTACK = [ "😈" ].map(emojiId);
      const EMOJI_ATTACK = [ "😡" ].map(emojiId);
      const EMOJI_WARSHIP_RETALIATION = [ "⛵" ].map(emojiId);
      const EMOJI_NUKE = [ "☢️", "💥" ].map(emojiId);
      const EMOJI_GOT_INSULTED = [ "🖕", "😡", "🤡", "😞", "😭" ].map(emojiId);
      const EMOJI_LOVE = [ "❤️", "😊", "🥰" ].map(emojiId);
      const EMOJI_CONFUSED = [ "❓", "🤡" ].map(emojiId);
      const EMOJI_BRAG = [ "👑", "🥇", "💪" ].map(emojiId);
      const EMOJI_CHARM_ALLIES = [ "🤝", "😇", "💪" ].map(emojiId);
      const EMOJI_CLOWN = [ "🤡", "🤦‍♂️" ].map(emojiId);
      const EMOJI_RAT = [ "🐀" ].map(emojiId);
      const EMOJI_OVERWHELMED = [ "💀", "🆘", "😱", "🥺", "😭", "😞", "🫡", "👋" ].map(emojiId);
      const EMOJI_CONGRATULATE = [ "👏" ].map(emojiId);
      const EMOJI_SCARED_OF_THREAT = [ "🙏", "🥺" ].map(emojiId);
      const EMOJI_BORED = [ "🥱" ].map(emojiId);
      const EMOJI_HANDSHAKE = [ "🤝" ].map(emojiId);
      const EMOJI_DONATION_OK = [ "👍" ].map(emojiId);
      const EMOJI_DONATION_TOO_SMALL = [ "❓", "🥱" ].map(emojiId);
      const EMOJI_GREET = [ "👋" ].map(emojiId);
      const AllPlayers = "AllPlayers";
      class EmojiBehavior {
        constructor(t, n, o) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.lastEmojiSent = new Map;
          this.gameOver = false;
        }
        maybeSendCasualEmoji() {
          if (this.gameOver) return;
          this.checkOverwhelmedByAttacks();
          this.checkVerySmallAttack();
          this.congratulateWinner();
          this.brag();
          this.charmAllies();
          this.annoyTraitors();
          this.findRat();
          this.greetNearbyPlayers();
        }
        checkOverwhelmedByAttacks() {
          if (!this.random.chance(16)) return;
          const t = this.player.incomingAttacks();
          if (t.length === 0) return;
          const n = t.reduce(((r, a) => r + a.troops()), 0);
          const o = this.player.troops();
          if (n >= o * 3) {
            this.sendEmoji(AllPlayers, EMOJI_OVERWHELMED);
          }
        }
        checkVerySmallAttack() {
          if (!this.random.chance(8)) return;
          const t = this.player.incomingAttacks();
          if (t.length === 0) return;
          const n = this.player.troops();
          if (n <= 0) return;
          for (const o of t) {
            const r = o.attacker();
            if (r.type() !== PlayerType.Human) continue;
            if (o.troops() < n * .1) {
              this.maybeSendEmoji(r, this.random.chance(2) ? EMOJI_CONFUSED : EMOJI_BORED);
            }
          }
        }
        congratulateWinner() {
          const t = this.game.getWinner();
          if (t === null) return;
          this.gameOver = true;
          const n = this.game.config().gameConfig().gameMode === GameMode.Team;
          if (n) {
            if (t === this.player.team()) return;
            this.sendEmoji(AllPlayers, EMOJI_CONGRATULATE);
          } else {
            if (typeof t === "string") return;
            const o = this.game.players().filter((r => r.type() === PlayerType.Nation)).sort(((r, a) => a.numTilesOwned() - r.numTilesOwned()))[0];
            if (!o || o.smallID() !== this.player.smallID()) return;
            this.sendEmoji(t, EMOJI_CONGRATULATE);
          }
        }
        brag() {
          if (!this.random.chance(300)) return;
          const t = this.game.players().sort(((n, o) => o.numTilesOwned() - n.numTilesOwned()));
          if (t.length === 0 || t[0].smallID() !== this.player.smallID()) return;
          this.sendEmoji(AllPlayers, EMOJI_BRAG);
        }
        charmAllies() {
          if (!this.random.chance(250)) return;
          const t = this.player.allies().filter((r => r.type() === PlayerType.Human));
          if (t.length === 0) return;
          const n = this.random.randElement(t);
          const o = this.random.chance(3) ? EMOJI_LOVE : EMOJI_CHARM_ALLIES;
          this.sendEmoji(n, o);
        }
        annoyTraitors() {
          if (!this.random.chance(40)) return;
          const t = this.game.players().filter((o => o.type() === PlayerType.Human && !o.isFriendly(this.player) && o.isTraitor()));
          if (t.length === 0) return;
          const n = this.random.randElement(t);
          this.sendEmoji(n, EMOJI_CLOWN);
        }
        findRat() {
          if (this.game.ticks() < 6e3) return;
          if (!this.random.chance(1e4)) return;
          const t = this.game.numLandTiles();
          const n = t * .01;
          const o = this.game.players().filter((a => a.type() === PlayerType.Human && a.numTilesOwned() < n && a.numTilesOwned() > 0));
          if (o.length === 0) return;
          const r = this.random.randElement(o);
          this.sendEmoji(r, EMOJI_RAT);
        }
        greetNearbyPlayers() {
          if (this.game.ticks() > 600) return;
          if (!this.random.chance(250)) return;
          const t = this.player.nearby().filter((o => o.isPlayer() && o.type() === PlayerType.Human));
          if (t.length === 0) return;
          const n = this.random.randElement(t);
          this.sendEmoji(n, EMOJI_GREET);
        }
        maybeSendEmoji(t, n) {
          if (!this.shouldSendEmoji(t)) return;
          return this.sendEmoji(t, n);
        }
        maybeSendAttackEmoji(t) {
          if (!this.shouldSendEmoji(t)) return;
          if (this.player.relation(t) >= Relation.Neutral) {
            if (!this.random.chance(2)) return;
            this.sendEmoji(t, EMOJI_AGGRESSIVE_ATTACK);
            return;
          }
          if (!this.random.chance(4)) return;
          this.sendEmoji(t, EMOJI_ATTACK);
        }
        sendEmoji(t, n) {
          if (!this.shouldSendEmoji(t, false)) return;
          if (!this.canSendEmoji(t)) return;
          const o = discoverCtors(getEventBus());
          if (!o.emoji) return;
          const r = t === AllPlayers ? AllPlayers : t.__src ?? t;
          const a = this.random.randElement(n);
          emitIntent(o.emoji, r, a);
          setLastAction(tr("💬 Emoji"), "diplo");
        }
        canSendEmoji(t) {
          const n = this.player.__src;
          if (n && typeof n.canSendEmoji === "function") {
            const o = t === AllPlayers ? AllPlayers : t.__src ?? t;
            try {
              return n.canSendEmoji(o);
            } catch (r) {
              return true;
            }
          }
          return true;
        }
        shouldSendEmoji(t, n = true) {
          if (t === AllPlayers) return true;
          if (this.player.type() === PlayerType.Bot) return false;
          if (t.type() !== PlayerType.Human) return false;
          if (n) {
            const o = t.smallID();
            const r = this.lastEmojiSent.get(o) ?? -300;
            if (this.game.ticks() - r <= 300) return false;
            this.lastEmojiSent.set(o, this.game.ticks());
          }
          return true;
        }
      }
      function respondToEmoji(e, t, n, o, r) {
        if (o === AllPlayers || o.type() !== PlayerType.Nation) {
          return;
        }
        if (!recipientCanSendEmoji(o, n)) return;
        if (r === "🖕") {
          o.updateRelation(n, -100);
          t.randElement(EMOJI_GOT_INSULTED);
        }
        if (r === "🤡") {
          o.updateRelation(n, -10);
          t.randElement(EMOJI_CONFUSED);
        }
        if ([ "🕊️", "🏳️", "❤️", "🥰", "👏" ].includes(r)) {
          if (currentDifficulty() === Difficulty.Easy) {
            o.updateRelation(n, 15);
          }
          n.relation(o) >= Relation.Neutral ? t.randElement(EMOJI_LOVE) : t.randElement(EMOJI_CONFUSED);
        }
      }
      function respondToMIRV(e, t, n) {
        if (!t.chance(8)) return;
        if (!recipientCanSendEmoji(n, AllPlayers)) return;
        t.randElement(EMOJI_OVERWHELMED);
      }
      function recipientCanSendEmoji(e, t) {
        const n = e && e.__src;
        if (n && typeof n.canSendEmoji === "function") {
          const o = t === AllPlayers ? AllPlayers : t && t.__src || t;
          try {
            return n.canSendEmoji(o);
          } catch (r) {
            return true;
          }
        }
        return true;
      }
      "use strict";
      const ALLIANCE_REQUEST_TYPES = new Set([ 15, 16 ]);
      const RENEW_TYPES = new Set([ 22, 24 ]);
      const _allianceBehaviorActioned = new WeakSet;
      function runAndCaptureAllianceCtor(e) {
        const t = getEventBus();
        if (!t || typeof t.emit !== "function" || _ctors.allianceRequest) {
          e();
          return;
        }
        const n = t.emit;
        t.emit = function(o) {
          try {
            if (o && o.requestor !== void 0 && o.recipient !== void 0 && typeof o.constructor === "function") {
              _ctors.allianceRequest = o.constructor;
            }
          } catch (r) {}
          return n.call(this, o);
        };
        try {
          e();
        } finally {
          t.emit = n;
        }
      }
      function getAllianceShapeCtors(e) {
        if (_ctors.allianceShapeBus === e && _ctors.allianceShape) {
          return _ctors.allianceShape;
        }
        const t = [];
        const n = getListenersMap(e);
        if (n) {
          const o = {
            __probe: 1
          };
          const r = {
            __probe: 2
          };
          for (const a of n.keys()) {
            if (typeof a !== "function") continue;
            try {
              const i = new a(o, r);
              if (i && i.requestor === o && i.recipient === r) {
                t.push(a);
              }
            } catch (i) {}
          }
        }
        _ctors.allianceShape = t;
        _ctors.allianceShapeBus = e;
        return t;
      }
      function collectAllianceEvents() {
        const e = [];
        for (const t of [ "events-display", "actionable-events" ]) {
          try {
            const n = document.querySelector(t);
            if (Array.isArray(n?.events)) e.push(...n.events);
          } catch (n) {}
        }
        try {
          if (typeof allianceRequestsPanelEvents !== "undefined" && Array.isArray(allianceRequestsPanelEvents)) {
            e.push(...allianceRequestsPanelEvents);
          }
        } catch (t) {}
        return e;
      }
      function pickAllianceButton(e, t, n) {
        return e.find((o => o?.className === t && typeof o.action === "function")) || (typeof e[n]?.action === "function" ? e[n] : null);
      }
      class AllianceBehavior {
        constructor(t, n, o, r) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.emojiBehavior = r;
        }
        isRegularBot(t) {
          if (!t) return false;
          try {
            if (typeof t.type === "function" && t.type() === "BOT") return true;
            if (t.data && t.data.playerType === "BOT") return true;
          } catch (n) {}
          return false;
        }
        handleAllianceRequests() {
          if (this.game.config().disableAlliances()) return;
          for (const t of this.incomingAllianceRequests()) {
            const n = t.requestor();
            if (n && this.isRegularBot(n)) {
              t.reject();
              continue;
            }
            if (typeof companionAllianceVeto === "function" && companionAllianceVeto(n)) {
              t.reject();
              continue;
            }
            if (t.createdAt() <= this.game.config().numSpawnPhaseTurns() + 1) {
              t.reject();
              continue;
            }
            if (this.getAllianceDecision(n, true)) {
              t.accept();
            } else {
              t.reject();
            }
          }
        }
        handleAllianceRequestsFromBots() {
          for (const t of collectAllianceEvents()) {
            try {
              const n = this.resolveEventPlayer(t);
              if (!n) continue;
              if (this.isRegularBot(n)) {
                _allianceBehaviorActioned.add(t);
              }
            } catch (n) {}
          }
        }
        handleAllianceExtensionRequests() {
          if (this.game.config().disableAlliances()) return;
          for (const t of collectAllianceEvents()) {
            const n = Number(t?.type);
            if (!RENEW_TYPES.has(n)) continue;
            if (_allianceBehaviorActioned.has(t)) continue;
            const o = Array.isArray(t.buttons) ? t.buttons : [];
            if (o.length === 0) continue;
            const r = this.resolveEventPlayer(t);
            if (!r || !r.isPlayer || !r.isPlayer()) continue;
            if (typeof companionAllianceVeto === "function" && companionAllianceVeto(r)) {
              continue;
            }
            if (!this.getAllianceDecision(r, true)) continue;
            const a = pickAllianceButton(o, "btn", 1);
            if (a) {
              try {
                a.action();
                _allianceBehaviorActioned.add(t);
                setLastAction(tr("🔁 Renew alliance {name}", {
                  name: safeName(r)
                }), "diplo");
              } catch (i) {}
            }
          }
        }
        maybeSendAllianceRequests(t) {
          if (this.game.config().disableAlliances()) return;
          for (const n of t) {
            if (this.random.chance(30) && !(typeof companionAllianceVeto === "function" && companionAllianceVeto(n)) && !this.isRegularBot(n) && this.canSendAllianceRequest(n) && this.getAllianceDecision(n, false)) {
              const o = discoverCtors(getEventBus());
              if (o.allianceRequest) {
                emitIntent(o.allianceRequest, this.player.__src ?? this.player, n.__src ?? n);
                setLastAction(tr("🤝➡️ Send alliance {name}", {
                  name: safeName(n)
                }), "diplo");
              }
            }
          }
        }
        isFarNation(t) {
          try {
            const n = t.smallID();
            for (const o of this.player.nearby()) {
              if (o && o.isPlayer && o.isPlayer() && o.smallID() === n) {
                return false;
              }
            }
            return true;
          } catch (n) {
            return false;
          }
        }
        isDominantForDiplomacy() {
          if (!state.settings.winFixes) return false;
          if (typeof state.dominant === "boolean") return state.dominant;
          try {
            const t = String(this.game.config().gameConfig().gameMode) === "Team";
            const n = typeof this.game.numTilesWithFallout === "function" ? this.game.numTilesWithFallout() : 0;
            const o = (this.game.numLandTiles() || 0) - n;
            if (o <= 0) return false;
            let r = 0;
            if (t) {
              for (const i of this.game.players()) {
                try {
                  if (i.isPlayer() && this.player.isOnSameTeam(i)) {
                    r += i.numTilesOwned();
                  }
                } catch (s) {}
              }
            } else {
              r = this.player.numTilesOwned();
            }
            const a = Number.isFinite(state.settings.factoryRailShare) ? state.settings.factoryRailShare : .75;
            return r / o > a;
          } catch (t) {
            return false;
          }
        }
        reachOutToFarNations() {
          const t = performance.now();
          const n = state.settings.farAllyThrottleMs || 4e3;
          if (t - (state.lastFarAllyMs || 0) < n) return;
          if (this.isDominantForDiplomacy()) return;
          const o = discoverCtors(getEventBus());
          if (!o.allianceRequest) return;
          const r = this.player.smallID();
          const a = [];
          for (const s of this.game.players()) {
            try {
              if (!s.isPlayer || !s.isPlayer()) continue;
              if (s.smallID() === r) continue;
              if (!s.isAlive || !s.isAlive()) continue;
              if (s.type() === PlayerType.Bot) continue;
              if (this.player.isFriendly(s) === true) continue;
              if (s.isTraitor && s.isTraitor()) continue;
              if (!this.isFarNation(s)) continue;
              if (!this.canSendAllianceRequest(s)) continue;
              a.push(s);
            } catch (l) {}
          }
          if (a.length === 0) return;
          const i = this.random.randElement(a);
          if (typeof companionAllianceVeto === "function" && companionAllianceVeto(i)) return;
          emitIntent(o.allianceRequest, this.player.__src ?? this.player, i.__src ?? i);
          setLastAction(tr("🤝➡️ Trade-ally {name}", {
            name: safeName(i)
          }), "diplo");
          state.lastFarAllyMs = t;
          console.log("[Diplo] reach out far →", safeName(i));
        }
        getAllianceDecision(t, n) {
          if (this.isRegularBot(t)) return false;
          if (this.isConfused()) {
            return this.random.chance(2);
          }
          if (t.isTraitor() && this.random.nextInt(0, 100) >= 10) {
            if (n && this.random.chance(3)) {
              this.emojiBehavior.sendEmoji(t, EMOJI_CONFUSED);
            }
            return false;
          }
          if (state.settings.winFixes && this.isFarNation(t)) {
            if (this.isDominantForDiplomacy()) {
              return false;
            }
            if (n) {
              console.log("[Diplo] far accept →", safeName(t));
            }
            return true;
          }
          if (this.hasTooManyAlliances(t)) {
            return false;
          }
          if (this.isAlliancePartnerThreat(t)) {
            if (!n && this.random.chance(6)) {
              this.emojiBehavior.sendEmoji(t, EMOJI_SCARED_OF_THREAT);
            }
            if (n && this.random.chance(6)) {
              this.emojiBehavior.sendEmoji(t, EMOJI_LOVE);
            }
            return true;
          }
          if (this.shouldRejectInTeamGame()) {
            return false;
          }
          if (this.player.relation(t) < Relation.Neutral) {
            if (n && this.random.chance(3)) {
              this.emojiBehavior.sendEmoji(t, EMOJI_CONFUSED);
            }
            return false;
          }
          if (this.isAlliancePartnerFriendly(t)) {
            if (this.random.chance(3)) {
              this.emojiBehavior.sendEmoji(t, EMOJI_HANDSHAKE);
            }
            return true;
          }
          if (this.checkAlreadyEnoughAlliances(t)) {
            return false;
          }
          if (this.isEarlygame()) {
            return true;
          }
          return this.isAlliancePartnerSimilarlyStrong(t);
        }
        hasTooManyAlliances(t) {
          const n = currentDifficulty();
          if (n !== Difficulty.Hard && n !== Difficulty.Impossible) {
            return false;
          }
          const o = this.game.players().filter((a => a.type() !== PlayerType.Bot)).length;
          const r = t.alliances().length;
          if (n === Difficulty.Hard) {
            return r >= o * .5;
          } else {
            return r >= o * .25;
          }
        }
        isConfused() {
          const t = currentDifficulty();
          switch (t) {
           case Difficulty.Easy:
            return this.random.chance(10);

           case Difficulty.Medium:
            return this.random.chance(20);

           case Difficulty.Hard:
            return this.random.chance(40);

           case Difficulty.Impossible:
            return false;

           default:
            return assertNever(t);
          }
        }
        isEarlygame() {
          const t = this.game.config().numSpawnPhaseTurns();
          const n = currentDifficulty();
          switch (n) {
           case Difficulty.Easy:
            return this.game.ticks() < 3e3 + t && this.random.nextInt(0, 100) >= 10;

           case Difficulty.Medium:
            return this.game.ticks() < 1800 + t && this.random.nextInt(0, 100) >= 30;

           case Difficulty.Hard:
            return this.game.ticks() < 1800 + t && this.random.nextInt(0, 100) >= 50;

           case Difficulty.Impossible:
            return this.game.ticks() < 600 + t && this.random.nextInt(0, 100) >= 70;

           default:
            return assertNever(n);
          }
        }
        isAlliancePartnerThreat(t) {
          const n = currentDifficulty();
          switch (n) {
           case Difficulty.Easy:
            return false;

           case Difficulty.Medium:
            return t.troops() > this.player.troops() * 2.5;

           case Difficulty.Hard:
            return t.troops() > this.player.troops() && this.game.config().maxTroops(t) > this.game.config().maxTroops(this.player) * 2;

           case Difficulty.Impossible:
            {
              const o = t.troops() > this.player.troops() * 1.5;
              const r = t.troops() > this.player.troops() && this.game.config().maxTroops(t) > this.game.config().maxTroops(this.player) * 1.5;
              const a = t.troops() > this.player.troops() && t.numTilesOwned() > this.player.numTilesOwned() * 1.5;
              return o || r || a;
            }

           default:
            return assertNever(n);
          }
        }
        shouldRejectInTeamGame() {
          if (this.game.config().gameConfig().gameMode !== GameMode.Team) {
            return false;
          }
          const t = currentDifficulty();
          switch (t) {
           case Difficulty.Easy:
            return this.random.nextInt(0, 100) < 25;

           case Difficulty.Medium:
            return this.random.nextInt(0, 100) < 50;

           case Difficulty.Hard:
            return this.random.nextInt(0, 100) < 75;

           case Difficulty.Impossible:
            return true;

           default:
            return assertNever(t);
          }
        }
        checkAlreadyEnoughAlliances(t) {
          const n = currentDifficulty();
          switch (n) {
           case Difficulty.Easy:
            return false;

           case Difficulty.Medium:
            return this.player.alliances().length >= this.random.nextInt(4, 6);

           case Difficulty.Hard:
           case Difficulty.Impossible:
            {
              const o = this.player.nearby().filter((a => a.isPlayer() && a.type() !== PlayerType.Bot));
              const r = o.filter((a => this.player?.isFriendly(a) === true));
              if (o.length >= 2 && o.some((a => a.smallID() === t.smallID()))) {
                return o.length <= r.length + 1;
              }
              if (n === Difficulty.Hard) {
                return this.player.alliances().length >= this.random.nextInt(3, 5);
              }
              return this.player.alliances().length >= this.random.nextInt(2, 4);
            }

           default:
            return assertNever(n);
          }
        }
        isAlliancePartnerFriendly(t) {
          const n = currentDifficulty();
          switch (n) {
           case Difficulty.Easy:
           case Difficulty.Medium:
            return this.player.relation(t) === Relation.Friendly;

           case Difficulty.Hard:
            return this.player.relation(t) === Relation.Friendly && this.random.nextInt(0, 100) >= 17;

           case Difficulty.Impossible:
            return this.player.relation(t) === Relation.Friendly && this.random.nextInt(0, 100) >= 33;

           default:
            return assertNever(n);
          }
        }
        isAlliancePartnerSimilarlyStrong(t) {
          const n = currentDifficulty();
          const o = {
            [Difficulty.Easy]: [ 60, 70 ],
            [Difficulty.Medium]: [ 70, 80 ],
            [Difficulty.Hard]: [ 75, 85 ],
            [Difficulty.Impossible]: [ 80, 90 ]
          };
          const r = {
            [Difficulty.Easy]: [ 70, 80 ],
            [Difficulty.Medium]: [ 80, 90 ],
            [Difficulty.Hard]: [ 85, 95 ],
            [Difficulty.Impossible]: [ 90, 100 ]
          };
          const a = o[n];
          const i = r[n];
          const s = this.player.outgoingAttacks().reduce(((m, g) => m + g.troops()), 0);
          const l = t.outgoingAttacks().reduce(((m, g) => m + g.troops()), 0);
          const c = this.player.troops() + s;
          const u = t.troops() + l;
          const d = c * (this.random.nextInt(a[0], a[1]) / 100);
          const f = this.player.numTilesOwned() * (this.random.nextInt(i[0], i[1]) / 100);
          const p = u > d;
          const h = t.numTilesOwned() > f && u > c * .5;
          return p || h;
        }
        maybeBetray(t, n) {
          if (state.settings.features && state.settings.features.betray === false) {
            return false;
          }
          if (!this.player.isAlliedWith(t)) return false;
          const o = currentDifficulty();
          if (o !== Difficulty.Easy && o !== Difficulty.Medium) {
            const r = this.game.config().maxTroops(t);
            const a = t.outgoingAttacks().reduce(((i, s) => i + s.troops()), 0);
            if (t.troops() + a < r * .2 && t.troops() < this.player.troops()) {
              this.betray(t);
              return true;
            }
          }
          if ((o === Difficulty.Easy || o === Difficulty.Medium) && !(o === Difficulty.Easy && t.type() === PlayerType.Human) && this.player.troops() >= t.troops() * 10) {
            this.betray(t);
            return true;
          }
          if (o !== Difficulty.Easy && t.isTraitor() && t.troops() < this.player.troops() * 1.2) {
            this.betray(t);
            return true;
          }
          if (o !== Difficulty.Easy && n === 1 && t.troops() * 3 < this.player.troops()) {
            this.betray(t);
            return true;
          }
          return false;
        }
        betray(t) {
          if (!this.player.isAlliedWith(t)) return;
          const n = getEventBus();
          if (!n) return;
          if (!_ctors.allianceRequest) return;
          const o = getAllianceShapeCtors(n);
          const r = o.find((a => a !== _ctors.allianceRequest));
          if (!r) return;
          emitIntent(r, this.player.__src ?? this.player, t.__src ?? t);
          setLastAction(tr("🗡️ Betray {name}", {
            name: safeName(t)
          }), "diplo");
        }
        incomingAllianceRequests() {
          const t = [];
          const n = (() => {
            try {
              return this.game.inSpawnPhase() === true;
            } catch (o) {
              return false;
            }
          })();
          for (const o of collectAllianceEvents()) {
            const r = Number(o?.type);
            if (!ALLIANCE_REQUEST_TYPES.has(r)) continue;
            if (_allianceBehaviorActioned.has(o)) continue;
            const a = Array.isArray(o.buttons) ? o.buttons : [];
            if (a.length === 0) continue;
            const i = this.resolveEventPlayer(o);
            if (!i || !i.isPlayer || !i.isPlayer()) continue;
            let s = false;
            let l;
            const c = Number(o?.createdAt);
            if (Number.isFinite(c)) {
              l = c;
            } else if (n) {
              l = 0;
              s = true;
            } else {
              l = (() => {
                try {
                  return this.game.ticks();
                } catch (u) {
                  return this.game.config().numSpawnPhaseTurns() + 2;
                }
              })();
            }
            t.push({
              __ev: o,
              __createdInSpawnPhase: s,
              requestor: () => i,
              createdAt: () => l,
              accept: () => {
                const u = pickAllianceButton(a, "btn", 1);
                if (!u) return;
                try {
                  runAndCaptureAllianceCtor((() => u.action()));
                  _allianceBehaviorActioned.add(o);
                  setLastAction(tr("🤝 Alliance {name}", {
                    name: safeName(i)
                  }), "diplo");
                } catch (d) {
                  console.error("[AutoBot] alliance accept failed:", d);
                }
              },
              reject: () => {
                const u = pickAllianceButton(a, "btn-info", 2);
                if (!u) return;
                try {
                  u.action();
                  _allianceBehaviorActioned.add(o);
                } catch (d) {}
              }
            });
          }
          return t;
        }
        canSendAllianceRequest(t) {
          const n = this.player.__src;
          if (n && typeof n.canSendAllianceRequest === "function") {
            try {
              return n.canSendAllianceRequest(t.__src ?? t);
            } catch (o) {}
          }
          try {
            if (t.isAlive && t.isAlive() === false) return false;
            if (this.player.isAlliedWith(t)) return false;
            if (this.player.isOnSameTeam && this.player.isOnSameTeam(t)) {
              return false;
            }
            if (this.player.isRequestingAllianceWith && this.player.isRequestingAllianceWith(t)) {
              return false;
            }
          } catch (o) {
            return false;
          }
          return true;
        }
        resolveEventPlayer(t) {
          const n = Number(t?.focusID);
          if (!Number.isFinite(n)) return null;
          let o = null;
          try {
            o = this.game.playerBySmallID ? this.game.playerBySmallID(n) : null;
          } catch (r) {
            o = null;
          }
          if (o && o.isPlayer && o.isPlayer()) return o;
          try {
            for (const r of this.game.players()) {
              if (r.smallID() === n) return r;
            }
          } catch (r) {}
          return null;
        }
      }
      function assertNever(e) {
        throw new Error("Unexpected difficulty: " + String(e));
      }
      "use strict";
      const MIRV_COOLDOWN_TICKS = 300;
      class MirvBehavior {
        constructor(t, n, o, r) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.emojiBehavior = r;
          this.recentMirvTargets = new Map;
        }
        get hesitationOdds() {
          switch (currentDifficulty()) {
           case Difficulty.Easy:
            return 2;

           case Difficulty.Medium:
            return 4;

           case Difficulty.Hard:
            return 8;

           case Difficulty.Impossible:
            return 16;

           default:
            return 16;
          }
        }
        get victoryDenialTeamThreshold() {
          switch (currentDifficulty()) {
           case Difficulty.Easy:
            return .9;

           case Difficulty.Medium:
            return .8;

           case Difficulty.Hard:
            return .7;

           case Difficulty.Impossible:
            return .6;

           default:
            return .6;
          }
        }
        get victoryDenialIndividualThreshold() {
          switch (currentDifficulty()) {
           case Difficulty.Easy:
            return .75;

           case Difficulty.Medium:
            return .65;

           case Difficulty.Hard:
            return .55;

           case Difficulty.Impossible:
            return .4;

           default:
            return .4;
          }
        }
        get steamrollCityGapMultiplier() {
          switch (currentDifficulty()) {
           case Difficulty.Easy:
            return 2;

           case Difficulty.Medium:
            return 1.5;

           case Difficulty.Hard:
            return 1.25;

           case Difficulty.Impossible:
            return 1.15;

           default:
            return 1.15;
          }
        }
        get steamrollMinLeaderCities() {
          switch (currentDifficulty()) {
           case Difficulty.Easy:
            return 20;

           case Difficulty.Medium:
           case Difficulty.Hard:
            return 10;

           case Difficulty.Impossible:
            return 8;

           default:
            return 8;
          }
        }
        async considerMIRV() {
          if (this.player === null) throw new Error("not initialized");
          if (this.game.config().isUnitDisabled(UNIT.MIRV)) {
            return false;
          }
          if (this.player.units(UNIT.MissileSilo).length === 0) {
            return false;
          }
          const t = await this.cost(UNIT.MIRV);
          if (state.settings.winFixes) {
            if (this.teamHasWon()) {
              if (state.nukeReserveGold) state.nukeReserveGold = 0n;
              return false;
            }
            const a = this.selectWinFixMirvTarget(t);
            if (a && !this.wasRecentlyMirved(a)) {
              if (this.player.gold() >= t) {
                state.nukeReserveGold = 0n;
                await this.maybeSendMIRV(a);
                return true;
              }
              const i = state.settings.mirvEarlyGameTicks ?? 6e3;
              if (this.game.ticks() >= i) {
                state.nukeReserveGold = t;
              } else if (state.nukeReserveGold) {
                state.nukeReserveGold = 0n;
              }
              return false;
            }
            if (state.nukeReserveGold) state.nukeReserveGold = 0n;
          }
          if (this.player.gold() < t) {
            return false;
          }
          if (this.random.chance(this.hesitationOdds)) {
            return false;
          }
          const n = this.selectCounterMirvTarget();
          if (n && !this.wasRecentlyMirved(n)) {
            await this.maybeSendMIRV(n);
            return true;
          }
          const o = this.selectVictoryDenialTarget();
          if (o && !this.wasRecentlyMirved(o)) {
            await this.maybeSendMIRV(o);
            return true;
          }
          const r = this.selectSteamrollStopTarget();
          if (r && !this.wasRecentlyMirved(r)) {
            await this.maybeSendMIRV(r);
            return true;
          }
          return false;
        }
        selectCounterMirvTarget() {
          if (this.player === null) throw new Error("not initialized");
          const t = this.getValidMirvTargetPlayers().filter((n => this.isInboundMIRVFrom(n)));
          if (t.length === 0) return null;
          t.sort(((n, o) => o.numTilesOwned() - n.numTilesOwned()));
          return t[0];
        }
        selectVictoryDenialTarget() {
          if (this.player === null) throw new Error("not initialized");
          const t = this.game.numLandTiles();
          if (t === 0) return null;
          let n = null;
          for (const o of this.getValidMirvTargetPlayers()) {
            let r = 0;
            const a = o.team();
            if (a !== null) {
              const i = this.game.players().filter((c => c.team() === a && c.isPlayer()));
              const s = i.map((c => c.numTilesOwned())).reduce(((c, u) => c + u), 0);
              const l = s / t;
              if (l >= this.victoryDenialTeamThreshold) {
                let c = null;
                let u = -1;
                for (const d of i) {
                  const f = d.numTilesOwned();
                  if (f > u) {
                    u = f;
                    c = d;
                  }
                }
                if (c !== null && c.smallID() === o.smallID()) {
                  r = l;
                } else {
                  r = 0;
                }
              }
            } else {
              const i = o.numTilesOwned() / t;
              if (i >= this.victoryDenialIndividualThreshold) r = i;
            }
            if (r > 0) {
              if (n === null || r > n.severity) n = {
                p: o,
                severity: r
              };
            }
          }
          return n ? n.p : null;
        }
        selectSteamrollStopTarget() {
          if (this.player === null) throw new Error("not initialized");
          const t = this.getValidMirvTargetPlayers();
          if (t.length === 0) return null;
          const n = this.game.players().filter((i => i.isPlayer())).map((i => ({
            p: i,
            cityCount: this.countCities(i)
          }))).sort(((i, s) => s.cityCount - i.cityCount));
          if (n.length < 2) return null;
          const o = n[0];
          if (o.cityCount <= this.steamrollMinLeaderCities) return null;
          const r = n[1].cityCount;
          const a = r * this.steamrollCityGapMultiplier;
          if (o.cityCount >= a) {
            return t.some((i => i.smallID() === o.p.smallID())) ? o.p : null;
          }
          return null;
        }
        teamHasWon() {
          if (this.player === null) return false;
          try {
            if (String(this.game.config().gameConfig().gameMode) !== "Team") {
              return false;
            }
          } catch (a) {
            return false;
          }
          const t = typeof this.game.numTilesWithFallout === "function" ? this.game.numTilesWithFallout() : 0;
          const n = (this.game.numLandTiles() || 0) - t;
          if (n <= 0) return false;
          let o = 0;
          for (const a of this.game.players()) {
            try {
              if (a.isPlayer() && this.player.isOnSameTeam(a)) {
                o += a.numTilesOwned();
              }
            } catch (i) {}
          }
          let r = .95;
          try {
            const a = Number(this.game.config().percentageTilesOwnedToWin());
            if (Number.isFinite(a)) r = a / 100;
          } catch (a) {}
          if (Number.isFinite(state.settings.teamWonShare)) {
            r = state.settings.teamWonShare;
          }
          return o / n > r;
        }
        selectWinFixMirvTarget(t) {
          if (this.player === null) return null;
          const n = this.getValidMirvTargetPlayers().filter((l => l.isAlive()));
          if (n.length === 0) return null;
          const o = this.game.numLandTiles() || 1;
          const r = state.settings.mirvTargetMinShare ?? .35;
          const a = state.settings.mirvTargetTopN ?? 3;
          const i = new Set(this.game.players().filter((l => l.isAlive())).sort(((l, c) => c.numTilesOwned() - l.numTilesOwned())).slice(0, a).map((l => l.smallID())));
          const s = n.filter((l => i.has(l.smallID()) && l.numTilesOwned() / o > r)).sort(((l, c) => c.numTilesOwned() - l.numTilesOwned()));
          return s.length > 0 ? s[0] : null;
        }
        wasRecentlyMirved(t) {
          const n = this.recentMirvTargets.get(t.id());
          if (n === void 0) return false;
          return this.game.ticks() - n < MIRV_COOLDOWN_TICKS;
        }
        recordMirvHit(t) {
          this.recentMirvTargets.set(t.id(), this.game.ticks());
        }
        getValidMirvTargetPlayers() {
          if (this.player === null) throw new Error("not initialized");
          return this.game.players().filter((t => t.smallID() !== this.player.smallID() && t.isPlayer() && t.type() !== PlayerType.Bot && !this.player.isOnSameTeam(t)));
        }
        isInboundMIRVFrom(t) {
          if (this.player === null) throw new Error("not initialized");
          const n = t.units(UNIT.MIRV);
          for (const o of n) {
            const r = o.targetTile();
            if (!r) continue;
            if (!this.game.hasOwner(r)) continue;
            const a = this.game.owner(r);
            if (a && a.isPlayer && a.isPlayer() && a.smallID() === this.player.smallID()) {
              return true;
            }
          }
          return false;
        }
        async maybeSendMIRV(t) {
          if (this.player === null) throw new Error("not initialized");
          this.emojiBehavior.maybeSendAttackEmoji(t);
          const n = await this.calculateTerritoryCenter(t);
          if (!n) return;
          let o;
          try {
            o = await withTimeout(this.player.buildables(n, [ UNIT.MIRV ]), WORKER_TIMEOUT_MS, null);
          } catch (a) {
            return;
          }
          const r = Array.isArray(o) ? o.find((a => a.type === UNIT.MIRV)) : null;
          if (r === null || r === void 0) return;
          if (r.canBuild !== false && this.player.gold() >= r.cost) {
            const a = getBuildMenu();
            if (!a || typeof a.sendBuildOrUpgrade !== "function") return;
            a.sendBuildOrUpgrade(r, n);
            this.recordMirvHit(t);
            if (state.settings.winFixes) {
              if (!Array.isArray(state.recentMirvHits)) state.recentMirvHits = [];
              state.recentMirvHits.push({
                sid: t.smallID(),
                tile: n,
                at: this.game.ticks()
              });
            }
            state.stats.nukes++;
            setLastAction(tr("☢️ MIRV"), "nuke");
            this.emojiBehavior.sendEmoji(AllPlayers, EMOJI_NUKE);
            respondToMIRV(this.game, this.random, t);
          }
        }
        countCities(t) {
          return t.unitCount(UNIT.City);
        }
        async calculateTerritoryCenter(t) {
          let n;
          try {
            const p = await withTimeout(t.borderTilesAsync(), WORKER_TIMEOUT_MS, null);
            n = p && p.borderTiles ? p.borderTiles : p;
          } catch (p) {
            return null;
          }
          if (!n) return null;
          const o = Array.from(n);
          if (o.length === 0) return null;
          let r = Infinity, a = -Infinity;
          let i = Infinity, s = -Infinity;
          for (const p of o) {
            const h = this.game.x(p);
            const m = this.game.y(p);
            if (h < r) r = h;
            if (h > a) a = h;
            if (m < i) i = m;
            if (m > s) s = m;
          }
          const l = Math.floor((r + a) / 2);
          const c = Math.floor((i + s) / 2);
          const u = this.game.ref(l, c);
          if (this.game.hasOwner(u) && this.game.ownerID(u) === t.smallID()) {
            return u;
          }
          let d = null;
          let f = Infinity;
          for (const p of o) {
            const h = this.game.x(p) - l;
            const m = this.game.y(p) - c;
            const g = h * h + m * m;
            if (g < f) {
              f = g;
              d = p;
            }
          }
          return d;
        }
        async cost(t) {
          if (this.player === null) throw new Error("not initialized");
          const n = this.player.borderTiles();
          const o = n && n.size > 0 ? n.values().next().value : null;
          if (o === null || o === void 0) return 0n;
          let r;
          try {
            r = await withTimeout(this.player.buildables(o, [ t ]), WORKER_TIMEOUT_MS, null);
          } catch (i) {
            return 0n;
          }
          const a = Array.isArray(r) ? r.find((i => i.type === t)) : null;
          return a && a.cost !== void 0 && a.cost !== null ? a.cost : 0n;
        }
      }
      "use strict";
      class WarshipBehavior {
        constructor(t, n, o, r) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.emojiBehavior = r;
          this.trackedTransportShips = new Set;
          this.trackedTradeShips = new Set;
          this.trackedIncomingTransportShips = new Set;
          this.dealtWithTransportShip = new Set;
        }
        indexById(t) {
          const n = new Map;
          for (const o of t) n.set(o.id(), o);
          return n;
        }
        async maybeSpawnWarship() {
          if (this.player === null) throw new Error("not initialized");
          if (this.game.config().isUnitDisabled(UNIT.Warship)) {
            return false;
          }
          if (!this.random.chance(50)) {
            return false;
          }
          const t = this.player.units(UNIT.Port);
          const n = this.player.units(UNIT.Warship);
          if (t.length > 0 && n.length === 0 && this.player.gold() > this.cost(UNIT.Warship)) {
            const o = this.random.randElement(t);
            const r = this.warshipSpawnTile(o.tile(), 250);
            if (r === null) {
              return false;
            }
            const a = await this.buildableWarship(r);
            if (a === null || a === void 0 || a.canBuild === false) {
              return false;
            }
            const i = getBuildMenu();
            if (!i || typeof i.sendBuildOrUpgrade !== "function") {
              return false;
            }
            i.sendBuildOrUpgrade(a, r);
            state.stats.builds++;
            setLastAction(tr("🚢 Deploy warship"), "naval");
            return true;
          }
          return false;
        }
        warshipSpawnTile(t, n) {
          for (let o = 0; o < 50; o++) {
            const r = this.random.nextInt(this.game.x(t) - n, this.game.x(t) + n);
            const a = this.random.nextInt(this.game.y(t) - n, this.game.y(t) + n);
            if (!this.game.isValidCoord(r, a)) {
              continue;
            }
            const i = this.game.ref(r, a);
            if (!this.game.isWater(i)) {
              continue;
            }
            return i;
          }
          return null;
        }
        trackShipsAndRetaliate() {
          this.trackTransportShipsAndRetaliate();
          this.trackTradeShipsAndRetaliate();
          this.trackIncomingTransportsAndRetaliate();
        }
        trackTransportShipsAndRetaliate() {
          if (this.game.config().isUnitDisabled(UNIT.TransportShip)) {
            return;
          }
          this.player.units(UNIT.TransportShip).forEach((n => this.trackedTransportShips.add(n.id())));
          const t = this.indexById(this.game.units(UNIT.TransportShip));
          for (const n of Array.from(this.trackedTransportShips)) {
            const o = t.get(n);
            const r = o !== void 0 && o.isActive();
            if (!r) {
              if (o !== void 0 && typeof o.wasDestroyedByEnemy === "function" && typeof o.destroyer === "function" && o.wasDestroyedByEnemy() && o.destroyer() !== void 0) {
                this.maybeRetaliateWithWarship(o.tile(), o.destroyer(), "transport");
              }
              this.trackedTransportShips.delete(n);
            }
          }
        }
        trackTradeShipsAndRetaliate() {
          this.player.units(UNIT.TradeShip).forEach((n => this.trackedTradeShips.add(n.id())));
          const t = this.indexById(this.game.units(UNIT.TradeShip));
          for (const n of Array.from(this.trackedTradeShips)) {
            const o = t.get(n);
            if (o === void 0 || !o.isActive()) {
              this.trackedTradeShips.delete(n);
              continue;
            }
            if (o.owner().id() !== this.player.id()) {
              this.maybeRetaliateWithWarship(o.tile(), o.owner(), "trade");
              this.trackedTradeShips.delete(n);
            }
          }
        }
        trackIncomingTransportsAndRetaliate() {
          this.game.units(UNIT.TransportShip).filter((n => {
            const o = n.targetTile();
            return o && n.isActive() && !n.transportShipState()?.isRetreating && this.game.ownerID(o) === this.player?.smallID() && n.owner().smallID() !== this.player?.smallID();
          })).forEach((n => this.trackedIncomingTransportShips.add(n.id())));
          const t = this.indexById(this.game.units(UNIT.TransportShip));
          for (const n of Array.from(this.trackedIncomingTransportShips)) {
            const o = t.get(n);
            const r = o !== void 0 ? o.targetTile() : void 0;
            if (o === void 0 || !o.isActive() || r === void 0 || o.transportShipState()?.isRetreating) {
              this.trackedIncomingTransportShips.delete(n);
              this.dealtWithTransportShip.delete(n);
              continue;
            }
            if (this.dealtWithTransportShip.has(n)) {
              continue;
            }
            const a = this.game.manhattanDist(o.tile(), r);
            if (a < 20) {
              this.dealtWithTransportShip.add(n);
              continue;
            }
            if (!o.owner().isAlliedWith(this.player)) {
              if (this.game.hasUnitNearby(r, 90, UNIT.Warship, this.player.id(), true) || this.player.units(UNIT.Warship).filter((s => {
                const l = s.warshipState().patrolTile;
                return l !== void 0 && this.game.manhattanDist(r, l) < 90;
              })).length > 0) {
                this.dealtWithTransportShip.add(n);
                continue;
              }
              const i = this.warshipSpawnTile(r, 30);
              if (i === null) continue;
              this.maybeRetaliateWithWarship(i, o.owner(), "transport");
              this.dealtWithTransportShip.add(n);
              break;
            }
          }
        }
        maybeRetaliateWithWarship(t, n, o) {
          if (n.smallID() === this.player.smallID()) {
            return;
          }
          if (this.player.units(UNIT.Warship).length >= 10) {
            this.maybeMoveWarship(t);
            return;
          }
          const r = currentDifficulty();
          if (r === Difficulty.Medium && this.random.nextInt(0, 100) < 15 || r === Difficulty.Hard && this.random.nextInt(0, 100) < 50 || r === Difficulty.Impossible && this.random.nextInt(0, 100) < 80) {
            void this._retaliateBuildAsync(t, n, o);
          }
        }
        async _retaliateBuildAsync(t, n, o) {
          try {
            const r = await this.buildableWarship(t);
            if (r === null || r === void 0 || r.canBuild === false) {
              this.maybeMoveWarship(t);
              return;
            }
            const a = getBuildMenu();
            if (!a || typeof a.sendBuildOrUpgrade !== "function") {
              this.maybeMoveWarship(t);
              return;
            }
            a.sendBuildOrUpgrade(r, t);
            state.stats.builds++;
            setLastAction(tr("🚢 Retaliate warship"), "naval");
            this.emojiBehavior.maybeSendEmoji(n, EMOJI_WARSHIP_RETALIATION);
            this.player.updateRelation(n, o === "trade" ? -7.5 : -15);
          } catch (r) {}
        }
        maybeMoveWarship(t) {
          if (this.game.isWater(t)) {
            const n = this.player.units(UNIT.Warship).filter((o => {
              const r = o.warshipState().patrolTile;
              return r !== void 0 && this.game.manhattanDist(o.tile(), r) < 130;
            })).sort(((o, r) => {
              const a = this.game.manhattanDist(o.tile(), t);
              const i = this.game.manhattanDist(r.tile(), t);
              return a - i;
            }))[0];
            if (n) {
              const o = discoverCtors(getEventBus());
              if (o.moveWarship) {
                emitIntent(o.moveWarship, [ n.id() ], t);
              }
            }
          }
        }
        async counterWarshipInfestation() {
          if (!this.shouldCounterWarshipInfestation()) {
            return;
          }
          const t = this.player.team() !== null;
          if (!this.isRichPlayer(t)) {
            return;
          }
          const n = this.findWarshipInfestationCounterTarget(t);
          if (n !== null) {
            await this.buildCounterWarship(n);
          }
        }
        shouldCounterWarshipInfestation() {
          if (this.game.config().isUnitDisabled(UNIT.Warship)) {
            return false;
          }
          const t = currentDifficulty();
          if (t !== Difficulty.Hard && t !== Difficulty.Impossible) {
            return false;
          }
          if (this.game.unitCount(UNIT.Warship) <= 10) {
            return false;
          }
          if (this.cost(UNIT.Warship) > this.player.gold()) {
            return false;
          }
          if (this.player.units(UNIT.Port).length === 0) {
            return false;
          }
          if (this.player.units(UNIT.Warship).length >= 10) {
            return false;
          }
          return true;
        }
        isRichPlayer(t) {
          const n = this.game.players().filter((r => {
            if (r.type() === PlayerType.Human) return false;
            return t ? r.team() === this.player.team() : true;
          }));
          const o = n.sort(((r, a) => Number(a.gold() - r.gold()))).slice(0, 3);
          return o.some((r => r.id() === this.player.id()));
        }
        findWarshipInfestationCounterTarget(t) {
          return t ? this.findTeamGameWarshipTarget() : this.findFreeForAllWarshipTarget();
        }
        findTeamGameWarshipTarget() {
          const t = new Map;
          for (const n of this.game.players()) {
            if (this.player.isFriendly(n) || n.id() === this.player.id()) {
              continue;
            }
            const o = n.team();
            if (o === null) continue;
            const r = o.toString();
            const a = n.units(UNIT.Warship).length;
            if (!t.has(r)) {
              t.set(r, {
                count: 0,
                team: r,
                players: []
              });
            }
            const i = t.get(r);
            i.count += a;
            i.players.push(n);
          }
          for (const [, n] of t.entries()) {
            if (n.count > 15) {
              const o = n.players.reduce(((r, a) => {
                const i = a.units(UNIT.Warship).length;
                const s = r ? r.units(UNIT.Warship).length : 0;
                return i > s ? a : r;
              }), null);
              if (o) {
                const r = o.units(UNIT.Warship);
                if (r.length > 3) {
                  return {
                    player: o,
                    warship: this.random.randElement(r)
                  };
                }
              }
            }
          }
          return null;
        }
        findFreeForAllWarshipTarget() {
          const t = this.game.players().filter((n => !this.player.isFriendly(n) && n.id() !== this.player.id()));
          for (const n of t) {
            const o = n.units(UNIT.Warship);
            if (o.length > 10) {
              return {
                player: n,
                warship: this.random.randElement(o)
              };
            }
          }
          return null;
        }
        async buildCounterWarship(t) {
          const n = t.warship.tile();
          const o = await this.buildableWarship(n);
          if (o === null || o === void 0 || o.canBuild === false) {
            this.maybeMoveWarship(n);
            return;
          }
          const r = getBuildMenu();
          if (!r || typeof r.sendBuildOrUpgrade !== "function") {
            this.maybeMoveWarship(n);
            return;
          }
          r.sendBuildOrUpgrade(o, n);
          state.stats.builds++;
          setLastAction(tr("🚢 Counter warship"), "naval");
          this.emojiBehavior.sendEmoji(AllPlayers, EMOJI_WARSHIP_RETALIATION);
        }
        async buildableWarship(t) {
          let n;
          try {
            n = await withTimeout(this.player.buildables(t, [ UNIT.Warship ]), WORKER_TIMEOUT_MS, null);
          } catch (o) {
            return null;
          }
          return Array.isArray(n) ? n.find((o => o.type === UNIT.Warship)) ?? null : null;
        }
        cost(t) {
          if (t === UNIT.Warship) {
            const n = this.player.unitsOwned(UNIT.Warship);
            return BigInt(Math.min(1e6, (n + 1) * 25e4));
          }
          return 0n;
        }
        ensureSmartState() {
          return this.smartState = this.smartState || {
            transportPos: new Map,
            tradePos: new Map,
            losses: [],
            raids: [],
            cooldown: new Map,
            serviced: new Map,
            lastPassMs: 0
          };
        }
        smartWarshipPatrol() {
          if (this.player === null) return;
          if (this.game.config().isUnitDisabled(UNIT.Warship)) return;
          const t = this.ensureSmartState();
          const n = performance.now();
          const o = state.settings.warshipPatrolThrottleMs || 1500;
          if (n - t.lastPassMs < o) return;
          t.lastPassMs = n;
          const r = this.game.ticks();
          const a = this.player.smallID();
          const i = this.player.id();
          const s = this.indexById(this.game.units(UNIT.TransportShip));
          for (const y of this.player.units(UNIT.TransportShip)) {
            try {
              const b = y.targetTile ? y.targetTile() : null;
              t.transportPos.set(y.id(), {
                x: this.game.x(y.tile()),
                y: this.game.y(y.tile()),
                tx: b != null ? this.game.x(b) : null,
                ty: b != null ? this.game.y(b) : null
              });
            } catch (b) {}
          }
          const l = state.settings.warshipLossMinDist || 25;
          for (const [y, b] of Array.from(t.transportPos)) {
            const w = s.get(y);
            const v = w !== void 0 && w.isActive() && w.owner().smallID() === a;
            if (v) continue;
            if (b.tx != null && b.ty != null) {
              const x = Math.abs(b.x - b.tx) + Math.abs(b.y - b.ty);
              if (x > l) t.losses.push({
                x: b.x,
                y: b.y,
                at: r
              });
            }
            t.transportPos.delete(y);
          }
          const c = this.indexById(this.game.units(UNIT.TradeShip));
          for (const y of this.player.units(UNIT.TradeShip)) {
            try {
              t.tradePos.set(y.id(), {
                x: this.game.x(y.tile()),
                y: this.game.y(y.tile())
              });
            } catch (b) {}
          }
          for (const [y] of Array.from(t.tradePos)) {
            const b = c.get(y);
            if (b === void 0 || !b.isActive()) {
              t.tradePos.delete(y);
              continue;
            }
            if (b.owner().id() !== i) {
              try {
                t.raids.push({
                  x: this.game.x(b.tile()),
                  y: this.game.y(b.tile()),
                  at: r
                });
              } catch (w) {}
              t.tradePos.delete(y);
            }
          }
          const u = state.settings.warshipLossWindowTicks || 900;
          const d = state.settings.warshipRaidWindowTicks || 400;
          t.losses = t.losses.filter((y => r - y.at <= u));
          t.raids = t.raids.filter((y => r - y.at <= d));
          const f = [];
          const p = this.findInvasionThreat();
          if (p !== null) f.push(p);
          if (t.raids.length > 0) {
            const y = t.raids[t.raids.length - 1];
            if (this.game.isValidCoord(y.x, y.y)) {
              const b = this.game.ref(y.x, y.y);
              if (this.game.isWater(b)) {
                f.push({
                  tile: b,
                  kind: "trade-lane"
                });
              }
            }
          }
          const h = this.findLossZone(t.losses);
          if (h !== null) f.push({
            tile: h,
            kind: "loss-zone"
          });
          if (f.length === 0) return;
          const m = state.settings.warshipServiceCellSize || 40;
          const g = state.settings.warshipZoneServiceTicks || 90;
          for (const [y, b] of Array.from(t.serviced)) {
            if (r - b > g) t.serviced.delete(y);
          }
          for (const y of f) {
            const b = Math.floor(this.game.x(y.tile) / m) + "," + Math.floor(this.game.y(y.tile) / m);
            const w = t.serviced.get(b);
            if (w !== void 0 && r - w < g) continue;
            if (this.moveBestWarshipTo(y.tile, y.kind, t, r)) {
              t.serviced.set(b, r);
              break;
            }
          }
        }
        findInvasionThreat() {
          const t = this.player.smallID();
          let n = null;
          let o = Infinity;
          for (const r of this.game.units(UNIT.TransportShip)) {
            try {
              if (!r.isActive()) continue;
              const a = r.targetTile();
              if (a == null) continue;
              if (r.transportShipState && r.transportShipState()?.isRetreating) continue;
              if (this.game.ownerID(a) !== t) continue;
              if (r.owner().smallID() === t) continue;
              if (r.owner().isAlliedWith(this.player)) continue;
              const i = this.game.manhattanDist(r.tile(), a);
              if (i < 20) continue;
              if (this.game.hasUnitNearby(a, 90, UNIT.Warship, this.player.id(), true)) {
                continue;
              }
              if (i < o) {
                o = i;
                n = r.tile();
              }
            } catch (a) {}
          }
          return n === null ? null : {
            tile: n,
            kind: "invasion"
          };
        }
        findLossZone(t) {
          const n = state.settings.warshipLossZoneMin || 2;
          const o = state.settings.warshipLossZoneRadius || 35;
          if (t.length < n) return null;
          let r = null;
          let a = 0;
          for (const i of t) {
            let s = 0;
            let l = 0;
            let c = 0;
            for (const u of t) {
              if (Math.abs(i.x - u.x) + Math.abs(i.y - u.y) <= o) {
                s += u.x;
                l += u.y;
                c++;
              }
            }
            if (c >= n && c > a) {
              const u = Math.round(s / c);
              const d = Math.round(l / c);
              if (this.game.isValidCoord(u, d)) {
                const f = this.game.ref(u, d);
                if (this.game.isWater(f)) {
                  a = c;
                  r = f;
                }
              }
            }
          }
          return r;
        }
        moveBestWarshipTo(t, n, o, r) {
          if (!this.game.isWater(t)) return false;
          const a = state.settings.warshipMoveMaxDist || 160;
          const i = state.settings.warshipMoveCooldownTicks || 60;
          const s = this.player.units(UNIT.Warship).filter((u => {
            try {
              const d = u.warshipState().patrolTile;
              if (d === void 0) return false;
              if (this.game.manhattanDist(u.tile(), d) >= 130) return false;
              const f = o.cooldown.get(u.id());
              if (f !== void 0 && r - f < i) return false;
              return true;
            } catch (d) {
              return false;
            }
          }));
          if (s.length === 0) return false;
          s.sort(((u, d) => this.game.manhattanDist(u.tile(), t) - this.game.manhattanDist(d.tile(), t)));
          const l = s[0];
          if (this.game.manhattanDist(l.tile(), t) > a) return false;
          const c = discoverCtors(getEventBus());
          if (!c.moveWarship) return false;
          emitIntent(c.moveWarship, [ l.id() ], t);
          o.cooldown.set(l.id(), r);
          setLastAction(tr("🚢 Patrol → {k}", {
            k: n
          }), "naval");
          console.log("[Warship] patrol →", n, "@", this.game.x(t), this.game.y(t));
          return true;
        }
        computeNukeRemainingTicks(t, n) {
          try {
            if (typeof UniversalPathFinding === "undefined" || !UniversalPathFinding.Parabola || t === void 0 || t === null || n === void 0 || n === null) {
              return null;
            }
            const o = this.game.config?.().defaultNukeSpeed?.() ?? 8;
            const r = UniversalPathFinding.Parabola(this.game, {
              increment: o,
              distanceBasedHeight: true,
              directionUp: true
            });
            const a = r.findPath(t, n);
            if (!Array.isArray(a) || a.length === 0) return null;
            if (a.length === 1) return 1;
            let i = 0;
            for (let s = 1; s < a.length; s++) {
              const l = this.game.x(a[s]);
              const c = this.game.y(a[s]);
              const u = this.game.x(a[s - 1]);
              const d = this.game.y(a[s - 1]);
              i += Math.hypot(l - u, c - d);
            }
            return Math.floor(i / (o > 0 ? o : 8)) + 1;
          } catch (o) {
            return null;
          }
        }
        nukeEtaTicks(t, n) {
          const o = t.type?.();
          if (o === UNIT.MIRVWarhead) return 0;
          const r = t.id?.();
          if (r === void 0) return 0;
          if (!this.nukeEtaById) this.nukeEtaById = new Map;
          let a = this.nukeEtaById.get(r);
          if (a === void 0) {
            let i = this.computeNukeRemainingTicks(t.tile?.(), t.targetTile?.());
            if (i === null) {
              try {
                const s = this.game.config?.().defaultNukeSpeed?.() ?? 8;
                const l = this.game.euclideanDistSquared(t.tile(), t.targetTile());
                i = Math.floor(Math.sqrt(l) / (s > 0 ? s : 8)) + 1;
              } catch (s) {
                i = 1;
              }
            }
            a = {
              firstTick: n,
              remainTicks: i
            };
            this.nukeEtaById.set(r, a);
          }
          return Math.max(0, a.remainTicks - (n - a.firstTick));
        }
        nukeOuterRadius(t) {
          try {
            const n = this.game.config().nukeMagnitudes(t.type());
            const o = Number(n?.outer ?? n?.inner);
            if (Number.isFinite(o) && o > 0) return o;
          } catch (n) {}
          return t.type && t.type() === UNIT.HydrogenBomb ? 160 : 70;
        }
        findNukeEscapeTile(t, n, o, r) {
          let a = null;
          let i = Infinity;
          for (const h of o) {
            const m = t - h.tx;
            const g = n - h.ty;
            const y = m * m + g * g;
            if (y < i) {
              i = y;
              a = h;
            }
          }
          if (a === null) return null;
          const s = state.settings.warshipNukeDodgeBuffer || 20;
          const l = Math.max(1, state.settings.warshipNukeDodgeSamples || 8);
          const c = Math.max(1, state.settings.warshipNukeDodgeRings || 3);
          let u = Math.atan2(n - a.ty, t - a.tx);
          if (!Number.isFinite(u)) u = 0;
          let d = null;
          let f = -Infinity;
          let p = Infinity;
          for (let h = 1; h <= c; h++) {
            const m = a.radius + s * h;
            for (let g = 0; g < l; g++) {
              const y = Math.ceil(g / 2);
              const b = g % 2 === 0 ? 1 : -1;
              const w = u + b * y * (Math.PI / 4);
              const v = Math.round(a.tx + Math.cos(w) * m);
              const x = Math.round(a.ty + Math.sin(w) * m);
              if (!this.game.isValidCoord(v, x)) continue;
              const T = this.game.ref(v, x);
              if (!this.game.isWater(T)) continue;
              const N = r(v, x);
              const M = Math.abs(v - t) + Math.abs(x - n);
              if (N > f || N === f && M < p) {
                f = N;
                p = M;
                d = T;
              }
            }
          }
          if (d === null) return null;
          return {
            tile: d,
            eta: f
          };
        }
        dodgeNukes() {
          if (this.player === null) return;
          if (this.game.config().isUnitDisabled(UNIT.Warship)) return;
          const t = this.player.units(UNIT.Warship);
          if (t.length === 0) return;
          const n = this.game.ticks();
          const o = state.settings.warshipNukeDodgeMargin || 8;
          const r = [];
          const a = new Set;
          for (const c of this.game.units(UNIT.AtomBomb, UNIT.HydrogenBomb, UNIT.MIRVWarhead)) {
            try {
              if (!c.isActive()) continue;
              const u = c.targetTile();
              if (u === void 0 || u === null) continue;
              const d = c.id?.();
              if (d !== void 0) a.add(d);
              const f = this.nukeOuterRadius(c) + o;
              r.push({
                tx: this.game.x(u),
                ty: this.game.y(u),
                radius: f,
                r2: f * f,
                owner: c.owner()?.smallID?.(),
                eta: this.nukeEtaTicks(c, n)
              });
            } catch (u) {}
          }
          if (this.nukeEtaById && this.nukeEtaById.size > 0) {
            for (const c of Array.from(this.nukeEtaById.keys())) {
              if (!a.has(c)) this.nukeEtaById.delete(c);
            }
          }
          if (r.length === 0) return;
          const i = (c, u) => {
            let d = Infinity;
            for (const f of r) {
              const p = c - f.tx;
              const h = u - f.ty;
              if (p * p + h * h <= f.r2 && f.eta < d) d = f.eta;
            }
            return d;
          };
          const s = performance.now();
          if (s - (this._dodgeLogAtMs || 0) > 1e3) {
            this._dodgeLogAtMs = s;
            const c = this.player.smallID();
            console.log("[Warship] nuke-dodge scan:", r.length, "zone(s)", r.map((u => ({
              owner: u.owner,
              mine: u.owner === c,
              eta: u.eta
            }))));
          }
          const l = this.ensureSmartState();
          for (const c of t) {
            try {
              const u = c.tile();
              const d = this.game.x(u);
              const f = this.game.y(u);
              const p = i(d, f);
              if (p === Infinity) continue;
              const h = this.findNukeEscapeTile(d, f, r, i);
              if (h === null) continue;
              if (h.eta <= p) continue;
              const m = c.warshipState().patrolTile;
              if (m !== void 0 && i(this.game.x(m), this.game.y(m)) >= h.eta) {
                continue;
              }
              const g = discoverCtors(getEventBus());
              if (!g.moveWarship) continue;
              emitIntent(g.moveWarship, [ c.id() ], h.tile);
              l.cooldown.set(c.id(), n);
              setLastAction(tr("🚢 Dodge nuke"), "naval");
            } catch (u) {}
          }
        }
        simulateBattle(t, n, o, r) {
          if (n.length === 0) return {
            win: true,
            survivalPct: 100
          };
          if (t.length === 0) return {
            win: false,
            survivalPct: 0
          };
          const a = this.game;
          const i = typeof a.config === "function" && typeof a.config().warshipTargettingRange === "function" ? a.config().warshipTargettingRange() : 8;
          const s = typeof a.config === "function" && typeof a.config().unitInfo === "function" ? a.config().unitInfo("Shell") : null;
          const l = s ? s.damage || 250 : 250;
          const c = typeof a.config === "function" && typeof a.config().warshipShellAttackRate === "function" ? a.config().warshipShellAttackRate() : 20;
          const u = l * 2.625;
          const d = u / Math.max(1, c);
          const f = t.length;
          const p = new Array(f);
          for (let v = 0; v < f; v++) {
            const x = t[v];
            const T = r ? a.manhattanDist(r, x.tile()) : i;
            p[v] = {
              hp: x.health(),
              engageTick: Math.max(0, T - i)
            };
          }
          const h = n.length;
          const m = new Array(h);
          for (let v = 0; v < h; v++) {
            const x = n[v];
            const T = r ? a.manhattanDist(r, x.tile()) : i;
            m[v] = {
              hp: x.health(),
              engageTick: Math.max(0, T - i)
            };
          }
          let g = 0;
          while (g < 1e3) {
            let v = 0, x = Infinity;
            for (let E = 0; E < f; E++) {
              if (p[E].hp > .01) {
                v++;
                if (p[E].engageTick < x) x = p[E].engageTick;
              }
            }
            let T = 0, N = Infinity;
            for (let E = 0; E < h; E++) {
              if (m[E].hp > .01) {
                T++;
                if (m[E].engageTick < N) N = m[E].engageTick;
              }
            }
            if (T === 0 || v === 0) break;
            const M = p.filter((E => E.hp > .01 && E.engageTick <= g));
            const A = m.filter((E => E.hp > .01 && E.engageTick <= g));
            if (M.length === 0 && A.length === 0) {
              const E = Math.min(x, N);
              if (E > g && E !== Infinity) {
                g = E;
                continue;
              }
            }
            if (M.length > 0 && A.length > 0) {
              let E = M.length * d;
              let D = A.length * d;
              A.sort(((O, $) => O.hp - $.hp));
              M.sort(((O, $) => O.hp - $.hp));
              for (let O = 0; O < A.length && E > 0; O++) {
                const $ = Math.min(A[O].hp, E);
                A[O].hp -= $;
                E -= $;
              }
              for (let O = 0; O < M.length && D > 0; O++) {
                const $ = Math.min(M[O].hp, D);
                M[O].hp -= $;
                D -= $;
              }
            }
            g++;
          }
          let y = 0, b = 0;
          for (let v = 0; v < f; v++) {
            if (p[v].hp > .01) {
              y++;
              b += Math.max(0, p[v].hp);
            }
          }
          let w = 0;
          for (let v = 0; v < h; v++) {
            if (m[v].hp > .01) w++;
          }
          if (y > 0 && w === 0) {
            let v = 0;
            for (let x = 0; x < t.length; x++) v += typeof t[x].maxHealth === "function" ? t[x].maxHealth() : o;
            return {
              win: true,
              survivalPct: b / v * 100
            };
          }
          return {
            win: false,
            survivalPct: 0
          };
        }
        findSafeWaypoint(t, n, o) {
          const r = this.game;
          const a = r.getWaterComponent(t);
          const i = 30;
          const s = [ {
            tile: t,
            depth: 0
          } ];
          const l = new Set;
          l.add(t);
          let c = t;
          let u = -Infinity;
          while (s.length > 0) {
            const {tile: d, depth: f} = s.shift();
            let p = Infinity;
            for (const x of o) {
              const T = r.manhattanDist(d, x.tile());
              if (T < p) p = T;
            }
            const h = n ? r.manhattanDist(d, n) : 0;
            const m = 15;
            const g = Math.min(p, m) * 50;
            const y = -h;
            let b = 0;
            r.forEachNeighbor(d, (x => {
              if (r.isWater(x)) b++;
            }));
            const w = (4 - b) * 15;
            const v = g + y - w;
            if (v > u) {
              u = v;
              c = d;
            }
            if (f >= i) continue;
            r.forEachNeighbor(d, (x => {
              if (r.isWater(x) && r.getWaterComponent(x) === a && !l.has(x)) {
                l.add(x);
                s.push({
                  tile: x,
                  depth: f + 1
                });
              }
            }));
          }
          return c;
        }
        smartWarshipCombat() {
          if (this.player === null) return;
          if (!state.settings.winFixes) return;
          if (!state.settings.features.warship) return;
          if (this.game.config().isUnitDisabled(UNIT.Warship)) return;
          const t = this.game;
          const n = this.player;
          const o = n.smallID();
          const r = this.ensureSmartState();
          const a = performance.now();
          const i = state.settings.warshipCombatThrottleMs || 800;
          if (a - (r.lastCombatPassMs || 0) < i) return;
          r.lastCombatPassMs = a;
          const s = [];
          for (const b of n.units(UNIT.Warship)) {
            try {
              if (b.isActive() && !b.isUnderConstruction()) s.push(b);
            } catch (w) {}
          }
          if (s.length === 0) return;
          const l = typeof t.unitInfo === "function" ? t.unitInfo("Warship") : null;
          const c = l ? l.maxHealth || 1e3 : 1e3;
          const u = (state.settings.warshipRetreatHealthPct || 50) / 100;
          const d = t.units(UNIT.Warship) || [];
          const f = [];
          for (const b of d) {
            try {
              const w = b.owner();
              if (!w || w.smallID() === o) continue;
              if (b.isActive() && !b.isUnderConstruction() && !b.isFriendly(n)) {
                f.push(b);
              }
            } catch (w) {}
          }
          const p = state.settings.warshipHuntTrade !== false;
          const h = [];
          if (p) {
            const b = t.units(UNIT.TradeShip) || [];
            for (const w of b) {
              try {
                const v = w.owner();
                if (!v || v.smallID() === o) continue;
                if (w.isActive() && !w.isFriendly(n)) h.push(w);
              } catch (v) {}
            }
          }
          let m = null;
          const g = [];
          const y = t.units(UNIT.Port) || [];
          for (const b of y) {
            try {
              if (b.isActive() && !b.isUnderConstruction() && b.owner() && b.owner().isFriendly(n)) g.push(b);
            } catch (w) {}
          }
          if (g.length > 0) {
            let b = g[0], w = Infinity;
            for (const v of g) {
              const x = t.manhattanDist(s[0].tile(), v.tile());
              if (x < w) {
                w = x;
                b = v;
              }
            }
            t.forEachNeighbor(b.tile(), (v => {
              if (m === null && t.isWater(v)) m = v;
            }));
            if (m === null) m = b.tile();
          }
          for (const b of s) {
            try {
              const w = b.id();
              const v = r.cooldown.get(w);
              if (v !== void 0 && t.ticks() - v < 3) continue;
              const x = b.health();
              const T = typeof b.maxHealth === "function" ? b.maxHealth() : c;
              const N = b.warshipState();
              const M = N && (N.state === "retreating" || N.state === "docked");
              if (M && g.length > 0) continue;
              const A = [];
              for (const O of f) {
                if (t.manhattanDist(b.tile(), O.tile()) <= 30) A.push(O);
              }
              let E = false;
              if (A.length > 0 && state.settings.warshipEvade !== false) {
                const O = s.filter((K => {
                  const q = K.warshipState();
                  if (q && (q.state === "retreating" || q.state === "docked")) return false;
                  const j = K.health();
                  if (j < T * u) return false;
                  return t.manhattanDist(b.tile(), K.tile()) <= 15;
                }));
                const $ = this.simulateBattle(O, A, T, b.tile());
                if (!$.win || $.survivalPct < 15) E = true;
              }
              let D = null;
              if (x < T * u) {
                if (E && A.length > 0) {
                  D = this.findSafeWaypoint(b.tile(), m, A);
                } else {
                  D = m;
                }
              } else if (E && A.length > 0) {
                D = this.findSafeWaypoint(b.tile(), m, A);
              } else if (!E && A.length > 0) {
                let O = null, $ = Infinity;
                for (const K of A) {
                  if (K.health() < $) {
                    $ = K.health();
                    O = K;
                  }
                }
                if (O) D = O.tile();
              } else if (p && h.length > 0) {
                let O = h[0], $ = Infinity;
                for (const K of h) {
                  const q = t.manhattanDist(b.tile(), K.tile());
                  if (q < $) {
                    $ = q;
                    O = K;
                  }
                }
                D = O.tile();
              }
              if (D !== null) {
                const O = N ? N.patrolTile : void 0;
                if (O !== D) {
                  this.moveWarship(b, D);
                  r.cooldown.set(w, t.ticks());
                }
              }
            } catch (w) {}
          }
        }
        moveWarship(t, n) {
          try {
            const o = typeof discoverCtors === "function" ? discoverCtors(getEventBus()) : {};
            if (o.moveWarship) {
              emitIntent(o.moveWarship, [ t.id() ], n);
            }
          } catch (o) {}
        }
      }
      "use strict";
      const SAM_RATIO_BY_DIFFICULTY = {
        [Difficulty.Easy]: .15,
        [Difficulty.Medium]: .2,
        [Difficulty.Hard]: .25,
        [Difficulty.Impossible]: .3
      };
      function getStructureRatios(e) {
        return {
          [UNIT.Port]: {
            ratioPerCity: .75,
            perceivedCostIncreasePerOwned: 1
          },
          [UNIT.Factory]: {
            ratioPerCity: .75,
            perceivedCostIncreasePerOwned: 1
          },
          [UNIT.SAMLauncher]: {
            ratioPerCity: SAM_RATIO_BY_DIFFICULTY[e],
            perceivedCostIncreasePerOwned: .3
          },
          [UNIT.MissileSilo]: {
            ratioPerCity: .2,
            perceivedCostIncreasePerOwned: 1
          }
        };
      }
      const CITY_PERCEIVED_COST_INCREASE_PER_OWNED = 1;
      const FACTORY_COASTAL_RATIO_MULTIPLIER = .33;
      const MAX_MISSILE_SILOS = 3;
      const FIRST_MISSILE_SILO_RATIO = .4;
      const UPGRADE_DENSITY_THRESHOLD = 1 / 1500;
      const TILES_PER_CITY_EQUIVALENT = 2e3;
      const HIGH_NATION_DENSITY_THRESHOLD = 1 / 7500;
      const HIGH_STARTING_GOLD_THRESHOLD = 3000000n;
      const HIGH_GOLD_STRUCTURE_COOLDOWN_TICKS = [ 0, 0, 250, 150, 100 ];
      const TEAM_POST_SAVE_UP_PHASE_TICKS = 150;
      const UNDER_ATTACK_THREAT_RATIO = .35;
      const DEFENSE_POST_RATIO_PER_POST = .4;
      const STRUCTURES_TYPES = [ UNIT.City, UNIT.DefensePost, UNIT.SAMLauncher, UNIT.MissileSilo, UNIT.Port, UNIT.Factory ];
      function autoBotBuildAllowed(e) {
        const t = state.settings && state.settings.buildStructures;
        return !t || t[e] !== false;
      }
      function shimCanTrade(e, t) {
        if (e == null || t == null) return false;
        if (e.id() === t.id()) return false;
        return !e.hasEmbargoAgainst(t) && !t.hasEmbargoAgainst(e);
      }
      function shimSharedWaterComponents(e, t) {
        try {
          if (typeof e.sharedWaterComponents === "function") {
            return e.sharedWaterComponents(t);
          }
        } catch (n) {}
        return null;
      }
      class StationUnionFind {
        constructor() {
          this.parent = new Map;
        }
        add(t) {
          if (!this.parent.has(t)) this.parent.set(t, t);
        }
        find(t) {
          let n = t;
          while (this.parent.get(n) !== n) n = this.parent.get(n);
          let o = t;
          while (this.parent.get(o) !== n) {
            const r = this.parent.get(o);
            this.parent.set(o, n);
            o = r;
          }
          return n;
        }
        union(t, n) {
          const o = this.find(t);
          const r = this.find(n);
          if (o !== r) this.parent.set(o, r);
        }
      }
      class StructureBehavior {
        constructor(t, n, o) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.reachableStationsCache = null;
          this._sharedWaterComponents = null;
          this.lastStructureTick = null;
          this.placementsCount = 0;
          this._hasHighStartingGold = null;
          this._postSaveUpStartTick = null;
        }
        ownedLevels(t) {
          let n = 0;
          for (const o of this.player.units(t)) {
            if (o.isUnderConstruction()) {
              n += 1;
            } else {
              n += o.level();
            }
          }
          return n;
        }
        async handleStructures() {
          if (this.placementsCount > 0 && !this.game.config().isUnitDisabled(UNIT.DefensePost)) {
            if (await this.tryBuildDefensePost()) {
              return true;
            }
            if (this.defensePostNeeded()) {
              return false;
            }
          }
          if (this.isOnStructureCooldown()) {
            return false;
          }
          if (this.isInPostSaveUpBlockedPhase()) {
            return false;
          }
          const t = await this.doHandleStructures();
          if (t) {
            this.lastStructureTick = this.game.ticks();
            this.placementsCount++;
          }
          return t;
        }
        async tryBuildDefensePost() {
          if (!autoBotBuildAllowed(UNIT.DefensePost)) return false;
          const t = currentDifficulty();
          if (t === Difficulty.Easy) return false;
          if (t === Difficulty.Medium && !this.random.chance(2)) {
            return false;
          }
          const n = this.player;
          const o = n.incomingAttacks().filter((d => this.isLandAttack(d)));
          if (o.length === 0) return false;
          const r = n.troops();
          if (r <= 0) return false;
          const a = o.reduce(((d, f) => d + f.troops()), 0);
          const i = a / r;
          if (i < UNDER_ATTACK_THREAT_RATIO) return false;
          let s;
          if (t === Difficulty.Medium) {
            s = 1;
          } else {
            s = Math.ceil(i / DEFENSE_POST_RATIO_PER_POST);
          }
          const l = this.getAttackFrontTiles(o);
          if (this.countDefensePostsNearFront(l, s) >= s) {
            return false;
          }
          const c = this.cost(UNIT.DefensePost);
          if (n.gold() < c) return false;
          const u = this.sampleTilesNearFront(l, 25, UNIT.DefensePost);
          for (const d of u) {
            const f = await this.buildableFor(UNIT.DefensePost, d);
            if (f === null || f.canBuild === false) continue;
            const p = getBuildMenu();
            if (!p || typeof p.sendBuildOrUpgrade !== "function") {
              return false;
            }
            p.sendBuildOrUpgrade(f, f.canBuild);
            state.stats.builds++;
            setLastAction(tr("🛡️ Defense post"), "build");
            return true;
          }
          return false;
        }
        defensePostNeeded() {
          const t = currentDifficulty();
          if (t === Difficulty.Easy) return false;
          const n = this.player.incomingAttacks().filter((a => this.isLandAttack(a)));
          if (n.length === 0) return false;
          const o = this.player.troops();
          if (o <= 0) return false;
          const r = n.reduce(((a, i) => a + i.troops()), 0);
          return r / o >= UNDER_ATTACK_THREAT_RATIO;
        }
        isLandAttack(t) {
          if (t.hasSourceTile && t.hasSourceTile()) {
            return t.sourceTile() === null;
          }
          const n = t.attacker();
          if (!n || !(n.isPlayer && n.isPlayer())) return true;
          return this.player.sharesBorderWith(n);
        }
        getAttackFrontTiles(t) {
          const n = this.game;
          const o = this.player;
          const r = new Set(t.map((i => {
            const s = i.attacker();
            return s && s.isPlayer && s.isPlayer() ? s.smallID() : null;
          })).filter((i => i !== null)));
          if (r.size === 0) return [];
          const a = [];
          e: for (const i of o.borderTiles()) {
            for (const s of n.neighbors(i)) {
              const l = n.hasOwner(s) ? n.ownerID(s) : null;
              if (l !== null && r.has(l)) {
                a.push(i);
                continue e;
              }
            }
          }
          return a;
        }
        countDefensePostsNearFront(t, n) {
          if (t.length === 0) return 0;
          const o = this.game;
          const {borderSpacing: r} = this.spacingConstants();
          const a = (r * 1.5) ** 2;
          let i = 0;
          for (const s of this.player.units(UNIT.DefensePost)) {
            for (const l of t) {
              if (o.euclideanDistSquared(s.tile(), l) <= a) {
                i++;
                if (n !== void 0 && i >= n) return i;
                break;
              }
            }
          }
          return i;
        }
        sampleTilesNearFront(t, n, o) {
          const r = this.game;
          const a = this.player;
          if (t.length === 0) {
            return [];
          }
          const {borderSpacing: i} = this.spacingConstants();
          const s = Math.ceil(i * 1.5);
          const l = Math.ceil(i * .75);
          const c = Math.ceil(i * 1.5);
          const u = a.borderTiles();
          const d = a.smallID();
          const f = (i * 1.5) ** 2;
          const p = a.units(UNIT.DefensePost).map((y => y.tile()));
          let h;
          if (p.length > 0) {
            h = t.filter((y => !p.some((b => r.euclideanDistSquared(y, b) < f))));
            if (h.length === 0) h = t;
          } else {
            h = t;
          }
          const m = [];
          for (let y = 0; y < n * 6 && m.length < n; y++) {
            const b = this.random.randElement(h);
            const w = r.x(b);
            const v = r.y(b);
            const x = this.random.nextInt(w - s, w + s + 1);
            const T = this.random.nextInt(v - s, v + s + 1);
            if (!r.isValidCoord(x, T)) continue;
            const N = r.ref(x, T);
            if (r.ownerID(N) !== d) continue;
            const M = closestTile(r, u, N);
            const A = M[1];
            if (A < l || A > c) continue;
            m.push(N);
          }
          if (m.length > 0) return m;
          const g = [];
          for (let y = 0; y < n * 4 && g.length < n; y++) {
            const b = this.random.randElement(h);
            const w = r.x(b);
            const v = r.y(b);
            const x = this.random.nextInt(w - s, w + s + 1);
            const T = this.random.nextInt(v - s, v + s + 1);
            if (!r.isValidCoord(x, T)) continue;
            const N = r.ref(x, T);
            if (r.ownerID(N) !== d) continue;
            g.push(N);
          }
          return g;
        }
        isOnStructureCooldown() {
          if (this.lastStructureTick === null || !this.hasHighStartingGold()) {
            return false;
          }
          const t = HIGH_GOLD_STRUCTURE_COOLDOWN_TICKS[this.placementsCount] ?? 0;
          if (t === 0) {
            return false;
          }
          return this.game.ticks() - this.lastStructureTick < t;
        }
        isInPostSaveUpBlockedPhase() {
          if (this.game.config().isUnitDisabled(UNIT.MissileSilo)) {
            return false;
          }
          const t = this.getSaveUpTarget();
          if (this._postSaveUpStartTick === null) {
            if (this.player.gold() < t) {
              return false;
            }
            this._postSaveUpStartTick = this.game.ticks();
          }
          const n = this.game.ticks() - this._postSaveUpStartTick;
          return n % (TEAM_POST_SAVE_UP_PHASE_TICKS * 2) >= TEAM_POST_SAVE_UP_PHASE_TICKS;
        }
        async doHandleStructures() {
          this.reachableStationsCache = null;
          const t = this.game.config();
          const n = t.isUnitDisabled(UNIT.City);
          const o = n ? Math.max(1, Math.floor(this.player.numTilesOwned() / TILES_PER_CITY_EQUIVALENT)) : this.ownedLevels(UNIT.City);
          this._sharedWaterComponents = shimSharedWaterComponents(this.game, this.player);
          const r = this._sharedWaterComponents !== null;
          this._dominant = false;
          if (state.settings.winFixes) {
            const c = this.dominanceShare();
            const u = Number.isFinite(state.settings.factoryRailShare) ? state.settings.factoryRailShare : .75;
            this._dominant = c !== null && c > u;
            try {
              const d = this.game.ticks();
              if (d - (state._buildDomDiagTick || -999) >= 80) {
                state._buildDomDiagTick = d;
                console.log("[Build] dominance gate", {
                  share: c === null ? null : Number(c.toFixed(3)),
                  trigger: u,
                  dominant: this._dominant
                });
              }
            } catch (d) {}
          }
          state.dominant = this._dominant;
          const a = !t.isUnitDisabled(UNIT.MissileSilo);
          const i = currentDifficulty();
          if (this.placementsCount === 0 && (i === Difficulty.Hard || i === Difficulty.Impossible) && !t.isUnitDisabled(UNIT.AtomBomb) && a && !t.isUnitDisabled(UNIT.SAMLauncher) && this.hasHighStartingGold() && await this.maybeSpawnStructure(UNIT.SAMLauncher)) {
            return true;
          }
          if (!n && this.ownedLevels(UNIT.City) === 0 && this.isHighNationDensity()) {
            const c = r && !t.isUnitDisabled(UNIT.Port) ? UNIT.Port : UNIT.Factory;
            if (!t.isUnitDisabled(c) && await this.maybeSpawnStructure(c)) {
              return true;
            }
          }
          const s = [ UNIT.Port, UNIT.Factory, UNIT.SAMLauncher, UNIT.MissileSilo ];
          const l = !t.isUnitDisabled(UNIT.AtomBomb) || !t.isUnitDisabled(UNIT.HydrogenBomb) || !t.isUnitDisabled(UNIT.MIRV);
          for (const c of s) {
            if (t.isUnitDisabled(c)) {
              continue;
            }
            if (c === UNIT.Port && !r) {
              continue;
            }
            if (!l && (c === UNIT.MissileSilo || c === UNIT.SAMLauncher)) {
              continue;
            }
            if (!a && c === UNIT.SAMLauncher) {
              continue;
            }
            if (this.shouldBuildStructure(c, o, r)) {
              if (await this.maybeSpawnStructure(c)) {
                return true;
              }
            }
          }
          if (!n && await this.maybeSpawnStructure(UNIT.City)) {
            return true;
          }
          return false;
        }
        hasHighStartingGold() {
          if (this._hasHighStartingGold === null) {
            const t = this.player.__src ?? this.player;
            const n = {
              playerType: this.player.type(),
              isLobbyCreator: typeof t.isLobbyCreator === "function" ? t.isLobbyCreator() : false
            };
            this._hasHighStartingGold = this.game.config().startingGold(n) >= HIGH_STARTING_GOLD_THRESHOLD;
          }
          return this._hasHighStartingGold;
        }
        isHighNationDensity() {
          const t = this.game.numLandTiles();
          if (t <= 0) return false;
          return this.game.nations().length / t > HIGH_NATION_DENSITY_THRESHOLD;
        }
        dominanceShare() {
          if (this.player === null) return null;
          let t = false;
          try {
            t = String(this.game.config().gameConfig().gameMode) === "Team";
          } catch (a) {
            return null;
          }
          const n = typeof this.game.numTilesWithFallout === "function" ? this.game.numTilesWithFallout() : 0;
          const o = (this.game.numLandTiles() || 0) - n;
          if (o <= 0) return null;
          let r = 0;
          if (t) {
            for (const a of this.game.players()) {
              try {
                if (a.isPlayer() && this.player.isOnSameTeam(a)) {
                  r += a.numTilesOwned();
                }
              } catch (i) {}
            }
          } else {
            r = this.player.numTilesOwned();
          }
          return r / o;
        }
        shouldBuildStructure(t, n, o) {
          const r = this.game.config();
          const a = currentDifficulty();
          const i = getStructureRatios(a);
          const s = i[t];
          if (s === void 0) {
            return false;
          }
          let l = s.ratioPerCity;
          if (t === UNIT.Factory && o && !r.isUnitDisabled(UNIT.Port) && !this._dominant) {
            l *= FACTORY_COASTAL_RATIO_MULTIPLIER;
          }
          const c = this.ownedLevels(t);
          if (t === UNIT.MissileSilo && c >= MAX_MISSILE_SILOS) {
            return false;
          }
          if (t === UNIT.MissileSilo && c === 0) {
            l = FIRST_MISSILE_SILO_RATIO;
          }
          const u = Math.floor(n * l);
          return c < u;
        }
        cost(t) {
          switch (t) {
           case UNIT.Port:
            {
              const n = this.ownedLevels(UNIT.Port) + this.ownedLevels(UNIT.Factory);
              return BigInt(Math.min(1e6, Math.pow(2, n) * 125e3));
            }

           case UNIT.Factory:
            {
              const n = this.ownedLevels(UNIT.Factory) + this.ownedLevels(UNIT.Port);
              return BigInt(Math.min(1e6, Math.pow(2, n) * 125e3));
            }

           case UNIT.City:
            {
              const n = this.ownedLevels(UNIT.City);
              return BigInt(Math.min(1e6, Math.pow(2, n) * 125e3));
            }

           case UNIT.SAMLauncher:
            {
              const n = this.ownedLevels(UNIT.SAMLauncher);
              return BigInt(Math.min(3e6, (n + 1) * 15e5));
            }

           case UNIT.MissileSilo:
            return 1000000n;

           case UNIT.DefensePost:
            {
              const n = this.ownedLevels(UNIT.DefensePost);
              return BigInt(Math.min(25e4, (n + 1) * 5e4));
            }

           case UNIT.AtomBomb:
            return 750000n;

           case UNIT.HydrogenBomb:
            return 5000000n;

           case UNIT.MIRV:
            return 25000000n;

           case UNIT.Warship:
            {
              const n = this.ownedLevels(UNIT.Warship);
              return BigInt(Math.min(1e6, (n + 1) * 25e4));
            }

           default:
            return 0n;
          }
        }
        async maybeSpawnStructure(t) {
          if (!autoBotBuildAllowed(t)) return false;
          const n = this.getPerceivedCost(t);
          let o = this.player.gold();
          if (state.settings.winFixes && state.nukeReserveGold) {
            let s = 0n;
            try {
              s = BigInt(state.nukeReserveGold || 0);
            } catch (l) {
              s = 0n;
            }
            if (s >= 15000000n) {
              o = o > s ? o - s : 0n;
            }
          }
          if (o < n) {
            return false;
          }
          const r = this.player.units(t);
          if (this.getTotalStructureDensity() > UPGRADE_DENSITY_THRESHOLD && this.game.config().unitInfo(t).upgradable) {
            if (await this.maybeUpgradeStructure(r)) {
              return true;
            }
            if (r.length > 0) {
              return false;
            }
          }
          const a = await this.structureSpawnTile(t);
          if (a === null) {
            return false;
          }
          const i = getBuildMenu();
          if (!i || typeof i.sendBuildOrUpgrade !== "function") {
            return false;
          }
          i.sendBuildOrUpgrade(a, a.canBuild);
          state.stats.builds++;
          setLastAction(tr("🏗️ Build {type}", {
            type: t
          }), "build");
          return true;
        }
        getPerceivedCost(t) {
          const n = this.cost(t);
          const o = this.getSaveUpTarget();
          if (o === 0n || this.player.gold() >= o) {
            return n;
          }
          const r = this.ownedLevels(t);
          let a;
          if (t === UNIT.City) {
            a = CITY_PERCEIVED_COST_INCREASE_PER_OWNED;
          } else {
            const s = currentDifficulty();
            const l = getStructureRatios(s);
            const c = l[t];
            a = c && c.perceivedCostIncreasePerOwned !== void 0 ? c.perceivedCostIncreasePerOwned : .1;
          }
          const i = 1 + a * r;
          return BigInt(Math.ceil(Number(n) * i));
        }
        getSaveUpTarget() {
          const t = this.game.config();
          if (t.isUnitDisabled(UNIT.MissileSilo)) {
            return this.cost(UNIT.SAMLauncher);
          }
          if (this.game.config().gameConfig().gameMode === GameMode.Team) {
            return this.cost(UNIT.HydrogenBomb);
          }
          const n = !t.isUnitDisabled(UNIT.MIRV);
          const o = !t.isUnitDisabled(UNIT.HydrogenBomb);
          const r = !t.isUnitDisabled(UNIT.AtomBomb);
          if (n) {
            return this.cost(UNIT.MIRV) + this.cost(UNIT.HydrogenBomb);
          }
          if (o) {
            return this.cost(UNIT.HydrogenBomb) * 5n;
          }
          if (r) {
            return this.cost(UNIT.AtomBomb) * 20n;
          }
          return this.cost(UNIT.SAMLauncher);
        }
        async maybeUpgradeStructure(t) {
          if (this.getTotalStructureDensity() <= UPGRADE_DENSITY_THRESHOLD) {
            return false;
          }
          if (t.length === 0) {
            return false;
          }
          const n = await this.findBestStructureToUpgrade(t);
          if (n !== null) {
            const o = getBuildMenu();
            if (!o || typeof o.sendBuildOrUpgrade !== "function") {
              return false;
            }
            o.sendBuildOrUpgrade(n.bu);
            state.stats.builds++;
            setLastAction(tr("⬆️ Upgrade {type}", {
              type: n.structure.type()
            }), "build");
            return true;
          }
          return false;
        }
        getTotalStructureDensity() {
          const t = this.player.numTilesOwned();
          return t > 0 ? this.player.units(...STRUCTURES_TYPES).length / t : 0;
        }
        async findBestStructureToUpgrade(t) {
          const n = this.game;
          if (t.length === 0) {
            return null;
          }
          const o = [];
          const r = new Map;
          for (const u of t) {
            const d = await this.buildableFor(u.type(), u.tile());
            if (d !== null && d.canUpgrade !== false) {
              o.push(u);
              r.set(u.id(), d);
            }
          }
          if (o.length === 0) {
            return null;
          }
          const a = u => ({
            structure: u,
            bu: r.get(u.id())
          });
          const i = currentDifficulty();
          let s;
          switch (i) {
           case Difficulty.Easy:
            s = 70;
            break;

           case Difficulty.Medium:
            s = 40;
            break;

           case Difficulty.Hard:
            s = 25;
            break;

           case Difficulty.Impossible:
            s = 10;
            break;

           default:
            s = 10;
          }
          if (this.random.nextInt(0, 100) < s) {
            return a(this.random.randElement(o));
          }
          const l = this.player.units(UNIT.SAMLauncher);
          const c = [];
          for (const u of o) {
            let d = 0;
            for (const f of l) {
              const p = n.config().samRange(f.level());
              const h = p * p;
              const m = n.euclideanDistSquared(u.tile(), f.tile());
              if (m <= h) {
                d += 10;
                if (f.level() > 1) {
                  d += (f.level() - 1) * 7.5;
                }
              }
            }
            d += this.random.nextInt(0, 5);
            c.push({
              structure: u,
              score: d
            });
          }
          if (c.length === 0) {
            return null;
          }
          c.sort(((u, d) => d.score - u.score));
          if (c.length >= 2 && this.random.chance(2)) {
            const u = c.length >= 3 ? this.random.nextInt(1, 3) : 1;
            return a(c[u].structure);
          }
          return a(c[0].structure);
        }
        async structureSpawnTile(t) {
          let n = t === UNIT.Port ? this.randCoastalTileArray(25) : randTerritoryTileArray(this.random, this.game, this.player, 25);
          if (t === UNIT.MissileSilo && state.settings.winFixes) {
            try {
              const a = this.tilesNearFriendlySams(25);
              if (a.length > 0) n = a.concat(n);
            } catch (a) {}
          }
          if (n.length === 0) return null;
          const o = this.structureSpawnTileValue(t);
          if (o === null) return null;
          const r = n.map((a => ({
            t: a,
            v: o(a)
          })));
          r.sort(((a, i) => i.v - a.v));
          for (const {t: a} of r) {
            const i = await this.buildableFor(t, a);
            if (i !== null && i.canBuild !== false) {
              return i;
            }
          }
          return null;
        }
        async buildableFor(t, n) {
          let o;
          try {
            o = await withTimeout(this.player.buildables(n, [ t ]), WORKER_TIMEOUT_MS, null);
          } catch (r) {
            return null;
          }
          return Array.isArray(o) ? o.find((r => r.type === t)) ?? null : null;
        }
        randCoastalTileArray(t) {
          const n = this.game;
          const o = this._sharedWaterComponents;
          const r = Array.from(this.player.borderTiles()).filter((a => {
            if (!n.isShore(a)) return false;
            if (o === null) return false;
            for (const i of n.neighbors(a)) {
              if (!n.isWater(i)) continue;
              if (n.isOcean(i)) return true;
              const s = typeof n.getWaterComponent === "function" ? n.getWaterComponent(i) : null;
              if (s !== null && o.has(s)) return true;
            }
            return false;
          }));
          return Array.from(this.arraySampler(r, t));
        }
        * arraySampler(t, n) {
          if (t.length <= n) {
            yield* t;
          } else {
            const o = new Set(t);
            while (n--) {
              const r = this.random.randFromSet(o);
              o.delete(r);
              yield r;
            }
          }
        }
        structureSpawnTileValue(t) {
          switch (t) {
           case UNIT.City:
            return this.cityValue();

           case UNIT.MissileSilo:
            return this.missileSiloValue();

           case UNIT.Factory:
            return this.factoryValue();

           case UNIT.Port:
            return this.portValue();

           case UNIT.SAMLauncher:
            return this.samLauncherValue();

           default:
            throw new Error(`Value function not implemented for ${t}`);
          }
        }
        missileSiloValue() {
          const t = this.game;
          const n = this.player.borderTiles();
          const o = this.player.units(UNIT.MissileSilo);
          const {borderSpacing: r, structureSpacing: a} = this.spacingConstants();
          return i => {
            let s = 0;
            s += t.magnitude(i);
            const l = closestTile(t, n, i);
            const c = l[1];
            s += Math.min(c, r);
            const u = new Set(o.map((f => f.tile())));
            u.delete(i);
            const d = closestTwoTiles(t, u, [ i ]);
            if (d !== null) {
              const f = t.manhattanDist(d.x, i);
              s += Math.min(f, a);
            }
            if (state.settings.winFixes) {
              s += this.samCoverageBonus(i);
            }
            return s;
          };
        }
        samCoverageBonus(t) {
          const n = this.game;
          if (typeof n.nearbyUnits !== "function") return 0;
          let o;
          try {
            o = n.config();
          } catch (c) {
            return 0;
          }
          const r = o && o.maxSamRange ? Number(o.maxSamRange()) : 200;
          let a;
          try {
            a = n.nearbyUnits(t, r, UNIT.SAMLauncher);
          } catch (c) {
            return 0;
          }
          const i = this.player.smallID();
          let s = -1;
          let l = -1;
          for (const c of a || []) {
            const u = c.unit || c;
            const d = u.owner && u.owner();
            if (!d) continue;
            if (u.isUnderConstruction && u.isUnderConstruction()) continue;
            const f = d.smallID && d.smallID() === i;
            const p = !f && this.player.isFriendly(d) === true;
            if (!f && !p) continue;
            const h = u.level && Number(u.level()) || 1;
            const m = o && o.samRange ? Number(o.samRange(h)) : 0;
            if (m <= 0) continue;
            let g = c.distSquared;
            if (g == null && n.euclideanDistSquared && u.tile) {
              g = n.euclideanDistSquared(t, u.tile());
            }
            if (g == null || g > m * m) continue;
            const y = m - Math.sqrt(g);
            if (f) {
              if (y > s) s = y;
            } else if (y > l) {
              l = y;
            }
          }
          if (s >= 0) return 1e5 + s;
          if (l >= 0) return 5e4 + l;
          return 0;
        }
        tilesNearFriendlySams(t) {
          const n = this.game;
          if (typeof n.nearbyUnits !== "function" && typeof n.units !== "function") {
            return [];
          }
          const o = this.player.smallID();
          let r = [];
          try {
            r = n.units(UNIT.SAMLauncher) || [];
          } catch (d) {
            return [];
          }
          const a = [];
          const i = [];
          for (const d of r) {
            try {
              if (d.isUnderConstruction && d.isUnderConstruction()) continue;
              const f = d.owner && d.owner();
              if (!f) continue;
              if (f.smallID && f.smallID() === o) a.push(d); else if (this.player.isFriendly(f) === true) i.push(d);
            } catch (f) {}
          }
          const s = a.length > 0 ? a : i;
          if (s.length === 0) return [];
          let l;
          try {
            l = n.config();
          } catch (d) {
            return [];
          }
          const c = [];
          const u = new Set;
          for (const d of s) {
            const f = d.tile();
            const p = n.x(f);
            const h = n.y(f);
            const m = d.level && Number(d.level()) || 1;
            const g = l && l.samRange ? Number(l.samRange(m)) : 0;
            if (g <= 0) continue;
            const y = Math.floor(g);
            const b = Math.max(2, Math.floor(y / 6));
            for (let w = -y; w <= y; w += b) {
              for (let v = -y; v <= y; v += b) {
                if (w * w + v * v > g * g) continue;
                const x = p + w;
                const T = h + v;
                if (!n.isValidCoord(x, T)) continue;
                const N = n.ref(x, T);
                if (u.has(N)) continue;
                if (!n.isLand(N)) continue;
                if (n.ownerID(N) !== o) continue;
                u.add(N);
                c.push(N);
                if (c.length >= t) return c;
              }
            }
          }
          return c;
        }
        portValue() {
          const t = this.game;
          const n = this.player.units(UNIT.Port);
          return o => {
            let r = 0;
            const a = new Set(n.map((l => l.tile())));
            a.delete(o);
            const i = closestTile(t, a, o);
            const s = i[1];
            r += s;
            return r;
          };
        }
        factoryValue() {
          const t = this.game;
          const n = this.player;
          const o = this.player.borderTiles();
          const r = n.units(UNIT.Factory);
          const {borderSpacing: a, structureSpacing: i} = this.spacingConstants();
          const s = t.config().trainStationMaxRange();
          const l = s * s;
          const c = currentDifficulty();
          const u = this.shouldUseConnectivityScore(c);
          const d = u ? this.getOrBuildReachableStations() : [];
          const f = t.config().trainStationMinRange() ** 2;
          const p = new Set(n.units(UNIT.City).map((h => h.tile())));
          return h => {
            let m = 0;
            m += t.magnitude(h);
            const g = closestTile(t, o, h);
            const y = g[1];
            m += Math.min(y, a);
            const b = new Set(r.map((x => x.tile())));
            b.delete(h);
            const w = closestTwoTiles(t, b, [ h ]);
            if (w !== null) {
              const x = t.manhattanDist(w.x, h);
              m += Math.min(x, s);
            }
            const v = closestTwoTiles(t, p, [ h ]);
            if (v !== null) {
              const x = t.manhattanDist(v.x, h);
              m += Math.min(x, i);
            }
            if (!u) {
              return m;
            }
            m += this.computeConnectivityScore(h, d, f, l) * i;
            return m;
          };
        }
        shouldUseConnectivityScore(t) {
          let n;
          switch (t) {
           case Difficulty.Easy:
            n = 0;
            break;

           case Difficulty.Medium:
            n = 60;
            break;

           case Difficulty.Hard:
            n = 75;
            break;

           case Difficulty.Impossible:
            n = 100;
            break;

           default:
            n = 100;
          }
          return this.random.nextInt(0, 100) < n;
        }
        getOrBuildReachableStations() {
          if (this.reachableStationsCache === null) {
            this.reachableStationsCache = this.buildReachableStations();
          }
          return this.reachableStationsCache;
        }
        trainGoldBase(t, n) {
          const o = Math.max(0, (n || 0) - 9);
          let r;
          switch (t) {
           case "ally":
            r = 35e3;
            break;

           case "self":
            r = 1e4;
            break;

           case "team":
           case "other":
           default:
            r = 25e3;
          }
          return Math.max(5e3, r - o * 5e3);
        }
        buildReachableStations() {
          const t = this.game;
          const n = this.player;
          const o = Math.max(Number(this.trainGoldBase("ally", 0)), 1);
          const r = [];
          const a = Number(this.trainGoldBase("self", 0)) / o;
          for (const d of n.units(UNIT.City, UNIT.Port, UNIT.Factory)) {
            if (!d.hasTrainStation()) continue;
            r.push({
              tile: d.tile(),
              weight: a,
              key: d.id()
            });
          }
          for (const d of n.nearby()) {
            if (!d.isPlayer || !d.isPlayer()) continue;
            if (d.type() === PlayerType.Bot) continue;
            if (!shimCanTrade(n, d)) continue;
            const f = n.isOnSameTeam(d) ? "team" : n.isAlliedWith(d) ? "ally" : "other";
            const p = Number(this.trainGoldBase(f, 0)) / o;
            for (const h of d.units(UNIT.City, UNIT.Port, UNIT.Factory)) {
              if (!h.hasTrainStation()) continue;
              r.push({
                tile: h.tile(),
                weight: p,
                key: h.id()
              });
            }
          }
          if (r.length === 0) return [];
          let i = null;
          try {
            i = typeof t.railroadState === "function" ? t.railroadState() : null;
          } catch (d) {
            i = null;
          }
          if (i) {
            const d = this.assignRailClusters(r, i);
            if (d !== null) {
              const f = [];
              for (let p = 0; p < r.length; p++) {
                f.push({
                  tile: r[p].tile,
                  cluster: d[p],
                  weight: r[p].weight
                });
              }
              return f;
            }
          }
          const s = t.config().trainStationMaxRange();
          const l = s * s;
          const c = new StationUnionFind;
          for (const d of r) c.add(d.key);
          for (let d = 0; d < r.length; d++) {
            for (let f = d + 1; f < r.length; f++) {
              const p = t.euclideanDistSquared(r[d].tile, r[f].tile);
              if (p <= l) {
                c.union(r[d].key, r[f].key);
              }
            }
          }
          const u = [];
          for (const d of r) {
            u.push({
              tile: d.tile,
              cluster: c.find(d.key),
              weight: d.weight
            });
          }
          return u;
        }
        assignRailClusters(t, n) {
          try {
            const o = this.game;
            const r = o.width();
            const a = o.height();
            const i = r * a;
            const s = new Int32Array(i).fill(-1);
            let l = 0;
            const c = f => {
              const p = l++;
              const h = [ f ];
              s[f] = p;
              let m = 0;
              while (m < h.length) {
                const g = h[m++];
                for (const y of o.neighbors(g)) {
                  if (y >= 0 && y < i && n[y] !== 0 && s[y] === -1) {
                    s[y] = p;
                    h.push(y);
                  }
                }
              }
              return p;
            };
            const u = f => {
              if (f < 0 || f >= i) return null;
              if (n[f] !== 0) {
                if (s[f] === -1) c(f);
                return s[f];
              }
              for (const p of o.neighbors(f)) {
                if (p >= 0 && p < i && n[p] !== 0) {
                  if (s[p] === -1) c(p);
                  return s[p];
                }
              }
              return null;
            };
            const d = new Array(t.length);
            for (let f = 0; f < t.length; f++) {
              const p = u(t[f].tile);
              d[f] = p === null ? null : "rail#" + p;
            }
            return d;
          } catch (o) {
            return null;
          }
        }
        computeConnectivityScore(t, n, o, r) {
          const a = new Map;
          let i = 0;
          for (const {tile: l, cluster: c, weight: u} of n) {
            const d = this.game.euclideanDistSquared(t, l);
            if (d < o || d > r) continue;
            if (c !== null) {
              a.set(c, Math.max(a.get(c) ?? 0, u));
            } else {
              i += u;
            }
          }
          let s = i;
          for (const l of a.values()) s += l;
          return s;
        }
        cityValue() {
          const t = this.game;
          const n = this.player;
          const o = n.borderTiles();
          const r = n.units(UNIT.City);
          const {borderSpacing: a, structureSpacing: i} = this.spacingConstants();
          const s = t.config().trainStationMaxRange();
          const l = s * s;
          const c = currentDifficulty();
          const u = this.shouldUseConnectivityScore(c);
          const d = u ? this.getOrBuildReachableStations() : [];
          const f = t.config().trainStationMinRange() ** 2;
          const p = new Set(n.units(UNIT.Factory).map((h => h.tile())));
          return h => {
            let m = 0;
            m += t.magnitude(h);
            const g = closestTile(t, o, h);
            const y = g[1];
            m += Math.min(y, a);
            const b = new Set(r.map((x => x.tile())));
            b.delete(h);
            const w = closestTwoTiles(t, b, [ h ]);
            if (w !== null) {
              const x = t.manhattanDist(w.x, h);
              m += Math.min(x, i);
            }
            const v = closestTwoTiles(t, p, [ h ]);
            if (v !== null) {
              const x = t.manhattanDist(v.x, h);
              m += Math.min(x, i);
            }
            if (!u) {
              return m;
            }
            m += this.computeConnectivityScore(h, d, f, l) * i;
            return m;
          };
        }
        samLauncherValue() {
          const t = this.game;
          const n = this.player;
          const o = n.borderTiles();
          const r = n.units(UNIT.SAMLauncher);
          const {borderSpacing: a, structureSpacing: i} = this.spacingConstants();
          const s = currentDifficulty();
          const l = s === Difficulty.Hard || s === Difficulty.Impossible;
          const c = [];
          for (const h of n.units()) {
            switch (h.type()) {
             case UNIT.City:
             case UNIT.Factory:
             case UNIT.MissileSilo:
             case UNIT.Port:
              c.push({
                tile: h.tile(),
                weight: l ? h.level() : 1
              });
            }
          }
          const u = t.config().defaultSamRange();
          const d = u * u;
          const f = s !== Difficulty.Easy && this.random.nextInt(0, 100) < 25;
          let p = null;
          if (f) {
            p = new Map;
            const h = n.units(UNIT.SAMLauncher);
            for (const m of c) {
              let g = 0;
              for (const y of h) {
                const b = t.config().samRange(y.level());
                const w = t.euclideanDistSquared(m.tile, y.tile());
                if (w <= b * b) {
                  g += y.level();
                }
              }
              p.set(m.tile, g);
            }
          }
          return h => {
            let m = 0;
            m += t.magnitude(h);
            const g = closestTwoTiles(t, o, [ h ]);
            if (g !== null) {
              const w = t.manhattanDist(g.x, h);
              m += Math.min(w, a);
            }
            const y = new Set(r.map((w => w.tile())));
            y.delete(h);
            const b = closestTwoTiles(t, y, [ h ]);
            if (b !== null) {
              const w = t.manhattanDist(b.x, h);
              m += Math.min(w, i);
            }
            if (s !== Difficulty.Easy) {
              for (const w of c) {
                const v = t.euclideanDistSquared(h, w.tile);
                if (v > d) continue;
                if (f && p !== null) {
                  const x = p.get(w.tile) ?? 0;
                  const T = 1 / (1 + x);
                  m += i * w.weight * T;
                } else {
                  m += i * w.weight;
                }
              }
            }
            return m;
          };
        }
        spacingConstants() {
          const t = this.game.config().nukeMagnitudes(UNIT.AtomBomb).outer;
          return {
            borderSpacing: t,
            structureSpacing: t * 2
          };
        }
      }
      "use strict";
      const AttackStructures = new Set([ UNIT.City, UNIT.DefensePost, UNIT.SAMLauncher, UNIT.MissileSilo, UNIT.Port, UNIT.Factory ]);
      const HumansVsNations = "Humans Vs Nations";
      const BOAT_PROBE_CANDIDATES = 4;
      class AttackBehavior {
        constructor(t, n, o, r, a, i, s, l) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.triggerRatio = r;
          this.reserveRatio = a;
          this.expandRatio = i;
          this.allianceBehavior = s;
          this.emojiBehavior = l;
          this.botAttackTroopsSent = 0;
        }
        async maybeAttack() {
          if (this.player === null || this.allianceBehavior === void 0) {
            throw new Error("not initialized");
          }
          const t = Array.from(this.player.borderTiles()).flatMap((f => this.game.neighbors(f))).filter((f => this.game.isLand(f) && this.game.ownerID(f) !== this.player?.smallID()));
          const n = this.player.nearby();
          const o = new Set(t.map((f => this.game.playerBySmallID(this.game.ownerID(f)))).filter((f => f != null && f.isPlayer())));
          for (const f of n) {
            if (f.isPlayer()) o.add(f);
          }
          const r = [ ...o ].sort(((f, p) => f.troops() - p.troops()));
          const a = r.filter((f => this.player?.isFriendly(f) === true));
          const i = r.filter((f => this.player?.isFriendly(f) === false));
          const s = t.some((f => !this.game.hasOwner(f) && !this.game.hasFallout(f))) || n.some((f => !f.isPlayer()));
          const l = state.settings.features || {};
          const c = !!l.expand;
          const u = !!l.boat;
          const d = !!l.alliance;
          if (c && state.settings.winFixes) {
            const f = r.filter((p => {
              try {
                return p.isPlayer() && p.isDisconnected && p.isDisconnected();
              } catch (h) {
                return false;
              }
            }));
            if (f.length > 0) {
              f.sort(((p, h) => p.troops() - h.troops()));
              console.log("[Takeover] disconnected neighbour → grabbing land:", f[0].name?.() ?? f[0].smallID?.());
              if (await this.sendAttack(f[0])) return;
            }
          }
          if (c && state.settings.winFixes && i.some((f => f.isPlayer() && f.type() === PlayerType.Bot))) {
            if (await this.attackBots()) return;
          }
          if (state.settings.winFixes) {
            await this.maybeOpportunisticBoat();
          }
          if (state.settings.winFixes && state.settings.features.donate) {
            const f = performance.now();
            if (f - (state.lastDonateMs || 0) > (state.settings.donateThrottleMs || 3e3)) {
              if (this.donateTroops()) state.lastDonateMs = f;
            }
          }
          if (d && state.settings.winFixes) {
            this.allianceBehavior.reachOutToFarNations();
          }
          if (c && s) {
            if (await this.sendAttack(this.game.terraNullius())) return;
          }
          if (i.length === 0) {
            if (u && this.random.chance(5)) {
              await this.attackWithRandomBoat();
            }
          } else {
            if (u && this.random.chance(10)) {
              await this.attackWithRandomBoat(i);
              return;
            }
            if (d) {
              this.allianceBehavior.maybeSendAllianceRequests(i);
            }
          }
          if (c) {
            await this.attackBestTarget(a, i);
          }
        }
        async attackWithRandomBoat(t = []) {
          if (this.player === null) throw new Error("not initialized");
          if (!(state.settings.features && state.settings.features.boat)) {
            return;
          }
          if (this.game.config().isUnitDisabled(UNIT.TransportShip)) {
            return;
          }
          if (state.settings.winFixes) {
            const s = this.game.numLandTiles() || 1;
            if (this.player.numTilesOwned() / s > .25) {
              return;
            }
          }
          if (this.player.unitCount(UNIT.TransportShip) >= this.game.config().boatMaxNumber()) {
            return;
          }
          const n = Array.from(this.player.borderTiles()).filter((s => this.game.isShore(s)));
          if (n.length === 0) {
            return;
          }
          const o = this.random.randElement(n);
          let r = await this.findRandomBoatTarget(o, t, true);
          if (r === null) {
            r = await this.findRandomBoatTarget(o, t, false);
            if (r === null) {
              return;
            }
          }
          const a = discoverCtors(getEventBus());
          const i = state.settings.winFixes ? Math.max(this.player.troops() * (state.settings.boatProbeFrac || .01), state.settings.boatProbeMinTroops || 8e3) : this.player.troops() / 5;
          if (a.boat && emitIntent(a.boat, r, i)) {
            state.stats.attacks++;
            setLastAction(tr("⛵ Random boat"), "naval");
          }
          return;
        }
        async maybeOpportunisticBoat() {
          if (this.player === null) return false;
          if (!(state.settings.features && state.settings.features.boat)) return false;
          if (this.game.config().isUnitDisabled(UNIT.TransportShip)) return false;
          const t = Math.min(this.game.config().boatMaxNumber(), state.settings.maxConcurrentBoats || 3);
          const n = this.player.unitCount(UNIT.TransportShip);
          const o = performance.now();
          const r = state.settings.oppBoatThrottleMs || 1200;
          const a = o - (state.lastOppBoatMs || 0);
          const i = n >= t;
          const s = a < r;
          const l = this.game.config().maxTroops(this.player);
          const c = l > 0 ? this.player.troops() / l : 1;
          const u = state.settings.boatSurplusFill || .75;
          const d = Array.from(this.player.borderTiles()).filter((A => this.game.isShore(A)));
          try {
            if (o - (state._boatDiagAt || 0) > 5e3) {
              state._boatDiagAt = o;
              console.log("[Boat] diag:", {
                reason: i ? "capped" : s ? "throttled" : d.length === 0 ? "no-shore" : "ok",
                ships: n,
                boatCap: t,
                shoreTiles: d.length,
                fill: Number(c.toFixed(2)),
                islandFill: state.settings.boatIslandFill || .35,
                maxShips: this.game.config().boatMaxNumber()
              });
            }
          } catch (A) {}
          if (i) return false;
          if (s) return false;
          if (d.length === 0) return false;
          const f = state.beachhead;
          const p = state.settings.mirvBoatWindowTicks || 150;
          if (f && f.tile != null && c >= u && this.game.ticks() - (f.at || 0) < p) {
            if (this.landingSucceeded(f.tile)) {
              const A = await withTimeout(this.player.bestTransportShipSpawn(f.tile), WORKER_TIMEOUT_MS, false);
              if (A !== false) {
                const E = state.settings.boatSurgeFrac || .25;
                const D = this.player.troops() * E;
                if (this.emitBoat(f.tile, D, "⚓ Surge landing")) {
                  state.lastOppBoatMs = o;
                  f.at = this.game.ticks();
                  f.surged = true;
                  return true;
                }
              }
            }
          }
          this._inflightBoatTargets = [];
          for (const A of this.player.units(UNIT.TransportShip)) {
            try {
              const E = A.targetTile ? A.targetTile() : null;
              if (E != null) {
                this._inflightBoatTargets.push({
                  x: this.game.x(E),
                  y: this.game.y(E)
                });
              }
            } catch (E) {}
          }
          let h = null;
          let m = false;
          let g = false;
          let y = false;
          if (h === null) {
            const A = await this.findDisconnectedBoatTarget();
            if (A !== null && !this.boatTargetTaken(A)) {
              h = A;
              g = true;
              m = true;
              console.log("[Boat] heading to a DISCONNECTED neighbour's land");
            }
          }
          const b = h === null ? this.scanNearbyTargets(d) : [];
          const w = state.settings.islandProbeMax || 4;
          for (let A = 0; A < b.length && A < w; A++) {
            if (this.boatTargetTaken(b[A].tile)) continue;
            const E = await withTimeout(this.player.bestTransportShipSpawn(b[A].tile), WORKER_TIMEOUT_MS, false);
            if (E !== false) {
              h = b[A].tile;
              g = b[A].owned;
              y = b[A].fallout;
              m = true;
              break;
            }
          }
          if (h === null) {
            const A = this.pickMirvCraterTarget();
            if (A !== null && !this.boatTargetTaken(A)) {
              const E = await withTimeout(this.player.bestTransportShipSpawn(A), WORKER_TIMEOUT_MS, false);
              if (E !== false) {
                h = A;
                g = true;
              }
            }
          }
          if (h === null) {
            const A = this.random.randElement(d);
            const E = await this.findRandomBoatTarget(A, [], true);
            if (E !== null && !this.boatTargetTaken(E)) {
              h = E;
              g = this.game.hasOwner(E);
            }
          }
          if (h === null) {
            const A = this.random.randElement(d);
            const E = await this.findRandomBoatTarget(A, [], false);
            if (E !== null && !this.boatTargetTaken(E)) {
              h = E;
              g = this.game.hasOwner(E);
            }
          }
          if (h === null) {
            const A = await this.findDistantBoatTarget();
            if (A !== null) {
              h = A;
              g = true;
              m = true;
            }
          }
          if (h === null) {
            console.log("[Boat] no reachable target", {
              scanCandidates: b.length,
              shoreSamples: Math.min(state.settings.islandScanSamples || 6, d.length),
              distant: state._distantDiag || null
            });
            return false;
          }
          const v = m ? state.settings.boatIslandFill || .35 : u;
          if (c < v) {
            console.log("[Boat] fill too low to launch", {
              fill: Number(c.toFixed(2)),
              need: v,
              contested: !m
            });
            return false;
          }
          const x = state.settings.boatProbeFrac || .01;
          const T = state.settings.boatProbeMinTroops || 8e3;
          const N = Math.max(this.player.troops() * x, T);
          const M = y ? "☢️ Nuked-coast grab" : m ? g ? "🏝️ Weak-coast grab" : "🏝️ Island grab" : "🛟 Probe landing";
          if (this.emitBoat(h, N, M)) {
            console.log("[Boat] LAUNCHED", M, Math.round(N), "troops");
            state.lastOppBoatMs = o;
            state.beachhead = {
              tile: h,
              at: this.game.ticks(),
              surged: false
            };
            return true;
          }
          console.log("[Boat] emitBoat REFUSED", M, {
            dstX: this.game.x(h),
            dstY: this.game.y(h),
            owner: this.game.hasOwner(h) ? this.game.ownerID(h) : "TN"
          });
          return false;
        }
        boatTargetTaken(t) {
          if (t == null || !Array.isArray(this._inflightBoatTargets)) return false;
          if (this._inflightBoatTargets.length === 0) return false;
          const n = state.settings.boatSpreadRadius || 30;
          let o;
          let r;
          try {
            o = this.game.x(t);
            r = this.game.y(t);
          } catch (a) {
            return false;
          }
          for (const a of this._inflightBoatTargets) {
            if (Math.abs(a.x - o) + Math.abs(a.y - r) <= n) return true;
          }
          return false;
        }
        scanNearbyTargets(t) {
          const n = state.settings.islandScanRadius || 40;
          const o = state.settings.islandScanStep || 2;
          const r = state.settings.islandScanSamples || 6;
          const a = state.settings.boatWeakTroopFrac ?? .6;
          const i = this.player.smallID();
          const s = this.player.troops();
          const l = new Map;
          const c = new Set;
          const u = [];
          const d = Math.min(r, t.length);
          for (let f = 0; f < d; f++) {
            const p = this.random.randElement(t);
            const h = this.game.x(p);
            const m = this.game.y(p);
            for (let g = -n; g <= n; g += o) {
              for (let y = -n; y <= n; y += o) {
                const b = h + g;
                const w = m + y;
                if (!this.game.isValidCoord(b, w)) continue;
                const v = this.game.ref(b, w);
                if (c.has(v)) continue;
                if (!this.game.isLand(v)) continue;
                const x = this.game.hasFallout(v);
                const T = this.game.ownerID(v);
                if (T === i) continue;
                const N = this.game.hasOwner(v);
                if (N) {
                  let M = l.get(T);
                  if (M === void 0) {
                    const A = this.game.playerBySmallID(T);
                    M = !!(A && A.isPlayer() && this.player.isFriendly(A) === false && A.troops() < s * a);
                    l.set(T, M);
                  }
                  if (!M) continue;
                } else if (!x) {
                  if (this.game.neighbors(v).some((M => this.game.ownerID(M) === i))) {
                    continue;
                  }
                }
                c.add(v);
                u.push({
                  tile: v,
                  dist: g * g + y * y,
                  owned: N,
                  fallout: x
                });
              }
            }
          }
          u.sort(((f, p) => f.dist - p.dist));
          return u;
        }
        async findDisconnectedBoatTarget() {
          if (this.player === null) return null;
          const t = this.player.smallID();
          const n = this.getPlayerCenter(this.player);
          const o = [];
          for (const a of this.game.players()) {
            try {
              if (!a.isPlayer || !a.isPlayer()) continue;
              if (!a.isAlive()) continue;
              if (a.smallID() === t) continue;
              if (!(a.isDisconnected && a.isDisconnected())) continue;
              const i = a.nameLocation ? a.nameLocation() : null;
              if (!i || i.x == null) continue;
              if (!this.game.isValidCoord(i.x, i.y)) continue;
              const s = this.game.ref(i.x, i.y);
              if (s == null) continue;
              let l = 0;
              if (n && n.x != null) {
                const c = i.x - n.x;
                const u = i.y - n.y;
                l = c * c + u * u;
              }
              o.push({
                tile: s,
                dist: l
              });
            } catch (i) {}
          }
          o.sort(((a, i) => a.dist - i.dist));
          const r = state.settings.distantBoatProbeMax || 12;
          for (let a = 0; a < o.length && a < r; a++) {
            if (this.boatTargetTaken(o[a].tile)) continue;
            const i = await withTimeout(this.player.bestTransportShipSpawn(o[a].tile), WORKER_TIMEOUT_MS, false);
            if (i !== false) return o[a].tile;
          }
          return null;
        }
        async findDistantBoatTarget() {
          if (this.player === null) return null;
          const t = this.player.smallID();
          const n = this.getPlayerCenter(this.player);
          const o = [];
          for (const l of this.game.players()) {
            try {
              if (!l.isPlayer || !l.isPlayer()) continue;
              if (!l.isAlive()) continue;
              if (l.smallID() === t) continue;
              if (this.player.isFriendly(l) === true) continue;
              const c = l.nameLocation ? l.nameLocation() : null;
              if (!c || c.x == null) continue;
              if (!this.game.isValidCoord(c.x, c.y)) continue;
              const u = this.game.ref(c.x, c.y);
              if (u == null) continue;
              let d = 0;
              if (n && n.x != null) {
                const f = c.x - n.x;
                const p = c.y - n.y;
                d = f * f + p * p;
              }
              o.push({
                tile: u,
                dist: d
              });
            } catch (c) {}
          }
          o.sort(((l, c) => l.dist - c.dist));
          const r = state.settings.distantBoatProbeMax || 12;
          const a = "__probe_timeout__";
          let i = 0;
          let s = 0;
          for (let l = 0; l < o.length && l < r; l++) {
            if (this.boatTargetTaken(o[l].tile)) continue;
            i++;
            const c = await withTimeout(this.player.bestTransportShipSpawn(o[l].tile), WORKER_TIMEOUT_MS, a);
            if (c === a) {
              s++;
              continue;
            }
            if (c !== false) {
              state._distantDiag = {
                enemies: o.length,
                probed: i,
                probeCap: r,
                timedOut: s,
                found: true
              };
              return o[l].tile;
            }
          }
          state._distantDiag = {
            enemies: o.length,
            probed: i,
            probeCap: r,
            timedOut: s,
            found: false
          };
          return null;
        }
        emitBoat(t, n, o) {
          if (!(state.settings.features && state.settings.features.boat)) {
            return false;
          }
          const r = discoverCtors(getEventBus());
          if (r.boat && emitIntent(r.boat, t, n)) {
            state.stats.attacks++;
            setLastAction(tr(o), "naval");
            return true;
          }
          return false;
        }
        landingSucceeded(t) {
          const n = this.game.x(t);
          const o = this.game.y(t);
          const r = this.player.smallID();
          const a = 6;
          for (let i = -a; i <= a; i += 2) {
            for (let s = -a; s <= a; s += 2) {
              const l = n + i;
              const c = o + s;
              if (!this.game.isValidCoord(l, c)) continue;
              const u = this.game.ref(l, c);
              if (this.game.isLand(u) && this.game.ownerID(u) === r) return true;
            }
          }
          return false;
        }
        pickMirvCraterTarget() {
          const t = Array.isArray(state.recentMirvHits) ? state.recentMirvHits : [];
          const n = state.settings.mirvBoatWindowTicks || 150;
          const o = this.game.ticks();
          state.recentMirvHits = t.filter((a => o - (a.at || 0) < n));
          const r = this.player.smallID();
          for (let a = state.recentMirvHits.length - 1; a >= 0; a--) {
            const i = state.recentMirvHits[a];
            if (i.tile == null) continue;
            if (this.game.ownerID(i.tile) === r) continue;
            return i.tile;
          }
          return null;
        }
        async findRandomBoatTarget(t, n, o = false) {
          if (this.player === null) throw new Error("not initialized");
          const r = this.game.x(t);
          const a = this.game.y(t);
          const i = new Set;
          const s = [];
          for (let l = 0; l < 500; l++) {
            const c = this.random.nextInt(r - 150, r + 150);
            const u = this.random.nextInt(a - 150, a + 150);
            if (!this.game.isValidCoord(c, u)) {
              continue;
            }
            const d = this.game.ref(c, u);
            if (!this.game.isLand(d)) {
              continue;
            }
            const f = this.game.owner(d);
            if (f.isPlayer() && f.smallID() === this.player.smallID()) {
              continue;
            }
            if (f.isPlayer() && i.has(f.id())) {
              continue;
            }
            if (f.isPlayer() && n.some((h => h.smallID() === f.smallID()))) {
              continue;
            }
            if (this.isFFA() && f.isPlayer() && f.troops() > this.player.troops()) {
              continue;
            }
            let p;
            if (o) {
              p = !f.isPlayer() || f.type() === PlayerType.Bot;
            } else {
              p = !f.isPlayer() || !f.isFriendly(this.player);
            }
            if (!p) {
              continue;
            }
            s.push({
              tile: d,
              owner: f
            });
            if (s.length >= BOAT_PROBE_CANDIDATES) {
              break;
            }
          }
          for (const l of s) {
            if (l.owner.isPlayer() && i.has(l.owner.id())) {
              continue;
            }
            const c = await withTimeout(this.player.bestTransportShipSpawn(l.tile), WORKER_TIMEOUT_MS, false);
            if (c === false) {
              if (l.owner.isPlayer()) {
                i.add(l.owner.id());
              }
              continue;
            }
            return l.tile;
          }
          return null;
        }
        async attackBestTarget(t, n) {
          if (this.hasNeighboringBotWithStructures()) {
            if (await this.attackBots()) return;
          }
          if (!this.hasReserveRatioTroops()) return;
          if (!this.hasTriggerRatioTroops() && !this.random.chance(10)) return;
          const o = this.getAttackStrategies(t, n);
          for (const r of o) {
            if (await r()) return;
          }
        }
        getAttackStrategies(t, n) {
          const o = currentDifficulty();
          const r = async () => {
            const b = this.findIncomingAttackPlayer();
            if (b) {
              return await this.sendAttack(b, true);
            }
            return false;
          };
          const a = async () => await this.attackBots();
          const i = async () => await this.assistAllies();
          const s = async () => {
            const b = this.findTraitor(n);
            if (b) {
              return await this.sendAttack(b);
            }
            return false;
          };
          const l = async () => {
            const b = n.find((w => w.isDisconnected() && (!this.isFFA() || w.troops() < this.player.troops() * 3)));
            if (b) {
              return await this.sendAttack(b);
            }
            return false;
          };
          const c = async () => await this.maybeBetrayAndAttack(t, n);
          const u = async () => {
            if (this.isBorderingNukedTerritory()) {
              return await this.sendAttack(this.game.terraNullius());
            }
            return false;
          };
          const d = async () => {
            const b = this.findVictim(n);
            if (b) {
              return await this.sendAttack(b);
            }
            return false;
          };
          const f = async () => {
            for (const b of this.player.allRelationsSorted()) {
              if (b.relation !== Relation.Hostile) continue;
              const w = b.player;
              if (this.player.isFriendly(w)) continue;
              if (this.isFFA() && w.troops() > this.player.troops() * 3) continue;
              return await this.sendAttack(w);
            }
            return false;
          };
          const p = async () => {
            const b = this.findVeryWeakEnemy(n);
            if (b) {
              return await this.sendAttack(b);
            }
            return false;
          };
          const h = async () => {
            if (n.length > 0) {
              const b = n[0];
              if (!this.isFFA() || b.troops() < this.player.troops()) {
                return await this.sendAttack(b);
              }
            }
            return false;
          };
          const m = async () => {
            if (n.length === 0) {
              const b = await this.findNearestIslandEnemy();
              if (b) {
                return await this.sendAttack(b);
              }
            }
            return false;
          };
          const g = async () => await this.donateTroops();
          let y;
          switch (o) {
           case Difficulty.Easy:
            y = [ u, a, r, i, c, f, h ];
            break;

           case Difficulty.Medium:
            y = [ a, u, r, i, c, f, l, s, h, m, g ];
            break;

           case Difficulty.Hard:
            y = [ a, r, i, c, u, s, l, f, p, d, h, m, g ];
            break;

           case Difficulty.Impossible:
            y = [ r, a, p, i, s, l, c, d, u, f, h, m, g ];
            break;

           default:
            throw new Error("unreachable difficulty: " + o);
          }
          if (state.settings.winFixes) {
            const b = y.indexOf(u);
            if (b !== -1) {
              y.splice(b, 1);
              const w = y.indexOf(h);
              if (w !== -1) y.splice(w + 1, 0, u); else y.push(u);
            }
          }
          return y;
        }
        hasNeighboringBotWithStructures() {
          return this.player.nearby().some((t => t.isPlayer() && t.type() === PlayerType.Bot && !this.player.isFriendly(t) && t.units().some((n => AttackStructures.has(n.type())))));
        }
        hasReserveRatioTroops() {
          const t = this.game.config().maxTroops(this.player);
          const n = this.player.troops() / t;
          return n >= this.effectiveReserveRatio();
        }
        effectiveReserveRatio() {
          let t = this.reserveRatio;
          try {
            if (state.settings.winFixes) {
              const n = this.game.numLandTiles() || 1;
              const o = this.player.numTilesOwned() / n;
              const r = state.settings.sizeReserveScale ?? 0;
              const a = state.settings.sizeReserveCap ?? .6;
              t = Math.max(t, Math.min(a, o * r));
            }
          } catch (n) {}
          return t;
        }
        hasTriggerRatioTroops() {
          const t = this.game.config().maxTroops(this.player);
          const n = this.player.troops() / t;
          return n >= this.triggerRatio;
        }
        findIncomingAttackPlayer() {
          let t = this.player.incomingAttacks().filter((r => !this.player.isFriendly(r.attacker())));
          if (this.player.type() !== PlayerType.Bot) {
            t = t.filter((r => r.attacker().type() !== PlayerType.Bot));
          }
          let n = 0;
          let o;
          for (const r of t) {
            if (r.troops() <= n) continue;
            n = r.troops();
            o = r.attacker();
          }
          if (o !== void 0) {
            return o;
          }
          return null;
        }
        async attackBots() {
          const t = this.player.nearby().filter((i => i.isPlayer() && this.player.isFriendly(i) === false && i.type() === PlayerType.Bot));
          if (t.length === 0) {
            return false;
          }
          this.botAttackTroopsSent = 0;
          const n = i => i.troops() / i.numTilesOwned();
          const o = i => i.units().some((s => AttackStructures.has(s.type())));
          const r = t.slice().sort(((i, s) => {
            const l = o(i);
            const c = o(s);
            if (l !== c) {
              return l ? -1 : 1;
            }
            return n(i) - n(s);
          }));
          const a = r.slice(0, this.getBotAttackMaxParallelism());
          for (const i of a) {
            await this.sendAttack(i);
          }
          return this.botAttackTroopsSent > 0;
        }
        getBotAttackMaxParallelism() {
          const t = currentDifficulty();
          switch (t) {
           case Difficulty.Easy:
            return 1;

           case Difficulty.Medium:
            return this.random.chance(2) ? 1 : 2;

           case Difficulty.Hard:
            return 3;

           case Difficulty.Impossible:
            {
              return 100;
            }

           default:
            throw new Error("unreachable difficulty: " + t);
          }
        }
        async assistAllies() {
          if (this.emojiBehavior === void 0) throw new Error("not initialized");
          if (this.game.config().disableAlliances()) return false;
          for (const t of this.player.allies()) {
            if (t.targets().length === 0) continue;
            if (this.player.relation(t) < Relation.Friendly) {
              this.emojiBehavior.sendEmoji(t, EMOJI_ASSIST_RELATION_TOO_LOW);
              continue;
            }
            for (const n of t.targets()) {
              if (n.isPlayer() && n.smallID() === this.player.smallID()) {
                this.emojiBehavior.sendEmoji(t, EMOJI_ASSIST_TARGET_ME);
                continue;
              }
              if (this.player.isFriendly(n)) {
                this.emojiBehavior.sendEmoji(t, EMOJI_ASSIST_TARGET_ALLY);
                continue;
              }
              if (!await this.sendAttack(n)) continue;
              this.player.updateRelation(t, -20);
              this.emojiBehavior.sendEmoji(t, EMOJI_ASSIST_ACCEPT);
              return true;
            }
          }
          return false;
        }
        findTraitor(t) {
          if (this.game.config().disableAlliances()) return null;
          return t.find((n => n.isTraitor() && (!this.isFFA() || n.troops() < this.player.troops() * 1.2))) ?? null;
        }
        async maybeBetrayAndAttack(t, n) {
          if (this.allianceBehavior === void 0) throw new Error("not initialized");
          if (this.game.config().disableAlliances()) return false;
          if (t.length > 0) {
            for (const o of t) {
              if (this.allianceBehavior.maybeBetray(o, t.length + n.length)) {
                return await this.sendAttack(o, true);
              }
            }
          }
          return false;
        }
        isBorderingNukedTerritory() {
          if (this.game.config().isUnitDisabled(UNIT.MissileSilo)) {
            return false;
          }
          for (const t of this.player.borderTiles()) {
            for (const n of this.game.neighbors(t)) {
              if (this.game.isLand(n) && !this.game.hasOwner(n) && this.game.hasFallout(n)) {
                return true;
              }
            }
          }
          return false;
        }
        findVictim(t) {
          return t.find((n => {
            if (this.isFFA() && n.troops() > this.player.troops() * 1.2) {
              return false;
            }
            const o = n.incomingAttacks().reduce(((r, a) => r + a.troops()), 0);
            return o > n.troops() * .5;
          })) ?? null;
        }
        findVeryWeakEnemy(t) {
          const n = t.filter((o => {
            const r = this.game.config().maxTroops(o);
            return o.troops() < r * .15 && (!this.isFFA() || o.troops() < this.player.troops() * 1.2);
          }));
          return n.length > 0 ? n[0] : null;
        }
        async findNearestIslandEnemy() {
          if (this.game.config().isUnitDisabled(UNIT.TransportShip)) {
            return null;
          }
          if (this.player.unitCount(UNIT.TransportShip) >= this.game.config().boatMaxNumber()) {
            return null;
          }
          const t = Array.from(this.player.borderTiles()).some((s => this.game.isShore(s)));
          if (!t) return null;
          const n = this.game.players().filter((s => {
            if (s.smallID() === this.player.smallID()) return false;
            if (this.player.isFriendly(s)) return false;
            return !this.isFFA() || s.troops() < this.player.troops();
          }));
          if (n.length === 0) return null;
          const o = this.getPlayerCenter(this.player);
          const r = n.map((s => {
            const l = this.getPlayerCenter(s);
            if (!o || o.x == null || !l || l.x == null) {
              return {
                player: s,
                distance: Infinity
              };
            }
            const c = this.game.ref(o.x, o.y);
            const u = this.game.ref(l.x, l.y);
            const d = this.game.manhattanDist(c, u);
            return {
              player: s,
              distance: d
            };
          })).sort(((s, l) => s.distance - l.distance));
          const a = Array.from(this.player.borderTiles()).filter((s => this.game.isShore(s)));
          const i = [];
          for (const s of r) {
            await this.game.ensureBorderTiles(s.player);
            const l = closestTwoTiles(this.game, a, Array.from(s.player.borderTiles()).filter((u => this.game.isShore(u))));
            if (l === null) continue;
            const c = await withTimeout(this.player.bestTransportShipSpawn(l.y), WORKER_TIMEOUT_MS, false);
            if (c !== false) {
              i.push(s.player);
              if (i.length >= 2) break;
            }
          }
          if (i.length === 0) return null;
          if (i.length >= 2 && this.random.chance(3)) {
            return i[1];
          }
          return i[0];
        }
        isFFA() {
          return this.game.config().gameConfig().gameMode === GameMode.FFA;
        }
        getPlayerCenter(t) {
          if (t.largestClusterBoundingBox) {
            return boundingBoxCenter(t.largestClusterBoundingBox);
          }
          const n = t.borderTiles();
          if (n && n.size > 0) {
            return calculateBoundingBoxCenter(this.game, n);
          }
          return t.nameLocation();
        }
        async attackRandomTarget() {
          if (!this.hasTriggerRatioTroops()) return;
          const t = this.findIncomingAttackPlayer();
          if (t) {
            if (await this.sendAttack(t, true)) return;
          }
          const n = this.getNeighborTraitorToAttack();
          if (n !== null) {
            if (this.random.chance(3)) {
              if (await this.sendAttack(n)) return;
            }
          }
          const o = this.player.nearby();
          for (const r of this.random.shuffleArray(o)) {
            if (!r.isPlayer()) continue;
            if (this.player.isFriendly(r)) continue;
            if (r.type() === PlayerType.Nation || r.type() === PlayerType.Human) {
              if (this.random.chance(2)) {
                continue;
              }
            }
            if (await this.sendAttack(r)) return;
          }
        }
        getNeighborTraitorToAttack() {
          if (this.game.config().disableAlliances()) return null;
          const t = this.player.nearby().filter((n => n.isPlayer() && this.player.isFriendly(n) === false && n.isTraitor()));
          return t.length > 0 ? this.random.randElement(t) : null;
        }
        async forceSendAttack(t) {
          const n = discoverCtors(getEventBus());
          const o = this.player.troops() / 2;
          const r = t.isPlayer() ? t.id() : null;
          if (n.attack && emitIntent(n.attack, r, o)) {
            state.stats.attacks++;
            setLastAction(tr("⚔️ Attack"), "combat");
          }
        }
        async sendAttack(t, n = false) {
          if (!n && !this.shouldAttack(t)) return false;
          if (t.isPlayer()) {
            if (this.player.sharesBorderWith(t)) {
              return this.sendLandAttack(t);
            } else {
              return await this.sendBoatAttack(t);
            }
          } else {
            if (this.hasLandBorderWithTerraNullius()) {
              return this.sendLandAttack(t);
            } else {
              return await this.sendBoatAttackToNearbyTerraNullius();
            }
          }
        }
        hasLandBorderWithTerraNullius() {
          for (const t of this.player.borderTiles()) {
            for (const n of this.game.neighbors(t)) {
              if (this.game.isLand(n) && !this.game.hasOwner(n)) {
                return true;
              }
            }
          }
          return false;
        }
        async sendBoatAttackToNearbyTerraNullius() {
          if (!(state.settings.features && state.settings.features.boat)) return false;
          if (this.game.config().isUnitDisabled(UNIT.TransportShip)) return false;
          if (this.player.unitCount(UNIT.TransportShip) >= this.game.config().boatMaxNumber()) return false;
          const t = [ [ 0, -1 ], [ 0, 1 ], [ -1, 0 ], [ 1, 0 ] ];
          const n = Array.from(this.player.borderTiles()).filter((r => this.game.isShore(r)));
          const o = [];
          e: for (let r = 0; r < n.length; r += 10) {
            const a = n[r];
            const i = this.game.x(a);
            const s = this.game.y(a);
            for (const [l, c] of t) {
              const u = i + l;
              const d = s + c;
              if (!this.game.isValidCoord(u, d)) continue;
              if (!this.game.isWater(this.game.ref(u, d))) continue;
              const f = i + l * 5;
              const p = s + c * 5;
              if (!this.game.isValidCoord(f, p)) continue;
              const h = this.game.ref(f, p);
              if (!this.game.isLand(h)) continue;
              if (this.game.hasOwner(h)) continue;
              if (!state.settings.winFixes && this.game.hasFallout(h)) continue;
              o.push(h);
              if (o.length >= BOAT_PROBE_CANDIDATES) break e;
            }
          }
          for (const r of o) {
            const a = await withTimeout(this.player.bestTransportShipSpawn(r), WORKER_TIMEOUT_MS, false);
            if (a === false) continue;
            const i = state.settings.winFixes ? Math.max(this.player.troops() * (state.settings.boatProbeFrac || .01), state.settings.boatProbeMinTroops || 8e3) : this.player.troops() / 5;
            if (i < 1) return false;
            const s = discoverCtors(getEventBus());
            if (s.boat && emitIntent(s.boat, r, i)) {
              state.stats.attacks++;
              setLastAction(tr("⛵ Boat (land grab)"), "naval");
            }
            return true;
          }
          return false;
        }
        shouldAttack(t) {
          if (t.isPlayer() === false || t.type() !== PlayerType.Human || t.isTraitor() || this.player.type() === PlayerType.Bot || this.game.config().gameConfig().playerTeams === HumansVsNations) {
            return true;
          }
          const n = currentDifficulty();
          if (n === Difficulty.Easy && this.random.nextInt(0, 4) !== 0) {
            return false;
          }
          if (n === Difficulty.Medium && this.random.chance(4)) {
            return false;
          }
          return true;
        }
        sendLandAttack(t) {
          const n = this.game.config().maxTroops(this.player);
          const o = t.isPlayer() && t.type() === PlayerType.Bot && t.units().some((u => AttackStructures.has(u.type())));
          const r = t.isPlayer() && !o;
          const a = r ? this.effectiveReserveRatio() : this.expandRatio;
          const i = n * a;
          let s;
          if (t.isPlayer() && t.type() === PlayerType.Bot && this.player.type() !== PlayerType.Bot) {
            s = this.calculateBotAttackTroops(t, this.player.troops() - i - this.botAttackTroopsSent);
          } else {
            s = this.player.troops() - i;
          }
          if (s < 1) {
            return false;
          }
          if (t.isPlayer() && this.player.type() === PlayerType.Nation) {
            if (this.emojiBehavior === void 0) throw new Error("not initialized");
            this.emojiBehavior.maybeSendAttackEmoji(t);
          }
          const l = discoverCtors(getEventBus());
          const c = t.isPlayer() ? t.id() : null;
          if (l.attack && emitIntent(l.attack, c, s)) {
            state.stats.attacks++;
            setLastAction(tr("⚔️ Attack"), "combat");
          }
          return true;
        }
        async sendBoatAttack(t) {
          if (!(state.settings.features && state.settings.features.boat)) {
            return false;
          }
          if (this.game.config().isUnitDisabled(UNIT.TransportShip)) {
            return false;
          }
          await this.game.ensureBorderTiles(t);
          const n = closestTwoTiles(this.game, Array.from(this.player.borderTiles()).filter((i => this.game.isShore(i))), Array.from(t.borderTiles()).filter((i => this.game.isShore(i))));
          if (n === null) {
            return false;
          }
          const o = await withTimeout(this.player.bestTransportShipSpawn(n.y), WORKER_TIMEOUT_MS, false);
          if (o === false) {
            return false;
          }
          let r;
          if (state.settings.winFixes) {
            r = Math.max(this.player.troops() * (state.settings.boatProbeFrac || .01), state.settings.boatProbeMinTroops || 8e3);
          } else if (t.type() === PlayerType.Bot) {
            r = this.calculateBotAttackTroops(t, this.player.troops() / 5);
          } else {
            r = this.player.troops() / 5;
          }
          if (r < 1) {
            return false;
          }
          if (t.isPlayer() && this.player.type() === PlayerType.Nation) {
            if (this.emojiBehavior === void 0) throw new Error("not initialized");
            this.emojiBehavior.maybeSendAttackEmoji(t);
          }
          const a = discoverCtors(getEventBus());
          if (a.boat && emitIntent(a.boat, n.y, r)) {
            state.stats.attacks++;
            setLastAction(tr("⛵ Boat attack"), "naval");
          }
          return true;
        }
        calculateBotAttackTroops(t, n) {
          const o = currentDifficulty();
          if (o === Difficulty.Easy) {
            this.botAttackTroopsSent += n;
            return n;
          }
          let r = t.troops() * 4;
          if (r > n) {
            if (n < t.troops() * 2) {
              r = 0;
            } else {
              r = n;
            }
          }
          this.botAttackTroopsSent += r;
          return r;
        }
        donateTroops() {
          try {
            const m = performance.now();
            if (m - (state._donDiagAt || 0) > 5e3) {
              state._donDiagAt = m;
              const g = this.game.config();
              const y = this.game.players().filter((b => this.player.isOnSameTeam(b) && b.smallID() !== this.player.smallID() && b.isAlive()));
              console.log("[Donate] diag: " + JSON.stringify({
                featureOn: !!state.settings.features.donate,
                winFixes: !!state.settings.winFixes,
                replicatedDifficulty: String(currentDifficulty()),
                gameType: String(g.gameConfig().gameType),
                gameMode: String(g.gameConfig().gameMode),
                donateAllowedByLobby: g.donateTroops(),
                aliveTeammates: y.length,
                myTroops: Math.round(this.player.troops())
              }));
            }
          } catch (m) {}
          if (!state.settings.features.donate) return false;
          if (this.game.config().gameConfig().gameMode !== GameMode.Team) {
            return false;
          }
          if (this.game.config().donateTroops() === false) {
            return false;
          }
          if (this.game.getWinner()) {
            console.log("[Donate] skip: game already has a winner");
            return false;
          }
          const t = currentDifficulty();
          if (!state.settings.winFixes) {
            switch (t) {
             case Difficulty.Easy:
              return false;

             case Difficulty.Medium:
              if (!this.random.chance(4)) {
                return false;
              }
              break;

             case Difficulty.Hard:
              if (!this.random.chance(2)) {
                return false;
              }
              break;

             case Difficulty.Impossible:
              break;

             default:
              throw new Error("unreachable difficulty: " + t);
            }
          }
          const n = this.game.players().filter((m => this.player.isOnSameTeam(m))).filter((m => state.settings.winFixes ? true : m.incomingAttacks().length > 0 || m.outgoingAttacks().length > 0));
          if (n.length === 0) {
            console.log("[Donate] skip: no same-team players found");
            return false;
          }
          const o = n.map((m => {
            const g = this.game.config().maxTroops(m);
            const y = m.troops() / Math.max(g, 1);
            return {
              teammate: m,
              troopPercentage: y
            };
          })).sort(((m, g) => m.troopPercentage - g.troopPercentage));
          const r = state.settings.winFixes ? state.settings.donateNeedThreshold ?? .8 : 1;
          const a = o.filter((m => m.teammate.isAlive() && m.teammate.smallID() !== this.player.smallID() && m.troopPercentage < r)).map((m => {
            let g = false;
            try {
              g = m.teammate.incomingAttacks().length > 0 || m.teammate.outgoingAttacks().length > 0;
            } catch (y) {}
            return {
              entry: m,
              frontline: g
            };
          }));
          a.sort(((m, g) => {
            if (m.frontline !== g.frontline) return m.frontline ? -1 : 1;
            return m.entry.troopPercentage - g.entry.troopPercentage;
          }));
          let i = null;
          if (a.length > 0) {
            i = a[0].entry.teammate;
            console.log("[Donate] picked ally at " + Math.round(a[0].entry.troopPercentage * 100) + "% " + (a[0].frontline ? "(FRONTLINE — in combat)" : "(rear)"));
          }
          if (i === null) {
            console.log("[Donate] skip: no teammate below the need threshold (all allies healthy)");
            return false;
          }
          const s = this.game.config().maxTroops(this.player);
          const l = state.settings.winFixes ? Math.max(this.reserveRatio, state.settings.donateKeepFrac || .45) : this.reserveRatio;
          const c = s * l;
          const u = this.player.troops() - c;
          const d = state.settings.winFixes ? s * (state.settings.donateMinExcessFrac || .05) : 1;
          if (u < d) {
            console.log("[Donate] skip: not enough above the keep line", {
              troops: Math.round(this.player.troops()),
              keep: Math.round(c),
              needExcess: Math.round(d)
            });
            return false;
          }
          const f = state.settings.donateMinDonatePct || .2;
          const p = this.player.troops() * f;
          if (u < p) {
            console.log("[Donate] skip: donation too small (minDonatePct)", {
              available: Math.round(u),
              minChunk: Math.round(p),
              pct: Math.round(f * 100) + "%"
            });
            return false;
          }
          const h = discoverCtors(getEventBus());
          if (h.donateTroops && emitIntent(h.donateTroops, i.__src ?? i, u)) {
            console.log("[Donate] SENT", Math.round(u), "→", i.name?.() ?? i.smallID?.());
            setLastAction(tr("🎁 Donate troops"), "combat");
          } else {
            console.log("[Donate] emit failed", {
              ctor: !!h.donateTroops
            });
          }
          return true;
        }
      }
      "use strict";
      const MAX_NATION_SILO_UPGRADE_LEVEL = 5;
      const HIGH_DENSITY_NUKE_THRESHOLD = 1 / 75;
      const MIN_LEVEL_SUM_FOR_HIGH_DENSITY_NUKE = 5;
      const NUKE_STRUCTURES_TYPES = [ UNIT.City, UNIT.DefensePost, UNIT.SAMLauncher, UNIT.MissileSilo, UNIT.Port, UNIT.Factory ];
      function euclDistFN(e, t, n) {
        const o = t * t;
        if (!n) {
          return (r, a) => r.euclideanDistSquared(e, a) <= o;
        } else {
          return (r, a) => {
            const i = r.x(e) - .5 - r.x(a);
            const s = r.y(e) - .5 - r.y(a);
            return i * i + s * s <= o;
          };
        }
      }
      class NukeCubicBezierCurve {
        constructor(t, n, o, r) {
          this.p0 = t;
          this.p1 = n;
          this.p2 = o;
          this.p3 = r;
        }
        getPointAt(t) {
          const n = 1 - t;
          const o = n * n;
          const r = o * n;
          const a = t * t;
          const i = a * t;
          const s = r * this.p0.x + 3 * o * t * this.p1.x + 3 * n * a * this.p2.x + i * this.p3.x;
          const l = r * this.p0.y + 3 * o * t * this.p1.y + 3 * n * a * this.p2.y + i * this.p3.y;
          return {
            x: s,
            y: l
          };
        }
      }
      class NukeDistanceBasedBezierCurve extends NukeCubicBezierCurve {
        constructor(t, n, o, r, a) {
          super(t, n, o, r);
          this.totalDistance = 0;
          this.cachedPoints = [];
          this.currentIndex = 0;
          this.computeAllPoints(a, .002);
        }
        getAllPoints() {
          return this.cachedPoints;
        }
        increment(t) {
          this.totalDistance += t;
          while (this.currentIndex < this.cachedPoints.length - 1 && this.getDistanceUpToIndex(this.currentIndex + 1) < this.totalDistance) {
            this.currentIndex++;
          }
          if (this.currentIndex >= this.cachedPoints.length - 1) {
            return null;
          }
          return this.cachedPoints[this.currentIndex];
        }
        getCurrentIndex() {
          return this.currentIndex;
        }
        computeAllPoints(t, n) {
          this.cachedPoints = [];
          this.totalDistance = 0;
          this.currentIndex = 0;
          let o = 0;
          let r = this.getPointAt(o);
          this.cachedPoints.push(r);
          let a = 0;
          while (o < 1) {
            o = Math.min(o + n, 1);
            const s = this.getPointAt(o);
            const l = s.x - r.x;
            const c = s.y - r.y;
            const u = Math.sqrt(l * l + c * c);
            a += u;
            if (a >= t) {
              this.cachedPoints.push(s);
              a = 0;
            }
            r = s;
          }
          const i = this.getPointAt(1);
          if (this.cachedPoints.length === 0 || i.x !== this.cachedPoints[this.cachedPoints.length - 1].x || i.y !== this.cachedPoints[this.cachedPoints.length - 1].y) {
            this.cachedPoints.push(i);
          }
        }
        getDistanceUpToIndex(t) {
          let n = 0;
          for (let o = 1; o <= t; o++) {
            const r = this.cachedPoints[o - 1];
            const a = this.cachedPoints[o];
            const i = a.x - r.x;
            const s = a.y - r.y;
            n += Math.sqrt(i * i + s * s);
          }
          return n;
        }
      }
      const PARABOLA_MIN_HEIGHT = 50;
      class NukeParabolaUniversalPathFinder {
        constructor(t, n) {
          this.gameMap = t;
          this.options = n;
          this.curve = null;
          this.lastTo = null;
        }
        createCurve(t, n) {
          const o = this.options?.increment ?? 3;
          const r = this.options?.distanceBasedHeight ?? true;
          const a = this.options?.directionUp ?? true;
          const i = {
            x: this.gameMap.x(t),
            y: this.gameMap.y(t)
          };
          const s = {
            x: this.gameMap.x(n),
            y: this.gameMap.y(n)
          };
          const l = s.x - i.x;
          const c = s.y - i.y;
          const u = Math.sqrt(l * l + c * c);
          const d = r ? Math.max(u / 3, PARABOLA_MIN_HEIGHT) : 0;
          const f = a ? -1 : 1;
          const p = this.gameMap.height();
          const h = {
            x: i.x + l / 4,
            y: within(i.y + c / 4 + f * d, 0, p - 1)
          };
          const m = {
            x: i.x + l * 3 / 4,
            y: within(i.y + c * 3 / 4 + f * d, 0, p - 1)
          };
          return new NukeDistanceBasedBezierCurve(i, h, m, s, o);
        }
        findPath(t, n) {
          if (Array.isArray(t)) {
            throw new Error("ParabolaUniversalPathFinder does not support multiple start points");
          }
          const o = this.createCurve(t, n);
          return o.getAllPoints().map((r => this.gameMap.ref(Math.floor(r.x), Math.floor(r.y))));
        }
        next(t, n, o) {
          if (this.lastTo !== n) {
            this.curve = this.createCurve(t, n);
            this.lastTo = n;
          }
          const r = this.curve.increment(o ?? 1);
          if (!r) {
            return {
              status: "Complete",
              node: n
            };
          }
          const a = this.gameMap.ref(Math.floor(r.x), Math.floor(r.y));
          return {
            status: "Next",
            node: a
          };
        }
        invalidate() {
          this.curve = null;
          this.lastTo = null;
        }
        currentIndex() {
          return this.curve?.getCurrentIndex() ?? 0;
        }
      }
      const UniversalPathFinding = {
        Parabola(e, t) {
          return new NukeParabolaUniversalPathFinder(e, t);
        }
      };
      class NukeBehavior {
        constructor(t, n, o, r, a) {
          this.random = t;
          this.game = n;
          this.player = o;
          this.attackBehavior = r;
          this.emojiBehavior = a;
          this.recentlySentNukes = [];
          this.atomBombsLaunched = 0;
          this.atomBombPerceivedCost = null;
          this.hydrogenBombPerceivedCost = null;
          this.hydrogenBombsLaunched = 0;
          this.isHydroNation = this.random.chance(3);
          this._costCacheTick = -1;
          this._costCache = new Map;
        }
        async maybeSendNuke() {
          if (state.settings.winFixes && state.nukeReserveGold) {
            let y = 0n;
            try {
              y = BigInt(state.nukeReserveGold || 0);
            } catch (b) {
              y = 0n;
            }
            if (y >= 15000000n) return;
          }
          const t = this.player.units(UNIT.MissileSilo);
          const n = this.game.config();
          if (t.length === 0 || n.isUnitDisabled(UNIT.MissileSilo) || n.isUnitDisabled(UNIT.AtomBomb) && n.isUnitDisabled(UNIT.HydrogenBomb)) {
            return;
          }
          const o = this.findBestNukeTarget();
          if (o === null) {
            return;
          }
          if (o.type() === PlayerType.Bot || this.player.isOnSameTeam(o) || this.attackBehavior.shouldAttack(o) === false) {
            return;
          }
          const r = await this.getPerceivedNukeCost(UNIT.HydrogenBomb);
          const a = await this.getPerceivedNukeCost(UNIT.AtomBomb);
          let i;
          if (!this.game.config().isUnitDisabled(UNIT.HydrogenBomb) && this.player.gold() >= r) {
            i = UNIT.HydrogenBomb;
          } else if (!this.game.config().isUnitDisabled(UNIT.AtomBomb) && (!this.isHydroNation || this.isUnderHeavyAttack()) && this.player.gold() >= a) {
            i = UNIT.AtomBomb;
          } else {
            return;
          }
          const s = this.game.config().nukeMagnitudes(i).outer;
          const l = o.units(...NUKE_STRUCTURES_TYPES);
          const c = l.map((y => y.tile()));
          const u = currentDifficulty();
          const d = u === Difficulty.Impossible ? 30 : 10;
          await withTimeout(this.game.ensureBorderTiles(o), WORKER_TIMEOUT_MS, null);
          const f = randTerritoryTileArray(this.random, this.game, o, d);
          const p = f.concat(c);
          let h = null;
          let m = -1;
          this.removeOldNukeEvents();
          const g = [];
          e: for (const y of new Set(p)) {
            if (y === null) continue;
            const b = boundingBoxTiles(this.game, y, s).concat(boundingBoxTiles(this.game, y, Math.floor(s / 2)));
            for (const x of b) {
              if (!this.isValidNukeTile(x, o)) {
                continue e;
              }
            }
            const w = this.nukeSpawn(i, y);
            if (w === false) continue;
            if (this.game.config().gameConfig().gameMode === GameMode.Team && u !== Difficulty.Easy && this.isTeammateAlreadyNukingThisSpot(y, i)) {
              continue;
            }
            if ((u === Difficulty.Hard || u === Difficulty.Impossible) && this.isTrajectoryInterceptableBySam(w, y)) {
              continue;
            }
            const v = this.nukeTileScore(y, t, l, i);
            g.push({
              tile: y,
              value: v
            });
          }
          g.sort(((y, b) => b.value - y.value));
          for (const y of g) {
            if (!(y.value > m)) break;
            const b = await this.probeCanBuildNuke(y.tile, i);
            if (!b) continue;
            h = y.tile;
            m = y.value;
            break;
          }
          if (h !== null && (m > 0 || u !== Difficulty.Impossible)) {
            await this.sendNuke(h, i, o);
          } else if (u === Difficulty.Impossible) {
            await this.maybeDestroyEnemySam(o);
          }
        }
        findBestNukeTarget() {
          const t = currentDifficulty();
          if ((t === Difficulty.Hard || t === Difficulty.Impossible) && this.game.players().length === 2) {
            const l = this.game.players().find((c => c.smallID() !== this.player.smallID()));
            if (l) {
              return l;
            }
          }
          const n = this.attackBehavior.findIncomingAttackPlayer();
          if (n) {
            return n;
          }
          if (t === Difficulty.Impossible && this.isRichestNation() && this.random.chance(2)) {
            const l = this.findHighDensityTarget();
            if (l !== null) {
              return l;
            }
          }
          const o = currentDifficulty();
          const r = this.game.config().gameConfig().gameMode;
          if (o === Difficulty.Impossible && r === GameMode.FFA) {
            const l = this.game.numLandTiles() - this.game.numTilesWithFallout();
            if (l > 0) {
              const c = this.game.players().slice().sort(((d, f) => f.numTilesOwned() - d.numTilesOwned()));
              const u = c[0];
              if (u && u.smallID() !== this.player.smallID() && !this.player.isFriendly(u)) {
                const d = u.numTilesOwned() / l;
                if (d > .5) {
                  return u;
                }
              }
            }
          }
          for (const l of this.player.allies()) {
            if (l.targets().length === 0) continue;
            if (this.player.relation(l) < Relation.Friendly) continue;
            for (const c of l.targets()) {
              if (c.smallID() === this.player.smallID()) continue;
              if (this.player.isFriendly(c)) continue;
              return c;
            }
          }
          const a = this.game.config().maxTroops(this.player);
          for (const l of this.player.allRelationsSorted()) {
            if (l.relation !== Relation.Hostile) continue;
            const c = l.player;
            if (this.player.isFriendly(c)) continue;
            const u = this.game.config().maxTroops(c);
            if (a >= u * 2) continue;
            return c;
          }
          const i = this.findFFACrownTarget();
          if (i) {
            return i;
          }
          const s = this.findStrongestTeamTarget();
          if (s) {
            return s;
          }
          return null;
        }
        isRichestNation() {
          const t = this.player.gold();
          for (const n of this.game.players()) {
            if (n.smallID() === this.player.smallID()) continue;
            if (n.type() !== PlayerType.Nation) continue;
            if (n.gold() > t) return false;
          }
          return true;
        }
        findHighDensityTarget() {
          let t = null;
          let n = HIGH_DENSITY_NUKE_THRESHOLD;
          for (const o of this.game.players()) {
            if (o.smallID() === this.player.smallID()) continue;
            if (o.type() === PlayerType.Bot) continue;
            if (this.player.isFriendly(o)) continue;
            const r = o.numTilesOwned();
            if (r === 0) continue;
            const a = o.units(...NUKE_STRUCTURES_TYPES);
            let i = 0;
            for (const l of a) i += l.level();
            if (i < MIN_LEVEL_SUM_FOR_HIGH_DENSITY_NUKE) continue;
            const s = i / r;
            if (s > n) {
              n = s;
              t = o;
            }
          }
          return t;
        }
        findFFACrownTarget() {
          const t = currentDifficulty();
          const n = this.game.config().gameConfig().gameMode;
          if (n !== GameMode.FFA) {
            return null;
          }
          if (this.game.players().length <= 1) {
            return null;
          }
          const o = this.game.players().slice().sort(((c, u) => u.numTilesOwned() - c.numTilesOwned()));
          const r = o[0];
          if (t === Difficulty.Impossible && r.smallID() === this.player.smallID() && o.length >= 2) {
            const c = o[1];
            if (!this.player.isFriendly(c)) {
              return c;
            }
          }
          if (r.smallID() === this.player.smallID() || this.player.isFriendly(r)) {
            return null;
          }
          const a = this.game.numLandTiles() - this.game.numTilesWithFallout();
          if (a <= 0) {
            return null;
          }
          const i = r.numTilesOwned() / a;
          const s = this.player.numTilesOwned() / a;
          let l;
          switch (t) {
           case Difficulty.Easy:
            l = .4;
            break;

           case Difficulty.Medium:
            l = .3;
            break;

           case Difficulty.Hard:
            l = .2;
            break;

           case Difficulty.Impossible:
            l = .1;
            break;

           default:
            l = .1;
          }
          if (i - s > l) {
            return r;
          }
          return null;
        }
        findStrongestTeamTarget() {
          if (this.game.config().gameConfig().gameMode !== GameMode.Team) {
            return null;
          }
          if (this.game.players().length <= 1) {
            return null;
          }
          const t = new Map;
          const n = new Map;
          for (const s of this.game.players()) {
            const l = s.team();
            if (l === null) continue;
            t.set(l, (t.get(l) ?? 0) + s.numTilesOwned());
            let c = n.get(l);
            if (!c) {
              c = [];
              n.set(l, c);
            }
            c.push(s);
          }
          const o = Array.from(t.entries()).sort(((s, l) => l[1] - s[1]));
          if (o.length === 0) {
            return null;
          }
          let r = o[0][0];
          if (r === this.player.team()) {
            if (o.length > 1) {
              r = o[1][0];
            } else {
              return null;
            }
          }
          const a = n.get(r);
          const i = a.filter((s => !this.player.isFriendly(s)));
          if (i.length === 0) {
            return null;
          }
          if (this.random.chance(2)) {
            return i.reduce(((s, l) => this.game.config().maxTroops(s) > this.game.config().maxTroops(l) ? s : l));
          } else {
            return this.random.randElement(i);
          }
        }
        async getPerceivedNukeCost(t) {
          if (this.game.players().length === 2) {
            return await this.cost(t);
          }
          if (this.game.config().isUnitDisabled(UNIT.MIRV)) {
            return await this.cost(t);
          }
          if (this.game.config().gameConfig().gameMode === GameMode.Team && this.player.gold() > await this.cost(UNIT.HydrogenBomb)) {
            return await this.cost(t);
          }
          if (this.player.gold() > await this.cost(UNIT.MIRV) + await this.cost(UNIT.HydrogenBomb)) {
            return await this.cost(t);
          }
          const n = currentDifficulty();
          if ((n === Difficulty.Hard || n === Difficulty.Impossible) && this.isUnderHeavyAttack()) {
            return await this.cost(t);
          }
          if (t === UNIT.AtomBomb) {
            if (this.atomBombPerceivedCost === null) {
              this.atomBombPerceivedCost = await this.cost(UNIT.AtomBomb);
            }
            return this.atomBombPerceivedCost;
          } else {
            if (this.hydrogenBombPerceivedCost === null) {
              this.hydrogenBombPerceivedCost = await this.cost(UNIT.HydrogenBomb);
            }
            return this.hydrogenBombPerceivedCost;
          }
        }
        isUnderHeavyAttack() {
          const t = this.player.incomingAttacks();
          let n = 0;
          for (const r of t) {
            n += r.troops();
          }
          const o = this.player.troops();
          return n >= o;
        }
        removeOldNukeEvents() {
          const t = 600;
          const n = this.game.ticks();
          while (this.recentlySentNukes.length > 0 && this.recentlySentNukes[0][0] + t < n) {
            this.recentlySentNukes.shift();
          }
        }
        isTeammateAlreadyNukingThisSpot(t, n) {
          const o = this.game.config().nukeMagnitudes(n).inner;
          const r = this.game.units(UNIT.AtomBomb, UNIT.HydrogenBomb);
          for (const a of r) {
            const i = a.owner();
            if (i && i.smallID && i.smallID() === this.player.smallID() || !this.player.isFriendly(i)) {
              continue;
            }
            const s = a.targetTile();
            if (!s) continue;
            const l = this.game.config().nukeMagnitudes(a.type()).inner;
            const c = this.game.euclideanDistSquared(t, s);
            const u = o + l;
            const d = u * u;
            if (c <= d) {
              return true;
            }
          }
          return false;
        }
        isTrajectoryInterceptableBySam(t, n, o) {
          const r = this.game.config().defaultNukeSpeed();
          const a = UniversalPathFinding.Parabola(this.game, {
            increment: r,
            distanceBasedHeight: true,
            directionUp: true
          });
          const i = a.findPath(t, n) ?? [];
          if (i.length === 0) {
            return false;
          }
          const s = this.game.config().defaultNukeTargetableRange() ** 2;
          let l = -1;
          let c = -1;
          for (let u = 0; u < i.length; u++) {
            const d = i[u];
            if (l === -1) {
              if (this.game.euclideanDistSquared(d, t) > s) {
                if (this.game.euclideanDistSquared(d, n) < s) {
                  break;
                } else {
                  l = u;
                }
              }
            } else if (this.game.euclideanDistSquared(d, n) < s) {
              c = u;
              break;
            }
          }
          for (let u = 0; u < i.length; u++) {
            if (l !== -1 && c !== -1 && u === l) {
              u = c - 1;
              continue;
            }
            const d = i[u];
            const f = this.game.nearbyUnits(d, this.game.config().maxSamRange(), UNIT.SAMLauncher);
            for (const p of f) {
              const h = p.unit.owner();
              if (h && h.smallID && h.smallID() === this.player.smallID() || this.player.isFriendly(h)) {
                continue;
              }
              if (o?.has(p.unit.id())) {
                continue;
              }
              const m = this.game.config().samRange(p.unit.level()) ** 2;
              if (p.distSquared <= m) {
                return true;
              }
            }
          }
          return false;
        }
        isValidNukeTile(t, n) {
          const o = currentDifficulty();
          const r = this.game.owner(t);
          if (r && r.isPlayer && r.isPlayer() && r.smallID() === n.smallID()) {
            return true;
          }
          if ((o === Difficulty.Hard || o === Difficulty.Impossible) && (!(r && r.isPlayer && r.isPlayer()) || this.game.config().gameConfig().gameMode === GameMode.Team && r.isPlayer() && !this.player.isFriendly(r))) {
            return true;
          }
          return false;
        }
        nukeTileScore(t, n, o, r) {
          const a = this.game.config().nukeMagnitudes(r);
          const i = euclDistFN(t, a.outer, false);
          let s = o.filter((g => i(this.game, g.tile()))).map((g => {
            const y = g.level();
            switch (g.type()) {
             case UNIT.City:
              return 25e3 * y;

             case UNIT.DefensePost:
              return 5e3 * y;

             case UNIT.MissileSilo:
              return 5e4 * y;

             case UNIT.Port:
              return 15e3 * y;

             case UNIT.Factory:
              return 15e3 * y;

             default:
              return 0;
            }
          })).reduce(((g, y) => g + y), 0);
          const l = currentDifficulty();
          if (l === Difficulty.Medium) {
            const g = euclDistFN(t, 50, false);
            const y = o.some((b => b.type() === UNIT.SAMLauncher && g(this.game, b.tile())));
            if (y) return -1;
          }
          if (l === Difficulty.Impossible && r === UNIT.HydrogenBomb) {
            const g = this.game.config().nukeMagnitudes(UNIT.HydrogenBomb);
            const y = this.game.nearbyUnits(t, g.outer, UNIT.SAMLauncher);
            for (const b of y) {
              const w = b.unit.level();
              if (w >= 5) continue;
              const v = this.game.config().samRange(w);
              const x = Math.sqrt(this.game.euclideanDistSquared(t, b.unit.tile()));
              if (x > v) {
                s += 1e5 * w;
              }
            }
          }
          const c = n.map((g => g.tile()));
          const u = closestTwoTiles(this.game, c, [ t ]);
          if (u === null) throw new Error("Missing result");
          const d = u.x;
          const f = this.game.euclideanDistSquared(t, d);
          const p = Math.sqrt(f);
          const h = p * 30;
          const m = s;
          s = Math.max(m * .2, s - h);
          s -= this.recentlySentNukes.filter((([g, y, b]) => {
            const w = this.game.config().nukeMagnitudes(b).inner;
            const v = this.game.euclideanDistSquared(t, y);
            return v <= w * w;
          })).map((g => 1e6)).reduce(((g, y) => g + y), 0);
          return s;
        }
        async sendNuke(t, n, o, r = 0) {
          const a = this.game.ticks();
          let i;
          try {
            i = await withTimeout(this.player.buildables(t, [ n ]), WORKER_TIMEOUT_MS, null);
          } catch (c) {
            return;
          }
          const s = Array.isArray(i) ? i.find((c => c.type === n)) : null;
          if (s === null || s === void 0) return;
          if (!(s.canBuild !== false && this.player.gold() >= s.cost)) return;
          const l = getBuildMenu();
          if (!l || typeof l.sendBuildOrUpgrade !== "function") return;
          l.sendBuildOrUpgrade(s, t);
          this.recentlySentNukes.push([ a, t, n ]);
          if (n === UNIT.AtomBomb) {
            this.atomBombsLaunched++;
            if (this.atomBombPerceivedCost === null) {
              this.atomBombPerceivedCost = await this.cost(UNIT.AtomBomb);
            }
            this.atomBombPerceivedCost = this.atomBombPerceivedCost * 150n / 100n;
          } else if (n === UNIT.HydrogenBomb) {
            this.hydrogenBombsLaunched++;
            if (this.hydrogenBombPerceivedCost === null) {
              this.hydrogenBombPerceivedCost = await this.cost(UNIT.HydrogenBomb);
            }
            this.hydrogenBombPerceivedCost = this.hydrogenBombPerceivedCost * 125n / 100n;
          }
          state.stats.nukes++;
          setLastAction(tr("☢️ Launch") + " " + n, "nuke");
          this.emojiBehavior.maybeSendEmoji(o, EMOJI_NUKE);
        }
        async maybeDestroyEnemySam(t) {
          if (this.game.config().isUnitDisabled(UNIT.AtomBomb)) {
            return;
          }
          const n = this.player.units(UNIT.AtomBomb);
          if (n.length > 0) {
            return;
          }
          const o = await this.cost(UNIT.AtomBomb);
          const r = t.units(UNIT.SAMLauncher);
          if (r.length === 0) {
            return;
          }
          const a = this.player.units(UNIT.MissileSilo).filter((c => !c.isUnderConstruction()));
          if (a.length === 0) {
            return;
          }
          const i = r.slice().sort(((c, u) => c.level() - u.level()));
          let s = false;
          let l = null;
          for (const c of i) {
            const u = c.tile();
            const d = this.findEnemySamsCoveringTile(u);
            const f = new Set(d.map((B => B.id())));
            const p = d.reduce(((B, C) => B + C.level()), 0);
            const h = p + 1;
            const m = this.game.config().defaultNukeSpeed();
            const g = [];
            for (const B of a) {
              const C = B.level() - B.missileTimerQueue().length;
              if (C <= 0) {
                continue;
              }
              const F = this.isTrajectoryInterceptableBySam(B.tile(), u, f);
              const H = UniversalPathFinding.Parabola(this.game, {
                increment: m,
                distanceBasedHeight: true,
                directionUp: true
              });
              const X = H.findPath(B.tile(), u) ?? [];
              if (X.length === 0) continue;
              g.push({
                silo: B,
                slots: C,
                flightTicks: X.length,
                interceptable: F
              });
            }
            g.sort(((B, C) => this.game.manhattanDist(B.silo.tile(), u) - this.game.manhattanDist(C.silo.tile(), u)));
            const y = [];
            for (const B of g) {
              for (let C = 0; C < B.slots; C++) {
                y.push({
                  flightTicks: B.flightTicks,
                  interceptable: B.interceptable
                });
              }
            }
            const b = this.game.config().SAMCooldown();
            const w = Math.floor(b / 2);
            const v = Math.floor(h / 5);
            const x = h + v;
            const T = [];
            for (let B = 0; B < y.length; B++) {
              if (!y[B].interceptable) {
                T.push({
                  index: B,
                  flightTicks: y[B].flightTicks
                });
              }
            }
            if (T.length < x) {
              l ??= {
                targetTile: u,
                coveringSamIds: f,
                totalBombs: x
              };
              s = true;
              continue;
            }
            const N = [ ...T ].sort(((B, C) => B.flightTicks - C.flightTicks));
            let M = 0;
            let A = 0;
            for (let B = 0; B < N.length; B++) {
              let C = B;
              while (C < N.length && N[C].flightTicks - N[B].flightTicks <= w) {
                C++;
              }
              if (C - B > A) {
                A = C - B;
                M = B;
              }
            }
            if (A < x) {
              l ??= {
                targetTile: u,
                coveringSamIds: f,
                totalBombs: x
              };
              s = true;
              continue;
            }
            const E = N.slice(M, M + A);
            const D = [ ...E ].sort(((B, C) => B.index - C.index));
            const O = D.slice(0, x);
            const $ = new Set(O.map((B => B.index)));
            const K = O[O.length - 1].index;
            const q = K + 1;
            const j = Math.min(...O.map((B => B.flightTicks)));
            const V = Math.max(1, Math.floor(w / x));
            let G = 0;
            const k = [];
            for (let B = 0; B < q; B++) {
              if ($.has(B)) {
                const C = j + G * V;
                k.push(Math.max(0, C - y[B].flightTicks));
                G++;
              } else {
                k.push(0);
              }
            }
            const I = o * BigInt(q);
            if (this.player.gold() < I) {
              continue;
            }
            for (let B = 0; B < q; B++) {
              await this.sendNuke(u, UNIT.AtomBomb, t, k[B]);
            }
            return;
          }
          if (s && l !== null) {
            await this.maybeUpgradeHelpfulSilo(l);
          }
        }
        findEnemySamsCoveringTile(t) {
          const n = this.game.nearbyUnits(t, this.game.config().maxSamRange(), UNIT.SAMLauncher);
          const o = [];
          for (const r of n) {
            const a = r.unit.owner();
            if (a && a.smallID && a.smallID() === this.player.smallID() || this.player.isFriendly(a)) {
              continue;
            }
            const i = this.game.config().samRange(r.unit.level());
            if (r.distSquared <= i * i) {
              o.push(r.unit);
            }
          }
          return o;
        }
        async maybeUpgradeHelpfulSilo(t) {
          const n = this.player.units(UNIT.MissileSilo);
          if (n.length === 0) return;
          const o = [];
          for (const l of n) {
            if (!this.isTrajectoryInterceptableBySam(l.tile(), t.targetTile, t.coveringSamIds)) {
              o.push(l);
            }
          }
          if (o.length === 0) return;
          const r = o.length * MAX_NATION_SILO_UPGRADE_LEVEL;
          if (r < t.totalBombs) return;
          const a = this.player.units(UNIT.SAMLauncher);
          let i = null;
          let s = -1;
          for (const l of o) {
            if (l.level() >= MAX_NATION_SILO_UPGRADE_LEVEL) continue;
            let c = 0;
            for (const u of a) {
              const d = this.game.config().samRange(u.level());
              const f = this.game.euclideanDistSquared(l.tile(), u.tile());
              if (f <= d * d) {
                c += u.level();
              }
            }
            if (c > s) {
              s = c;
              i = l;
            }
          }
          if (i !== null) {
            let l;
            try {
              l = await withTimeout(this.player.buildables(i.tile(), [ UNIT.MissileSilo ]), WORKER_TIMEOUT_MS, null);
            } catch (u) {
              return;
            }
            const c = Array.isArray(l) ? l.find((u => u.type === UNIT.MissileSilo)) : null;
            if (c === null || c === void 0) return;
            if (c.canUpgrade !== false) {
              const u = getBuildMenu();
              if (!u || typeof u.sendBuildOrUpgrade !== "function") {
                return;
              }
              u.sendBuildOrUpgrade(c);
              state.stats.builds++;
              setLastAction(tr("☢️ Upgrade silo"), "build");
            }
          }
        }
        async cost(t) {
          const n = this.game.ticks();
          if (this._costCacheTick !== n) {
            this._costCacheTick = n;
            this._costCache = new Map;
          }
          if (this._costCache.has(t)) return this._costCache.get(t);
          const o = this.player.borderTiles();
          const r = o && o.size > 0 ? o.values().next().value : null;
          if (r === null || r === void 0) return 0n;
          let a;
          try {
            a = await withTimeout(this.player.buildables(r, [ t ]), WORKER_TIMEOUT_MS, null);
          } catch (l) {
            return 0n;
          }
          const i = Array.isArray(a) ? a.find((l => l.type === t)) : null;
          const s = i && i.cost !== void 0 && i.cost !== null ? i.cost : 0n;
          this._costCache.set(t, s);
          return s;
        }
        nukeSpawn(t, n) {
          const o = this.player.units(UNIT.MissileSilo);
          let r = false;
          let a = Infinity;
          for (const i of o) {
            if (i.isActive && i.isActive() === false) continue;
            if (i.isUnderConstruction()) continue;
            if (typeof i.ticksLeftInCooldown === "function" && i.ticksLeftInCooldown() > 0) {
              continue;
            }
            const s = this.game.manhattanDist(i.tile(), n);
            if (s < a) {
              a = s;
              r = i.tile();
            }
          }
          return r;
        }
        async probeCanBuildNuke(t, n) {
          let o;
          try {
            o = await withTimeout(this.player.buildables(t, [ n ]), WORKER_TIMEOUT_MS, null);
          } catch (a) {
            return false;
          }
          const r = Array.isArray(o) ? o.find((a => a.type === n)) : null;
          return r !== null && r !== void 0 && r.canBuild !== false;
        }
      }
      "use strict";
      class NationBot {
        constructor(t, n) {
          this.mg = t;
          this.player = t.myPlayer();
          this.active = true;
          this.behaviorsInitialized = false;
          this.spawnExecAdded = false;
          this.lastSpawnTile = null;
          this.lastSpawnTopKey = null;
          this.lastSpawnPickTick = null;
          this.status = "";
          this.lastSeenTick = -1;
          this.embargoMalusApplied = new Set;
          this.random = new PseudoRandom(simpleHash(String(n && n.playerId)) + simpleHash(String(n && n.gameId)));
          this.triggerRatio = this.random.nextInt(50, 60) / 100;
          this.reserveRatio = this.random.nextInt(30, 40) / 100;
          this.expandRatio = this.random.nextInt(10, 20) / 100;
          this.attackRate = this.getAttackRate();
          this.attackTick = this.random.nextInt(0, this.attackRate);
        }
        getAttackRate() {
          switch (currentDifficulty()) {
           case Difficulty.Easy:
            return this.random.nextInt(65, 100);

           case Difficulty.Medium:
            return this.random.nextInt(55, 70);

           case Difficulty.Hard:
            return this.random.nextInt(45, 60);

           case Difficulty.Impossible:
            return this.random.nextInt(30, 50);

           default:
            return this.random.nextInt(30, 50);
          }
        }
        feat(t) {
          return !!(state.settings.features && state.settings.features[t]);
        }
        async tick(t) {
          this.player = this.mg.myPlayer();
          const n = this.player;
          if (this.behaviorsInitialized && n !== null && n.isAlive() && this.feat("warship") && currentDifficulty() !== Difficulty.Easy && n.unitsConstructed(UNIT.Port) && !this.mg.config().isUnitDisabled(UNIT.Warship)) {
            try {
              if (state.settings.warshipAutoSpawn !== false) {
                this.warshipBehavior.trackShipsAndRetaliate();
              }
              if (state.settings.winFixes) {
                if (state.settings.warshipNukeDodge !== false) {
                  this.warshipBehavior.dodgeNukes();
                }
                this.warshipBehavior.smartWarshipPatrol();
                this.warshipBehavior.smartWarshipCombat();
              }
            } catch (u) {
              console.error("[AutoBot] trackShips error:", u);
            }
          }
          if (n === null) return;
          if (this.mg.inSpawnPhase()) {
            if (this.feat("spawn")) {
              if (this.lastSpawnPickTick == null || t - this.lastSpawnPickTick >= 6) {
                this.lastSpawnPickTick = t;
                const u = this.currentSpawnTopKey();
                if (!this.spawnExecAdded || u != null && u !== this.lastSpawnTopKey) {
                  this.lastSpawnTopKey = u;
                  this.doSpawn();
                }
              }
              this.status = tr("Spawn phase…");
            } else {
              this.status = tr("Spawn phase…");
            }
            return;
          }
          if (!n.isAlive()) {
            this.active = false;
            this.status = tr("💀 Eliminated");
            return;
          }
          if (!this.behaviorsInitialized) {
            this.initializeBehaviors();
            if (this.feat("expand")) {
              await this.attackBehavior.forceSendAttack(this.mg.terraNullius());
            }
            this.lastSeenTick = t;
            return;
          }
          const o = this.lastSeenTick < 0 ? t : this.lastSeenTick + 1;
          this.lastSeenTick = t;
          let r = this.attackRate;
          if (state.settings.winFixes) {
            const u = state.settings.combatCadenceScale ?? 1;
            if (u > 0 && u !== 1) {
              r = Math.max(1, Math.round(this.attackRate * u));
            }
          }
          const a = this.attackTick % r;
          const i = (a + Math.floor(r / 3)) % r;
          const s = (a + Math.floor(r * 2 / 3)) % r;
          let l = false;
          let c = false;
          for (let u = o; u <= t; u++) {
            const d = (u % r + r) % r;
            if (d === a) l = true; else if (d === i || d === s) c = true;
          }
          if (!l) {
            if (c && this.feat("build")) {
              await this.structureBehavior.handleStructures();
            }
            return;
          }
          this.status = tr("Thinking…");
          try {
            this.emojiBehavior.maybeSendCasualEmoji();
            this.updateRelationsFromEmbargos();
            this.allianceBehavior.handleAllianceRequestsFromBots();
            if (this.feat("alliance")) {
              this.allianceBehavior.handleAllianceRequests();
              this.allianceBehavior.handleAllianceExtensionRequests();
            }
            if (this.feat("nuke")) {
              await this.mirvBehavior.considerMIRV();
            }
            if (this.feat("build")) {
              await this.structureBehavior.handleStructures();
            }
            if (this.feat("warship") && state.settings.warshipAutoSpawn !== false) {
              await this.warshipBehavior.maybeSpawnWarship();
            }
            if (this.feat("embargo")) {
              this.handleEmbargoesToHostileNations();
            }
            if (this.feat("expand") || this.feat("boat")) {
              await this.attackBehavior.maybeAttack();
            }
            if (this.feat("warship") && state.settings.warshipAutoSpawn !== false) {
              await this.warshipBehavior.counterWarshipInfestation();
            }
            if (this.feat("nuke")) {
              await this.nukeBehavior.maybeSendNuke();
            }
          } catch (u) {
            console.error("[AutoBot] decision chain error:", u);
          }
        }
        initializeBehaviors() {
          const t = this.random;
          const n = this.mg;
          const o = this.player;
          this.emojiBehavior = new EmojiBehavior(t, n, o);
          this.mirvBehavior = new MirvBehavior(t, n, o, this.emojiBehavior);
          this.allianceBehavior = new AllianceBehavior(t, n, o, this.emojiBehavior);
          this.warshipBehavior = new WarshipBehavior(t, n, o, this.emojiBehavior);
          this.attackBehavior = new AttackBehavior(t, n, o, this.triggerRatio, this.reserveRatio, this.expandRatio, this.allianceBehavior, this.emojiBehavior);
          this.nukeBehavior = new NukeBehavior(t, n, o, this.attackBehavior, this.emojiBehavior);
          this.structureBehavior = new StructureBehavior(t, n, o);
          this.behaviorsInitialized = true;
        }
        currentSpawnTopKey() {
          if (!state.settings.smartSpawn) return null;
          let t = null;
          try {
            if (typeof getSpawnHeatmapTopSpots === "function") t = getSpawnHeatmapTopSpots();
            if ((!t || t.length === 0) && typeof computeSpawnTopSpotsForBot === "function") {
              t = computeSpawnTopSpotsForBot(this.mg, this.player);
            }
          } catch (n) {
            t = null;
          }
          return t && t.length > 0 ? `${t[0].x},${t[0].y}` : null;
        }
        doSpawn() {
          const t = this.pickSpawnCenter();
          if (t == null) {
            this.status = tr("Spawn phase…");
            return;
          }
          if (this.spawnExecAdded && t === this.lastSpawnTile) {
            return;
          }
          let ok = false;
          try {
            const n = discoverCtors(getEventBus());
            if (n && n.spawn) {
              ok = emitIntent(n.spawn, t);
            }
          } catch (e) {}
          if (!ok && typeof sendPacket === "function") {
            ok = sendPacket({
              type: "spawn",
              tile: Math.floor(Number(t))
            });
          }
          if (ok) {
            const o = this.spawnExecAdded;
            this.spawnExecAdded = true;
            this.lastSpawnTile = t;
            if (!o) {
              state.stats.spawns++;
            }
            setLastAction(tr("🏁 Spawned"), "spawn");
          }
        }
        pickSpawnCenter() {
          if (typeof companionSpawnCenter === "function") {
            const p = companionSpawnCenter(this.mg, this.player);
            if (p != null) return p;
          }
          const t = this.mg;
          const n = t.width();
          const o = t.height();
          let r = 30;
          try {
            const p = t.config().minDistanceBetweenPlayers();
            if (Number.isFinite(p)) r = p;
          } catch (p) {}
          let a = null;
          try {
            const p = this.player.team();
            if (p !== null && typeof t.__src?.teamSpawnArea === "function") {
              a = t.__src.teamSpawnArea(p) ?? null;
            }
          } catch (p) {}
          const i = t.players().filter((p => p.smallID() !== this.player.smallID() && p.hasSpawned()));
          const s = p => {
            const h = t.x(p);
            const m = t.y(p);
            for (const g of i) {
              const y = g.nameLocation();
              if (!y) continue;
              if (t.manhattanDist(t.ref(y.x, y.y), p) < r) return true;
            }
            return false;
          };
          const l = state.settings.smartSpawn;
          const c = p => p != null && t.isLand(p) && !t.hasOwner(p) && !t.isBorder(p) && !s(p);
          const u = (p, h) => {
            if (t.isValidCoord(p, h)) {
              const m = t.ref(p, h);
              if (c(m)) return m;
            }
            for (let m = 2; m <= 24; m += 2) {
              for (let g = -m; g <= m; g += 2) {
                for (let y = -m; y <= m; y += 2) {
                  if (Math.abs(y) !== m && Math.abs(g) !== m) continue;
                  const b = p + y;
                  const w = h + g;
                  if (!t.isValidCoord(b, w)) continue;
                  const v = t.ref(b, w);
                  if (c(v)) return v;
                }
              }
            }
            return null;
          };
          if (l) {
            let p = null;
            try {
              if (typeof getSpawnHeatmapTopSpots === "function") {
                p = getSpawnHeatmapTopSpots();
              }
              if (!p && typeof computeSpawnTopSpotsForBot === "function") {
                p = computeSpawnTopSpotsForBot(t, this.player);
              }
            } catch (h) {
              p = null;
            }
            if (p && p.length > 0) {
              for (let h = 0; h < p.length; h++) {
                const m = u(p[h].x, p[h].y);
                if (m != null) return m;
              }
            }
          }
          let d = null;
          let f = -Infinity;
          for (let p = 0; p < 1e3; p++) {
            const h = a ? this.random.nextInt(a.x, a.x + a.width) : this.random.nextInt(0, n);
            const m = a ? this.random.nextInt(a.y, a.y + a.height) : this.random.nextInt(0, o);
            if (!t.isValidCoord(h, m)) continue;
            const g = t.ref(h, m);
            if (!t.isLand(g) || t.hasOwner(g) || t.isBorder(g)) continue;
            if (s(g)) continue;
            if (!l) return g;
            const y = this.scoreSpawnTile(g, i, n, o, a);
            if (y > f) {
              f = y;
              d = g;
            }
          }
          return d;
        }
        scoreSpawnTile(t, n, o, r, area) {
          let a_area = typeof area !== "undefined" ? area : null;
          const a = this.mg;
          const i = a.x(t);
          const s = a.y(t);
          let l = 0;
          const c = 12;
          let u = 0;
          let d = 0;
          for (let h = -c; h <= c; h++) {
            for (let m = -c; m <= c; m++) {
              const g = i + m;
              const y = s + h;
              if (!a.isValidCoord(g, y)) continue;
              d++;
              if (a.isLand(a.ref(g, y))) u++;
            }
          }
          l += (d > 0 ? u / d : 0) * 40;
          let f = Infinity;
          for (const h of n) {
            const m = h.nameLocation();
            if (!m) continue;
            const g = Math.abs(m.x - i) + Math.abs(m.y - s);
            if (g < f) f = g;
          }
          l += Math.min(1, f / 200) * 30;
          const p = Math.min(i, s, o - 1 - i, r - 1 - s);
          l += Math.min(1, p / 30) * 20;
          if (a_area) {
            const h = area.x + area.width / 2;
            const m = area.y + area.height / 2;
            const g = Math.abs(i - h) + Math.abs(s - m);
            const y = (area.width + area.height) / 2;
            l += Math.max(0, 1 - g / Math.max(1, y)) * 10;
          }
          return l;
        }
        updateRelationsFromEmbargos() {
          const t = this.player;
          if (t === null) return;
          const n = this.mg.players().filter((r => r.id() !== t.id()));
          const o = -20;
          n.forEach((r => {
            if (r.hasEmbargoAgainst(t) && !this.embargoMalusApplied.has(r.smallID())) {
              t.updateRelation(r, o);
              this.embargoMalusApplied.add(r.smallID());
            } else if (!r.hasEmbargoAgainst(t) && this.embargoMalusApplied.has(r.smallID())) {
              t.updateRelation(r, -o);
              this.embargoMalusApplied.delete(r.smallID());
            }
          }));
        }
        handleEmbargoesToHostileNations() {
          const t = this.player;
          if (t === null) return;
          const n = this.mg.players().filter((i => i.id() !== t.id()));
          const o = currentDifficulty();
          const r = o === Difficulty.Hard || o === Difficulty.Impossible;
          const a = this.mg.config().gameConfig().gameMode === GameMode.Team;
          n.forEach((i => {
            if (a && r && i.type() !== PlayerType.Bot && !t.isOnSameTeam(i)) {
              if (!t.hasEmbargoAgainst(i)) this.addEmbargo(i, false);
              return;
            }
            if (t.relation(i) <= Relation.Hostile && !t.hasEmbargoAgainst(i) && !t.isOnSameTeam(i)) {
              this.addEmbargo(i, false);
            } else if (t.relation(i) >= Relation.Neutral && t.hasEmbargoAgainst(i) && o !== Difficulty.Hard && o !== Difficulty.Impossible) {
              this.stopEmbargo(i);
            } else if (t.relation(i) >= Relation.Friendly && t.hasEmbargoAgainst(i) && o !== Difficulty.Impossible) {
              this.stopEmbargo(i);
            }
          }));
        }
        addEmbargo(t, n) {
          const o = discoverCtors(getEventBus());
          if (o.embargo) emitIntent(o.embargo, t.__src ?? t, "start");
        }
        stopEmbargo(t) {
          const n = discoverCtors(getEventBus());
          if (n.embargo) emitIntent(n.embargo, t.__src ?? t, "stop");
        }
      }
      "use strict";
      let _api = null;
      let _apiSrc = null;
      let _bot = null;
      let _botSeedKey = null;
      function ensureGameApi(e) {
        if (_api && _apiSrc === e) return _api;
        _api = createGameApi(e);
        _apiSrc = e;
        _bot = null;
        _botSeedKey = null;
        return _api;
      }
      function resolveGameId(e) {
        try {
          if (typeof e.gameID === "function") return String(e.gameID());
        } catch (t) {}
        try {
          const t = e.config().gameConfig();
          if (t && t.gameID != null) return String(t.gameID);
        } catch (t) {}
        return "openfront";
      }
      async function botTick() {
        if (!state.settings.enabled || state.tickInFlight) return;
        const e = getGame();
        if (!e) {
          setStatus(tr("Waiting to enter game…"));
          return;
        }
        if (isPublicLobby(e)) {
          setStatus(tr("⛔ Blocked in a public lobby"));
          refreshGateBanner();
          return;
        }
        const t = e.myPlayer?.();
        if (!t || !t.isPlayer?.()) {
          setStatus(tr("Waiting for player…"));
          return;
        }
        state.tickInFlight = true;
        state.tickStartedAt = performance.now();
        try {
          updateSpeedFactor(e);
          const n = ensureGameApi(e);
          const o = t.id?.();
          if ((!_bot || _botSeedKey !== o) && typeof NationBot === "function") {
            _bot = new NationBot(n.game, {
              gameId: resolveGameId(e),
              playerId: String(o)
            });
            _botSeedKey = o;
          }
          await n.beginTick(t);
          const r = n.game.myPlayer();
          updateLive(n.game, r);
          if (_bot) {
            await _bot.tick(n.game.ticks());
            setStatus(_bot.status || tr("Thinking…"));
          } else {
            setStatus(tr("Loading bot…"));
          }
        } catch (n) {
          console.error("[AutoBot] tick error:", n);
          setStatus(tr("Error (see console)"));
        } finally {
          state.tickInFlight = false;
          renderStatus();
        }
      }
      function updateLive(e, t) {
        try {
          const n = toNum(t.troops?.());
          const o = safeMaxTroops(e, t);
          state.live = {
            troops: n,
            gold: toNum(t.gold?.()),
            tiles: toNum(t.numTilesOwned?.()),
            fill: o > 0 ? n / o : 0
          };
        } catch (n) {}
      }
      return {
        NationBot: NationBot,
        createGameApi: createGameApi,
        ensureGameApi: ensureGameApi,
        state: state,
        UNIT: UNIT,
        DEFAULTS: DEFAULTS,
        Difficulty: Difficulty,
        resolveGameId: resolveGameId
      };
    }();
    const Engine = {
      running: botCfg.enabled,
      timer: null,
      spawnSent: false,
      lastSpawnTile: null,
      lastSpawnPickTime: 0,
      nationBot: null,
      nationBotSeedKey: null,
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
        this.nationBot = null;
        this.nationBotSeedKey = null;
        updateUI();
      },
      toggle() {
        if (this.running) this.stop(); else this.start();
      },
      scheduleNextTick() {
        if (!this.running) return;
        if (this.timer) clearTimeout(this.timer);
        const interval = Math.max(150, Math.min(3e3, botCfg.tickIntervalMs || 200));
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
        let game = null;
        try {
          if (typeof getGame === "function") game = getGame();
          if (!game && typeof api.getGameState === "function") {
            const s = api.getGameState();
            if (s && s.game) game = s.game;
          }
        } catch (e) {}
        if (!game) {
          updateUI();
          return;
        }
        let inSpawn = false;
        try {
          inSpawn = typeof game.inSpawnPhase === "function" && game.inSpawnPhase();
        } catch (e) {}
        if (!inSpawn && this.spawnSent) {
          this.spawnSent = false;
          this.lastSpawnTile = null;
        }
        const isSolo = botCfg.mode === "solo" || botCfg.activePreset === "solo";
        if (isSolo) {
          this.tickImpossible(game);
          updateUI();
          return;
        }
        if (inSpawn) {
          if (botCfg.autoSpawn && !this.spawnSent) {
            try {
              this.handleAutoSpawn(game);
            } catch (e) {
              console.error("[ImpossibleBot] AutoSpawn error:", e);
            }
          }
          updateUI();
          return;
        }
        let myPlayer = null;
        try {
          myPlayer = typeof game.myPlayer === "function" ? game.myPlayer() : api.getGameState?.()?.myPlayer ?? null;
        } catch (e) {}
        if (!myPlayer || !isAlive(myPlayer)) {
          updateUI();
          return;
        }
        let hasSpawned = false;
        try {
          hasSpawned = typeof myPlayer.hasSpawned === "function" ? myPlayer.hasSpawned() : Boolean(myPlayer.spawnTile?.());
        } catch (e) {
          hasSpawned = false;
        }
        if (!hasSpawned) {
          updateUI();
          return;
        }
        let myTiles = 0;
        try {
          myTiles = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) : myPlayer.tiles?.()?.length || 0;
        } catch (e) {
          myTiles = 0;
        }
        if (myTiles <= 0) {
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
        if (botCfg.autoEmbargo) this.handle1v1AutoEmbargo(game, myPlayer);
        if (botCfg.autoEmoji === true) this.handleEmojis(game, myPlayer);
        this.tick1v1(game, myPlayer);
        updateUI();
      },
      tickImpossible(game) {
        let myPlayer = null;
        try {
          myPlayer = typeof game.myPlayer === "function" ? game.myPlayer() : api.getGameState?.()?.myPlayer ?? null;
        } catch (e) {}
        if (!myPlayer) return;
        this.myTroopCap = getMaxTroops(game, myPlayer);
        this.oppTroopCap = 0;
        this.opponentName = "Solo / Impossible AI (ratio.js)";
        RatioNationEngine.state.settings.enabled = true;
        RatioNationEngine.state.settings.difficulty = "Impossible";
        RatioNationEngine.state.settings.winFixes = botCfg.winFixes !== false;
        RatioNationEngine.state.settings.smartSpawn = botCfg.autoSpawn !== false;
        RatioNationEngine.state.settings.features = {
          spawn: botCfg.autoSpawn !== false,
          expand: botCfg.autoExpand !== false,
          build: botCfg.autoBuild !== false,
          boat: botCfg.autoBoat !== false,
          nuke: botCfg.autoNuke !== false,
          warship: botCfg.autoWarship !== false,
          alliance: botCfg.autoAlliance !== false,
          embargo: botCfg.autoEmbargo !== false,
          donate: botCfg.autoDonate !== false,
          betray: true
        };
        RatioNationEngine.state.settings.buildStructures = {
          [RatioNationEngine.UNIT.City]: botCfg.buildCities !== false,
          [RatioNationEngine.UNIT.Port]: botCfg.buildPorts !== false,
          [RatioNationEngine.UNIT.Factory]: botCfg.buildFactories !== false,
          [RatioNationEngine.UNIT.DefensePost]: botCfg.buildDefensePosts !== false,
          [RatioNationEngine.UNIT.SAMLauncher]: botCfg.buildSams !== false,
          [RatioNationEngine.UNIT.MissileSilo]: botCfg.buildSilos !== false
        };
        const gId = RatioNationEngine.resolveGameId(game);
        const pId = String(myPlayer.id ? myPlayer.id() : "player");
        const nApi = RatioNationEngine.ensureGameApi(game);
        if ((!this.nationBot || this.nationBotSeedKey !== pId) && typeof RatioNationEngine.NationBot === "function") {
          this.nationBot = new RatioNationEngine.NationBot(nApi.game, {
            gameId: gId,
            playerId: pId
          });
          this.nationBotSeedKey = pId;
        }
        if (this.nationBot) {
          nApi.beginTick(myPlayer).then((() => {
            const ticks = typeof game.ticks === "function" ? game.ticks() : 0;
            this.nationBot.tick(ticks);
            if (this.nationBot.status) {
              this.targetDetail = this.nationBot.status;
            }
          })).catch((e => {
            console.warn("[ImpossibleBot] NationBot tick error:", e);
          }));
        }
      },
      handle1v1AutoEmbargo(game, myPlayer) {
        const incoming = typeof myPlayer?.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        for (const atk of incoming) {
          if (!atk) continue;
          const attacker = typeof atk.attacker === "function" ? atk.attacker() : null;
          if (attacker && !isFriendly(myPlayer, attacker)) {
            const aId = getPlayerID(attacker);
            if (aId) sendPacket({
              type: "embargo",
              targetID: aId,
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
        if (this.spawnSent && this.lastSpawnTile != null) return;
        const now = Date.now();
        if (now - this.lastSpawnPickTime < 500) return;
        this.lastSpawnPickTime = now;
        const tile = this.pickSpawnTile(game);
        if (tile == null) return;
        const ok = sendPacket({
          type: "spawn",
          tile: Math.floor(Number(tile))
        });
        if (ok) {
          this.spawnSent = true;
          this.lastSpawnTile = tile;
          this.stats.expandsDone++;
        }
      },
      pickSpawnTile(game) {
        if (!game) return null;
        const nApi = RatioNationEngine.ensureGameApi(game);
        const myPlayer = typeof game.myPlayer === "function" ? game.myPlayer() : null;
        if (!myPlayer) return null;
        const gId = RatioNationEngine.resolveGameId(game);
        const pId = String(myPlayer.id ? myPlayer.id() : "player");
        const tempBot = new RatioNationEngine.NationBot(nApi.game, {
          gameId: gId,
          playerId: pId
        });
        return tempBot.pickSpawnCenter();
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
            const oppId = getPlayerID(opponent);
            if (assaultTroops > 1e3 && oppId) {
              setTimeout((() => {
                sendPacket({
                  type: "attack",
                  targetID: oppId,
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
        const oppId = getPlayerID(opponent);
        if (this.justLandedBeachhead && now - this.lastLandingAssaultTime < 4e3 && oppId) {
          this.justLandedBeachhead = false;
          if (!isOppKillShot) {
            const assaultTroops = Math.floor(myTroops * .45);
            const ok = sendPacket({
              type: "attack",
              targetID: oppId,
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
        if (isOppKillShot && oppId) {
          const killTroops = Math.floor(myTroops * .9);
          const ok = sendPacket({
            type: "attack",
            targetID: oppId,
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
        return false;
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
        const recipient = target === "AllPlayers" ? "AllPlayers" : getPlayerID(target);
        if (!recipient) return false;
        const last = this.lastEmojiSentTime.get(recipient) || 0;
        if (now - last < 4e3) return false;
        this.lastEmojiSentTime.set(recipient, now);
        return sendPacket({
          type: "emoji",
          recipient: recipient,
          emoji: Number.isInteger(emojiIndex) ? emojiIndex : EMOJI_IDX.HEART
        });
      }
    };
    function renderTab(panel) {
      panel.style.color = "#ccc";
      panel.style.fontFamily = "monospace";
      panel.style.fontSize = "11px";
      const themeColor = api.cfg?.guiColor || "#00ff66";
      panel.innerHTML = `\n        <button id="blon-ext-auto-master-toggle" style="width:100%;padding:9px 0;background:${themeColor};border:none;color:#000;font-weight:700;font-size:11px;border-radius:4px;cursor:pointer;margin-bottom:10px;transition:all 0.2s ease;">\n            ENABLE AUTOPLAY (Shift+B)\n        </button>\n\n        <div style="background:#111;border:1px solid #222;border-radius:6px;padding:8px 10px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">\n            <span style="color:#aaa;font-size:10px;font-weight:700;">STRATEGY PRESET</span>\n            <select id="blon-ext-mode-select" style="background:#222;color:#fff;border:1px solid #444;border-radius:3px;font-size:10px;padding:3px 6px;cursor:pointer;">\n                <option value="solo" ${botCfg.activePreset === "solo" || botCfg.mode === "solo" ? "selected" : ""}>Solo Impossible AI (ratio.js)</option>\n                <option value="v1v1" ${botCfg.activePreset === "v1v1" || botCfg.mode === "1v1" ? "selected" : ""}>1v1 Sweaty Meta</option>\n            </select>\n        </div>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-bottom:8px;">Combat & Expansion</div>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-attack" ${botCfg.autoAttack !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Attack & Target Priority\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-expand" ${botCfg.autoExpand !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Expand (Land & Fallout Grab)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-defend" ${botCfg.autoDefend !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Defend (Frontline DP Placement)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-spawn" ${botCfg.autoSpawn !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Spawn (Dynamic Team/Terrain Scoring)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-boat" ${botCfg.autoBoat !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Boat (Surge Beachhead & Islands)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-warship" ${botCfg.autoWarship !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Warships (Retaliation & Intercept)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-alliance" ${botCfg.autoAlliance !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Alliances & Diplomatic Outreach\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-donate" ${botCfg.autoDonate !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Donate Troops to Allies in Combat\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-embargo" ${botCfg.autoEmbargo !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Embargo Hostiles & Attackers\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-winfixes" ${botCfg.winFixes !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Competitive Win-Fixes (Cadence & Scale)\n        </label>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:12px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-emoji" ${botCfg.autoEmoji === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Emoji Reactions\n        </label>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Structure & Defense</div>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-build-master" ${botCfg.autoBuild !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Build Structures & Upgrades\n        </label>\n\n        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-cities" ${botCfg.buildCities !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Cities (Inland Spacing)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Cities</span>\n                <input id="blon-ext-max-cities-slider" type="range" min="1" max="50" step="1" value="${botCfg.maxCities ?? 40}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-cities-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxCities ?? 40}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-factories" ${botCfg.buildFactories !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Factories (Coastal Multiplier)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Factories</span>\n                <input id="blon-ext-max-factories-slider" type="range" min="0" max="30" step="1" value="${botCfg.maxFactories ?? 20}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-factories-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxFactories ?? 20}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-defposts" ${botCfg.buildDefensePosts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Defense Posts (Frontline Sampling)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Defense Posts</span>\n                <input id="blon-ext-max-defposts-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxDefensePosts ?? 5}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-defposts-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxDefensePosts ?? 5}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-silos" ${botCfg.buildSilos !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Missile Silos (Protected under SAMs)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Silos</span>\n                <input id="blon-ext-max-silos-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxSilos ?? 3}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-silos-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSilos ?? 3}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-sams" ${botCfg.buildSams !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> SAM Launchers (Air Defense Umbrella)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max SAMs</span>\n                <input id="blon-ext-max-sams-slider" type="range" min="0" max="20" step="1" value="${botCfg.maxSams ?? 8}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-sams-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSams ?? 8}</span>\n            </div>\n\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-build-ports" ${botCfg.buildPorts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Ports (Major Sea Bodies)\n            </label>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">\n                <span style="font-size:10px;">Max Ports</span>\n                <input id="blon-ext-max-ports-slider" type="range" min="0" max="6" step="1" value="${botCfg.maxPorts ?? 3}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-max-ports-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxPorts ?? 3}</span>\n            </div>\n        </div>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Nuclear Strikes & Superweapons</div>\n        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">\n            <input type="checkbox" id="blon-ext-feat-nuke" ${botCfg.autoNuke !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Nuke & Trajectory SAM Evasion\n        </label>\n        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-nuke-atom" ${botCfg.allowAtomBombs === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Atom Bombs / SAM Burn ($750K)\n            </label>\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-nuke-hbomb" ${botCfg.allowHydrogenBombs !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Hydrogen Bombs ($5M)\n            </label>\n            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">\n                <input type="checkbox" id="blon-ext-nuke-mirv" ${botCfg.allowMirv !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> MIRV Victory Denial ($25M)\n            </label>\n        </div>\n\n        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">AI Tuning</div>\n        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Attack Trigger Ratio</span>\n                <input id="blon-ext-trigger-slider" type="range" min="30" max="90" step="1" value="${Math.round((botCfg.triggerRatio ?? .55) * 100)}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-trigger-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.triggerRatio ?? .55) * 100)}%</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Troop Reserve Floor</span>\n                <input id="blon-ext-reserve-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.reserveRatio ?? .35) * 100)}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-reserve-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.reserveRatio ?? .35) * 100)}%</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Wilderness Expand Floor</span>\n                <input id="blon-ext-expand-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.expandRatio ?? .15) * 100)}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-expand-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.expandRatio ?? .15) * 100)}%</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">Bot Parallel Cap</span>\n                <input id="blon-ext-parallel-slider" type="range" min="1" max="100" step="1" value="${botCfg.botParallelism ?? 100}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-parallel-value" style="color:#ffcc00;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.botParallelism ?? 100}</span>\n            </div>\n            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">\n                <span style="min-width:130px;font-size:10px;">AI Tick Interval</span>\n                <input id="blon-ext-interval-slider" type="range" min="150" max="2500" step="50" value="${botCfg.tickIntervalMs ?? 200}" style="flex:1;cursor:pointer;">\n                <span id="blon-ext-interval-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.tickIntervalMs ?? 200}ms</span>\n            </div>\n        </div>\n      `;
      const masterBtn = panel.querySelector("#blon-ext-auto-master-toggle");
      if (masterBtn) masterBtn.addEventListener("click", (() => Engine.toggle()));
      const modeSelect = panel.querySelector("#blon-ext-mode-select");
      if (modeSelect) {
        modeSelect.addEventListener("change", (e => {
          applyPreset(e.target.value);
        }));
      }
      [ [ "blon-ext-feat-attack", "autoAttack" ], [ "blon-ext-feat-expand", "autoExpand" ], [ "blon-ext-feat-defend", "autoDefend" ], [ "blon-ext-feat-spawn", "autoSpawn" ], [ "blon-ext-feat-embargo", "autoEmbargo" ], [ "blon-ext-feat-boat", "autoBoat" ], [ "blon-ext-feat-warship", "autoWarship" ], [ "blon-ext-feat-alliance", "autoAlliance" ], [ "blon-ext-feat-donate", "autoDonate" ], [ "blon-ext-feat-winfixes", "winFixes" ], [ "blon-ext-feat-emoji", "autoEmoji" ], [ "blon-ext-build-master", "autoBuild" ], [ "blon-ext-build-cities", "buildCities" ], [ "blon-ext-build-factories", "buildFactories" ], [ "blon-ext-build-sams", "buildSams" ], [ "blon-ext-build-silos", "buildSilos" ], [ "blon-ext-build-ports", "buildPorts" ], [ "blon-ext-build-defposts", "buildDefensePosts" ], [ "blon-ext-feat-nuke", "autoNuke" ], [ "blon-ext-nuke-atom", "allowAtomBombs" ], [ "blon-ext-nuke-hbomb", "allowHydrogenBombs" ], [ "blon-ext-nuke-mirv", "allowMirv" ] ].forEach((([id, prop]) => {
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
      version: "4.5.2",
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