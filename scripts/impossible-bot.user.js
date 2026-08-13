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
      autoBuild: true,
      autoNuke: true,
      autoSpawn: true,
      autoEmbargo: true,
      autoDonate: true,
      triggerRatio: 0.55,
      reserveRatio: 0.35,
      expandRatio: 0.15,
      tickIntervalMs: 800,
      hotkey: "b"
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) Object.assign(botCfg, JSON.parse(stored));
    } catch (e) {}

    function saveBotCfg() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(botCfg)); } catch (e) {}
    }

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

    function calcLandAttackTroops(game, myPlayer, target, myTroops, maxTroops, botAttackTroopsSent, reserveRatio) {
      const tgt_is_bot = isBot(target) && !isBot(myPlayer);
      const useExpandRatio = !target.isPlayer || !target.isPlayer() || tgt_is_bot;
      const ratio = useExpandRatio ? (botCfg.expandRatio ?? 0.15) : (reserveRatio ?? botCfg.reserveRatio ?? 0.35);
      const reserve = maxTroops * ratio;

      let troops;
      if (tgt_is_bot) {
        troops = Math.min(myTroops - reserve - botAttackTroopsSent, Math.max(playerTroops(target) * 1.5, 1));
      } else {
        troops = myTroops - reserve;
      }
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
      justSpawned: false,
      lastNukeAttemptTime: 0,
      lastStructureAttemptTime: 0,
      botAttackTroopsSent: 0,
      stats: {
        attacksSent: 0,
        troopsSentTotal: 0,
        structuresBuilt: 0,
        nukesLaunched: 0
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
        const interval = Math.max(300, Math.min(3000, botCfg.tickIntervalMs || 800));
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
          this.justSpawned = true;
        }

        if (inSpawn) {
          if (botCfg.autoSpawn && !this.spawnSent) {
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

        if (this.justSpawned) {
          this.justSpawned = false;
          const initialTroops = Math.floor(playerTroops(myPlayer) / 2);
          if (initialTroops >= 1) {
            sendPacket({ type: "attack", targetID: null, troops: initialTroops });
          }
        }

        this.botAttackTroopsSent = 0;

        if (botCfg.autoEmbargo) this.handleAutoEmbargo(game, myPlayer);
        if (botCfg.autoBuild) this.handleStructures(game, myPlayer);
        if (botCfg.autoNuke) this.handleNukes(game, myPlayer);
        if (botCfg.autoAttack) this.handleAttacks(game, myPlayer);

        updateUI();
      },

      handleAutoSpawn(game) {
        const tile = this.pickSpawnTile(game);
        if (tile == null) return;
        if (this.spawnSent && tile === this.lastSpawnTile) return;

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
        const troopRatio = myTroops / maxTroops;

        const borderingMap = getBorderingPlayerIDs(game, myPlayer);
        const borderingPlayers = Array.from(borderingMap.values()).filter(p => isAlive(p));
        const borderingEnemies = borderingPlayers.filter(p => !isFriendly(myPlayer, p));
        borderingEnemies.sort((a, b) => playerTroops(a) - playerTroops(b));

        const incoming = typeof myPlayer.incomingAttacks === "function" ? myPlayer.incomingAttacks() : [];
        if (incoming.length > 0) {
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
              this.stats.attacksSent++;
              return;
            }
          }
        }

        const borderingBotsWithStructs = borderingEnemies.filter(p => isBot(p) && playerOwnsStructures(p));
        if (borderingBotsWithStructs.length > 0) {
          if (this.attackBots(borderingBotsWithStructs, game, myPlayer, myTroops, maxTroops, expandRatio)) return;
        }

        if (hasBorderWithTerraNullius(game, myPlayer)) {
          const expandReserve = maxTroops * expandRatio;
          if (myTroops > expandReserve) {
            const troopsToSend = Math.floor(myTroops - expandReserve);
            if (troopsToSend >= 1) {
              const ok = sendPacket({ type: "attack", targetID: null, troops: troopsToSend });
              if (ok) {
                this.stats.attacksSent++;
                this.stats.troopsSentTotal += troopsToSend;
                return;
              }
            }
          }
        }

        if (troopRatio >= reserveRatio) {
          const borderingBots = borderingEnemies.filter(p => isBot(p));
          if (borderingBots.length > 0) {
            if (this.attackBots(borderingBots, game, myPlayer, myTroops, maxTroops, expandRatio)) return;
          }
        }

        if (troopRatio < reserveRatio) return;

        for (const enemy of borderingEnemies) {
          const enemyMax = getMaxTroops(game, enemy);
          const enemyTroops = playerTroops(enemy);
          if (enemyTroops < enemyMax * 0.15 && enemyTroops < myTroops * 1.2) {
            const ok = sendLandAttack(game, myPlayer, enemy, myTroops, maxTroops, this.botAttackTroopsSent, reserveRatio);
            if (ok) {
              this.stats.attacksSent++;
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
              this.stats.attacksSent++;
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
              this.stats.attacksSent++;
              return;
            }
          }
        }

        if (borderingEnemies.length === 0) {
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
                  this.stats.attacksSent++;
                  return;
                }
              }
            }
          }
        }
      },

      attackBots(bots, game, myPlayer, myTroops, maxTroops, expandRatio) {
        let attacked = 0;
        bots.sort((a, b) => {
          const aStr = playerOwnsStructures(a);
          const bStr = playerOwnsStructures(b);
          if (aStr !== bStr) return aStr ? -1 : 1;
          const aTiles = typeof a.numTilesOwned === "function" ? Number(a.numTilesOwned()) || 1 : 1;
          const bTiles = typeof b.numTilesOwned === "function" ? Number(b.numTilesOwned()) || 1 : 1;
          return (playerTroops(a) / aTiles) - (playerTroops(b) / bTiles);
        });

        for (const bot of bots) {
          const botId = typeof bot.id === "function" ? bot.id() : bot.id;
          const troops = calcLandAttackTroops(game, myPlayer, bot, myTroops, maxTroops, this.botAttackTroopsSent, expandRatio);
          if (troops < 1) continue;
          const ok = sendPacket({ type: "attack", targetID: String(botId), troops });
          if (ok) {
            attacked++;
            this.botAttackTroopsSent += troops;
            this.stats.attacksSent++;
            this.stats.troopsSentTotal += troops;
          }
        }
        return attacked > 0;
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

        const interior = findInteriorTile(game, myPlayer);

        if (ports < 2 && gold >= 125000) {
          const shore = findOwnedShoreTile(game, myPlayer);
          if (shore != null && sendPacket({ type: "build_unit", unit: "Port", tile: shore })) {
            this.stats.structuresBuilt++;
            return;
          }
        }

        const wantSams = Math.floor(cities * 0.35);
        if (sams < wantSams && gold >= 1500000 && interior != null) {
          if (sendPacket({ type: "build_unit", unit: "SAM Launcher", tile: interior })) {
            this.stats.structuresBuilt++;
            return;
          }
        }

        const wantSilos = Math.min(3, Math.floor(cities / 3));
        if (silos < wantSilos && gold >= 1000000 && interior != null) {
          if (sendPacket({ type: "build_unit", unit: "Missile Silo", tile: interior })) {
            this.stats.structuresBuilt++;
            return;
          }
        }

        if (gold >= 125000 && interior != null) {
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
        if (gold >= 5000000) bombType = "Hydrogen Bomb";
        else if (gold >= 750000) bombType = "Atom Bomb";
        if (!bombType) return;

        const targetTile = findTargetCityTile(target) || findTargetShoreTile(game, target);
        if (targetTile != null) {
          const ok = sendPacket({ type: "build_unit", unit: bombType, tile: targetTile });
          if (ok) {
            this.stats.nukesLaunched++;
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
      }
    };

    function renderTab(panel) {
      panel.style.color = "#ccc";
      panel.style.fontFamily = "monospace";
      panel.style.fontSize = "11px";

      const themeColor = api.cfg?.guiColor || "#00ff66";

      panel.innerHTML = `
        <button id="blon-ext-auto-master-toggle" style="width:100%;padding:9px 0;background:${themeColor};border:none;color:#000;font-weight:700;font-size:11px;border-radius:5px;cursor:pointer;margin-bottom:10px;transition:all 0.2s ease;letter-spacing:0.5px;">
            ENABLE AUTOPLAY (Shift+B)
        </button>

        <div style="background:#0d0d0d;border:1px solid #222;border-radius:6px;padding:8px 10px;margin-bottom:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 8px;font-size:10px;background:#141414;padding:6px;border-radius:4px;">
                <div style="color:#888;">Attacks: <span id="blon-ext-auto-stat-attacks" style="color:#fff;font-weight:700;">0</span></div>
                <div style="color:#888;">Structures: <span id="blon-ext-auto-stat-structs" style="color:#ffcc00;font-weight:700;">0</span></div>
                <div style="color:#888;">Nukes: <span id="blon-ext-auto-stat-nukes" style="color:#ff6666;font-weight:700;">0</span></div>
            </div>
        </div>

        <div style="color:#aaa;font-size:10px;margin-bottom:6px;font-weight:600;">Autoplay Capabilities</div>
        <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:10px;">
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-feat-attack" ${botCfg.autoAttack !== false ? "checked" : ""} style="cursor:pointer;margin:0;">
                <span>Auto-Attack & Wilderness Expansion</span>
            </label>
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-feat-build" ${botCfg.autoBuild !== false ? "checked" : ""} style="cursor:pointer;margin:0;">
                <span>Auto-Build (Cities, SAMs, Silos, Ports)</span>
            </label>
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-feat-nuke" ${botCfg.autoNuke !== false ? "checked" : ""} style="cursor:pointer;margin:0;">
                <span>Auto-Nuke (Atom / Hydrogen Bomb)</span>
            </label>
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-feat-spawn" ${botCfg.autoSpawn !== false ? "checked" : ""} style="cursor:pointer;margin:0;">
                <span>Auto-Spawn (Smart Positioning)</span>
            </label>
            <label style="display:flex;align-items:center;gap:7px;cursor:pointer;color:#aaa;font-size:11px;">
                <input type="checkbox" id="blon-ext-feat-embargo" ${botCfg.autoEmbargo !== false ? "checked" : ""} style="cursor:pointer;margin:0;">
                <span>Auto-Embargo Hostile Nations</span>
            </label>
        </div>

        <div style="color:#aaa;font-size:10px;margin-bottom:6px;font-weight:600;">AI Tuning</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
            <div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-bottom:2px;">
                    <span>Attack Trigger Ratio:</span>
                    <span id="blon-ext-trigger-value" style="color:#00ff66;font-weight:700;">${Math.round((botCfg.triggerRatio ?? 0.55) * 100)}%</span>
                </div>
                <input id="blon-ext-trigger-slider" type="range" min="30" max="90" step="1" value="${Math.round((botCfg.triggerRatio ?? 0.55) * 100)}" style="width:100%;">
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-bottom:2px;">
                    <span>Troop Reserve Floor:</span>
                    <span id="blon-ext-reserve-value" style="color:#00ff66;font-weight:700;">${Math.round((botCfg.reserveRatio ?? 0.35) * 100)}%</span>
                </div>
                <input id="blon-ext-reserve-slider" type="range" min="10" max="70" step="1" value="${Math.round((botCfg.reserveRatio ?? 0.35) * 100)}" style="width:100%;">
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-bottom:2px;">
                    <span>Wilderness Expand Floor:</span>
                    <span id="blon-ext-expand-value" style="color:#00ff66;font-weight:700;">${Math.round((botCfg.expandRatio ?? 0.15) * 100)}%</span>
                </div>
                <input id="blon-ext-expand-slider" type="range" min="5" max="40" step="1" value="${Math.round((botCfg.expandRatio ?? 0.15) * 100)}" style="width:100%;">
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#aaa;margin-bottom:2px;">
                    <span>AI Tick Interval:</span>
                    <span id="blon-ext-interval-value" style="color:#00ff66;font-weight:700;">${botCfg.tickIntervalMs ?? 800}ms</span>
                </div>
                <input id="blon-ext-interval-slider" type="range" min="300" max="3000" step="50" value="${botCfg.tickIntervalMs ?? 800}" style="width:100%;">
            </div>
        </div>
      `;

      const masterBtn = panel.querySelector("#blon-ext-auto-master-toggle");
      if (masterBtn) masterBtn.addEventListener("click", () => Engine.toggle());

      [
        ["blon-ext-feat-attack", "autoAttack"],
        ["blon-ext-feat-build", "autoBuild"],
        ["blon-ext-feat-nuke", "autoNuke"],
        ["blon-ext-feat-spawn", "autoSpawn"],
        ["blon-ext-feat-embargo", "autoEmbargo"],
      ].forEach(([id, prop]) => {
        const cb = panel.querySelector("#" + id);
        if (cb) cb.addEventListener("change", (e) => { botCfg[prop] = e.target.checked; saveBotCfg(); });
      });

      const tSl = panel.querySelector("#blon-ext-trigger-slider");
      const tVal = panel.querySelector("#blon-ext-trigger-value");
      if (tSl) tSl.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v)) { botCfg.triggerRatio = v / 100; if (tVal) tVal.textContent = `${v}%`; saveBotCfg(); }
      });

      const rSl = panel.querySelector("#blon-ext-reserve-slider");
      const rVal = panel.querySelector("#blon-ext-reserve-value");
      if (rSl) rSl.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v)) { botCfg.reserveRatio = v / 100; if (rVal) rVal.textContent = `${v}%`; saveBotCfg(); }
      });

      const eSl = panel.querySelector("#blon-ext-expand-slider");
      const eVal = panel.querySelector("#blon-ext-expand-value");
      if (eSl) eSl.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v)) { botCfg.expandRatio = v / 100; if (eVal) eVal.textContent = `${v}%`; saveBotCfg(); }
      });

      const iSl = panel.querySelector("#blon-ext-interval-slider");
      const iVal = panel.querySelector("#blon-ext-interval-value");
      if (iSl) iSl.addEventListener("input", (e) => {
        const v = parseInt(e.target.value);
        if (!isNaN(v)) { botCfg.tickIntervalMs = v; if (iVal) iVal.textContent = `${v}ms`; saveBotCfg(); }
      });

      updateUI();
    }

    function updateUI() {
      const masterBtn = document.getElementById("blon-ext-auto-master-toggle");
      const isRunning = Engine.running;
      const themeColor = api.cfg?.guiColor || "#00ff66";

      if (masterBtn) {
        masterBtn.textContent = isRunning ? "DISABLE AUTOPLAY" : "ENABLE AUTOPLAY (Shift+B)";
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
