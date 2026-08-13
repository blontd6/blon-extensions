// ==UserScript==
// @name         Blon Extension: Impossible Bot (Autoplay)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Autoplay extension mirroring OpenFront Impossible Solo AI (ratio.js)
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

    const botCfg = {
      enabled: false,
      autoAttack: true,
      autoExpand: true,
      autoDefend: true,
      autoBuild: true,
      autoNuke: true,
      autoSpawn: true,
      autoEmbargo: true,
      autoDonate: true,
      autoEmoji: false,
      autoBoat: true,
      autoWarship: true,

      buildCities: true,
      buildSams: true,
      buildSilos: true,
      buildPorts: true,
      buildDefensePosts: true,
      upgradeSilos: true,
      allowAtomBombs: true,
      allowHydrogenBombs: true,

      maxCities: 25,
      maxSams: 5,
      samRatio: 0.35,
      maxSilos: 3,
      maxPorts: 2,
      maxDefensePosts: 3,

      triggerRatio: 0.55,
      reserveRatio: 0.35,
      expandRatio: 0.15,
      botParallelism: 50,
      tickIntervalMs: 800,
      hotkey: "b"
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) Object.assign(botCfg, JSON.parse(stored));
    } catch (e) {}

    botCfg.autoEmoji = botCfg.autoEmoji === true;
    if (api && api.cfg && botCfg.autoEmoji !== true) {
      api.cfg.autoEmojiReactEnabled = false;
    }

    function saveBotCfg() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(botCfg)); } catch (e) {}
      if (api && api.cfg && botCfg.autoEmoji !== true) {
        api.cfg.autoEmojiReactEnabled = false;
      }
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
      return t === "BOT" || t === "NATION" || t === "Bot";
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

    function findInteriorTile(game, myPlayer) {
      const myID = getMySmallID(myPlayer);
      if (!myID) return null;
      const bts = getBorderTiles(game, myPlayer);
      if (bts.size === 0) return null;
      for (const bt of bts) {
        let found = null;
        forEachNeighbor(game, bt, (n) => {
          if (found) return;
          try {
            if (typeof game.isLand === "function" && game.isLand(n) &&
                game.ownerID(n) === myID && !bts.has(n)) {
              found = n;
            }
          } catch (e) {}
        });
        if (found) return found;
      }
      const arr = Array.from(bts);
      return arr[Math.floor(arr.length / 2)] || null;
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

    function getEffectiveReserveRatio(game, myPlayer, baseReserveRatio) {
      let r = baseReserveRatio ?? botCfg.reserveRatio ?? 0.35;
      try {
        const totalLand = (typeof game.numLandTiles === "function" ? game.numLandTiles() : null) || 5000;
        const owned = typeof myPlayer.numTilesOwned === "function" ? Number(myPlayer.numTilesOwned()) : 10;
        const share = owned / Math.max(1, totalLand);
        r = Math.max(r, Math.min(0.60, share * 1.5));
      } catch (e) {}
      return r;
    }

    function calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio) {
      const effReserve = getEffectiveReserveRatio(game, myPlayer, reserveRatio);
      const reserve = maxTroops * effReserve;
      const available = Math.max(0, myTroops - reserve - (botAttackTroopsSent || 0));
      if (available <= 0) return 0;

      const targetTr = playerTroops(target);
      const tgt_is_bot = isBot(target) && !isBot(myPlayer);

      let troops;
      if (tgt_is_bot) {
        let needed = targetTr * 3;
        if (needed > available) {
          if (available < targetTr * 1.5) needed = 0;
          else needed = available;
        }
        troops = Math.min(available, needed > 0 ? needed : available);
      } else {
        const needed = Math.max(targetTr * 1.5, Math.floor(maxTroops * 0.05));
        troops = Math.min(available, needed);
      }

      const maxSendCap = Math.max(1000, Math.floor(myTroops * 0.35));
      troops = Math.min(troops, maxSendCap);

      return Math.floor(Math.max(0, troops));
    }

    function sendLandAttack(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio) {
      const troops = calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio);
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
      botAttackTroopsSent: 0,
      stats: {
        attacksSent: 0,
        troopsSentTotal: 0,
        structuresBuilt: 0,
        nukesLaunched: 0,
        expandsDone: 0
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
        updateUI();
      },

      toggle() { if (this.running) this.stop(); else this.start(); },

      scheduleNextTick() {
        if (!this.running) return;
        if (this.timer) clearTimeout(this.timer);
        const interval = Math.max(200, Math.min(3000, botCfg.tickIntervalMs || 800));
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
            const burstTroops = Math.floor(playerTroops(myPlayer) * 0.40);
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
        if (botCfg.autoDefend && botCfg.buildDefensePosts) this.handleDefensePost(game, myPlayer);
        if (botCfg.autoDonate) this.handleAutoDonate(game, myPlayer);
        if (botCfg.autoEmoji === true) this.handleEmojis(game, myPlayer);
        if (botCfg.autoBuild) this.handleStructures(game, myPlayer);
        if (botCfg.autoNuke) this.handleNukes(game, myPlayer);
        if (botCfg.autoAttack || botCfg.autoExpand) this.handleAttacks(game, myPlayer);

        updateUI();
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
        let bestTile = null;
        let bestScore = -Infinity;

        for (let i = 0; i < 50; i++) {
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
          if (typeof game.isShore === "function" && game.isShore(ref)) score += 15;
          if (score > bestScore) { bestScore = score; bestTile = ref; }
        }
        return bestTile;
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

        const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        if (incoming.length > 0 && botCfg.autoDefend) {
          let bestAtk = null, bestTr = 0;
          for (const atk of incoming) {
            if (!atk) continue;
            const attacker = typeof atk.attacker === "function" ? atk.attacker() : null;
            if (!attacker || isFriendly(myPlayer, attacker)) continue;
            const tr = typeof atk.troops === "function" ? Number(atk.troops()) : Number(atk.troops || 0);
            if (tr > bestTr) { bestTr = tr; bestAtk = attacker; }
          }
          if (bestAtk) {
            const ok = sendLandAttack(game, myPlayer, bestAtk, myTroops, maxTroops, this.botAttackTroopsSent, reserveRatio);
            if (ok) {
              this.lastAttackMs = Date.now();
              this.stats.attacksSent++;
              if (botCfg.autoEmoji === true) this.sendEmojiTo(bestAtk, EMOJI_IDX.ANGRY);
              return;
            }
          }
        }

        if (botCfg.autoAttack) {
          const borderingBotsWithStructs = borderingEnemies.filter(p => isBot(p) && playerOwnsStructures(p));
          if (borderingBotsWithStructs.length > 0) {
            if (this.attackBots(borderingBotsWithStructs, game, myPlayer, myTroops, maxTroops, reserveRatio)) return;
          }
        }

        if (botCfg.autoExpand && hasBorderWithTerraNullius(game, myPlayer)) {
          const expandThrottle = 2500;
          const now = Date.now();
          if (now - this.lastExpandMs >= expandThrottle) {
            const expandReserve = maxTroops * expandRatio;
            const available = myTroops - expandReserve;
            if (available > 0) {
              const troopsToSend = Math.floor(Math.min(available, Math.max(maxTroops * 0.04, myTroops * 0.20)));
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
          const aStr = playerOwnsStructures(a);
          const bStr = playerOwnsStructures(b);
          if (aStr !== bStr) return aStr ? -1 : 1;
          const aTiles = typeof a.numTilesOwned === "function" ? Number(a.numTilesOwned()) || 1 : 1;
          const bTiles = typeof b.numTilesOwned === "function" ? Number(b.numTilesOwned()) || 1 : 1;
          return (playerTroops(a) / aTiles) - (playerTroops(b) / bTiles);
        });

        const effReserve = getEffectiveReserveRatio(game, myPlayer, reserveRatio);
        const reserve = maxTroops * effReserve;
        const maxBotBudget = Math.max(0, Math.min(myTroops - reserve, Math.floor(myTroops * 0.35)));

        for (const bot of bots.slice(0, cap)) {
          if (this.botAttackTroopsSent >= maxBotBudget) break;
          const botId = typeof bot.id === "function" ? bot.id() : bot.id;
          const availableBudget = maxBotBudget - this.botAttackTroopsSent;
          let troops = calcLandAttackTroops(game, myPlayer, bot, myTroops, maxTroops, this.botAttackTroopsSent, reserveRatio);
          troops = Math.min(troops, availableBudget);
          if (troops < 1) continue;
          const ok = sendPacket({ type: "attack", targetID: String(botId), troops });
          if (ok) {
            attacked++;
            this.botAttackTroopsSent += troops;
            this.stats.attacksSent++;
            this.stats.troopsSentTotal += troops;
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

        if (botCfg.upgradeSilos && botCfg.buildSilos) {
          for (const u of units) {
            if (unitType(u) !== "Missile Silo") continue;
            const level = typeof u.level === "function" ? u.level() : 1;
            const siloId = typeof u.id === "function" ? u.id() : u.id;
            if (level < 3 && gold >= 2000000) {
              if (sendPacket({ type: "upgrade_structure", unit: "Missile Silo", unitId: siloId })) {
                this.stats.structuresBuilt++;
                return;
              }
            }
          }
        }

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
        <button id="blon-ext-auto-master-toggle" style="width:100%;padding:8px 0;background:${themeColor};border:none;color:#000;font-weight:700;font-size:11px;border-radius:4px;cursor:pointer;margin-bottom:10px;transition:all 0.2s ease;">
            ENABLE AUTOPLAY
        </button>

        <div style="display:flex;gap:6px;margin-bottom:12px;">
            <div style="flex:1;background:#111;border:1px solid #222;border-radius:4px;padding:6px 8px;text-align:center;color:#888;font-size:10px;">
                Attacks
                <span id="blon-ext-auto-stat-attacks" style="color:#fff;font-weight:700;display:block;font-size:12px;margin-top:2px;">0</span>
            </div>
            <div style="flex:1;background:#111;border:1px solid #222;border-radius:4px;padding:6px 8px;text-align:center;color:#888;font-size:10px;">
                Structures
                <span id="blon-ext-auto-stat-structs" style="color:#ffcc00;font-weight:700;display:block;font-size:12px;margin-top:2px;">0</span>
            </div>
            <div style="flex:1;background:#111;border:1px solid #222;border-radius:4px;padding:6px 8px;text-align:center;color:#888;font-size:10px;">
                Nukes
                <span id="blon-ext-auto-stat-nukes" style="color:#ff6666;font-weight:700;display:block;font-size:12px;margin-top:2px;">0</span>
            </div>
        </div>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-bottom:8px;">Combat & Expansion</div>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-attack" ${botCfg.autoAttack !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Attack
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-expand" ${botCfg.autoExpand !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Expand
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-defend" ${botCfg.autoDefend !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Defend
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-spawn" ${botCfg.autoSpawn !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Spawn
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-embargo" ${botCfg.autoEmbargo !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Embargo
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-donate" ${botCfg.autoDonate !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Donate
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-boat" ${botCfg.autoBoat !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Boat
        </label>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:12px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-emoji" ${botCfg.autoEmoji === true ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Emoji
        </label>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Structure & Building</div>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-build-master" ${botCfg.autoBuild !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Build
        </label>

        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-cities" ${botCfg.buildCities !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Cities
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Cities</span>
                <input id="blon-ext-max-cities-slider" type="range" min="1" max="50" step="1" value="${botCfg.maxCities ?? 25}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-cities-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxCities ?? 25}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-sams" ${botCfg.buildSams !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> SAM Launchers
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max SAMs</span>
                <input id="blon-ext-max-sams-slider" type="range" min="0" max="20" step="1" value="${botCfg.maxSams ?? 5}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-sams-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSams ?? 5}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-silos" ${botCfg.buildSilos !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Missile Silos
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Silos</span>
                <input id="blon-ext-max-silos-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxSilos ?? 3}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-silos-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxSilos ?? 3}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-ports" ${botCfg.buildPorts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Ports
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Ports</span>
                <input id="blon-ext-max-ports-slider" type="range" min="0" max="6" step="1" value="${botCfg.maxPorts ?? 2}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-ports-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxPorts ?? 2}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-build-defposts" ${botCfg.buildDefensePosts !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Defense Posts
            </label>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;margin-left:14px;margin-bottom:4px;">
                <span style="font-size:10px;">Max Posts</span>
                <input id="blon-ext-max-defposts-slider" type="range" min="0" max="10" step="1" value="${botCfg.maxDefensePosts ?? 3}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-max-defposts-val" style="color:#ffcc00;font-size:10px;min-width:24px;text-align:right;font-weight:700;">${botCfg.maxDefensePosts ?? 3}</span>
            </div>

            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-upgrade-silos" ${botCfg.upgradeSilos !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Upgrade Silos
            </label>
        </div>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">Nuclear Strikes</div>
        <label style="display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;color:#aaa;font-size:11px;">
            <input type="checkbox" id="blon-ext-feat-nuke" ${botCfg.autoNuke !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Auto-Nuke
        </label>
        <div style="margin-left:14px;margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-nuke-atom" ${botCfg.allowAtomBombs !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Atom Bombs
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-nuke-hbomb" ${botCfg.allowHydrogenBombs !== false ? "checked" : ""} style="cursor:pointer;margin:0;"> Hydrogen Bombs
            </label>
        </div>

        <div style="color:${themeColor};font-size:11px;font-weight:700;margin-top:12px;margin-bottom:8px;">AI Tuning</div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Attack Trigger Ratio</span>
                <input id="blon-ext-trigger-slider" type="range" min="30" max="90" step="1" value="${Math.round((botCfg.triggerRatio ?? 0.55) * 100)}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-trigger-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.triggerRatio ?? 0.55) * 100)}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Troop Reserve Floor</span>
                <input id="blon-ext-reserve-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.reserveRatio ?? 0.35) * 100)}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-reserve-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.reserveRatio ?? 0.35) * 100)}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Wilderness Expand Floor</span>
                <input id="blon-ext-expand-slider" type="range" min="5" max="40" step="1" value="${Math.round((botCfg.expandRatio ?? 0.15) * 100)}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-expand-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${Math.round((botCfg.expandRatio ?? 0.15) * 100)}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">Bot Parallel Cap</span>
                <input id="blon-ext-parallel-slider" type="range" min="1" max="100" step="1" value="${botCfg.botParallelism ?? 50}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-parallel-value" style="color:#ffcc00;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.botParallelism ?? 50}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#aaa;font-size:11px;">
                <span style="min-width:130px;font-size:10px;">AI Tick Interval</span>
                <input id="blon-ext-interval-slider" type="range" min="200" max="2500" step="50" value="${botCfg.tickIntervalMs ?? 800}" style="flex:1;cursor:pointer;">
                <span id="blon-ext-interval-value" style="color:#00ff66;font-size:10px;min-width:32px;text-align:right;font-weight:700;">${botCfg.tickIntervalMs ?? 800}ms</span>
            </div>
        </div>
      `;

      const masterBtn = panel.querySelector("#blon-ext-auto-master-toggle");
      if (masterBtn) masterBtn.addEventListener("click", () => Engine.toggle());

      [
        ["blon-ext-feat-attack", "autoAttack"],
        ["blon-ext-feat-expand", "autoExpand"],
        ["blon-ext-feat-defend", "autoDefend"],
        ["blon-ext-feat-spawn", "autoSpawn"],
        ["blon-ext-feat-embargo", "autoEmbargo"],
        ["blon-ext-feat-donate", "autoDonate"],
        ["blon-ext-feat-boat", "autoBoat"],
        ["blon-ext-feat-emoji", "autoEmoji"],
        ["blon-ext-build-master", "autoBuild"],
        ["blon-ext-build-cities", "buildCities"],
        ["blon-ext-build-sams", "buildSams"],
        ["blon-ext-build-silos", "buildSilos"],
        ["blon-ext-build-ports", "buildPorts"],
        ["blon-ext-build-defposts", "buildDefensePosts"],
        ["blon-ext-upgrade-silos", "upgradeSilos"],
        ["blon-ext-feat-nuke", "autoNuke"],
        ["blon-ext-nuke-atom", "allowAtomBombs"],
        ["blon-ext-nuke-hbomb", "allowHydrogenBombs"],
      ].forEach(([id, prop]) => {
        const cb = panel.querySelector("#" + id);
        if (cb) cb.addEventListener("change", (e) => { botCfg[prop] = e.target.checked; saveBotCfg(); });
      });

      const bindSlider = (sliderId, labelId, prop, isPct = false, suffix = "") => {
        const sl = panel.querySelector("#" + sliderId);
        const lb = panel.querySelector("#" + labelId);
        if (sl) {
          sl.addEventListener("input", (e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) {
              botCfg[prop] = isPct ? v / 100 : v;
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
        masterBtn.textContent = isRunning ? "DISABLE AUTOPLAY" : "ENABLE AUTOPLAY";
        masterBtn.style.background = isRunning ? "#331111" : themeColor;
        masterBtn.style.color = isRunning ? "#ff6666" : "#000";
        masterBtn.style.borderColor = isRunning ? "#ff4444" : "transparent";
      }

      const atkCnt = document.getElementById("blon-ext-auto-stat-attacks");
      const structCnt = document.getElementById("blon-ext-auto-stat-structs");
      const nukeCnt = document.getElementById("blon-ext-auto-stat-nukes");

      if (atkCnt) atkCnt.textContent = String(Engine.stats.attacksSent);
      if (structCnt) structCnt.textContent = String(Engine.stats.structuresBuilt);
      if (nukeCnt) nukeCnt.textContent = String(Engine.stats.nukesLaunched);
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
      name: "Impossible Bot (Autoplay)",
      version: "2.0.0",
      description: "Autoplay extension mirroring OpenFront Impossible Solo AI",
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
