const PLAYER_BINDINGS_STORAGE_KEY = "sixtySevenKeyBindings";
const PLAYER_CONTROLS_SCRIPT_URL = new URL(document.currentScript.src, window.location.href);

const DEFAULT_PLAYER_BINDINGS = Object.freeze({
  left: "a",
  right: "d",
  jump: "w",
  attack: " ",
  previous: "q",
  next: "e",
  summon: "s",
  number1: "1",
  number2: "2",
  number3: "3",
  number4: "4",
  number5: "5"
});

const PLAYER_BINDING_LABELS = Object.freeze({
  left: "Move Left",
  right: "Move Right",
  jump: "Jump",
  attack: "Attack",
  previous: "Previous Character",
  next: "Next Character",
  summon: "Summon",
  number1: "Select Cycle Slot 1",
  number2: "Select Cycle Slot 2",
  number3: "Select Cycle Slot 3",
  number4: "Select Cycle Slot 4",
  number5: "Select Cycle Slot 5"
});

const PLAYER_SETTINGS_KEY = "sixtySevenPlayerSettings";
const PLAYER_SKINS = Object.freeze({
  "-1": Object.freeze(["Standard"]),
  "1": Object.freeze(["Standard", "Christmas"]),
  "2": Object.freeze(["Standard"]),
  "3": Object.freeze(["Standard", "LNY2024"]),
  "4": Object.freeze(["Standard", "Halloween"]),
  "5": Object.freeze(["Standard"])
});
const DEFAULT_PLAYER_SETTINGS = Object.freeze({
  cycle: [-1, 1, 2, 3, 4],
  skins: { "-1": "Standard", "1": "Standard", "2": "Standard", "3": "Standard", "4": "Standard", "5": "Standard" },
  difficulty: "easy",
  hell: false
});

function loadPlayerSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYER_SETTINGS_KEY) || "{}");
    const cycle = Array.isArray(saved.cycle) ? saved.cycle.filter((n) => [-1, 1, 2, 3, 4, 5].includes(n)) : [];
    const savedSkins = saved.skins && typeof saved.skins === "object" ? saved.skins : {};
    const skins = { ...DEFAULT_PLAYER_SETTINGS.skins };
    for (const number of Object.keys(PLAYER_SKINS)) {
      const savedSkin = savedSkins[number] ?? savedSkins[String(number)];
      if (PLAYER_SKINS[number].includes(savedSkin)) skins[number] = savedSkin;
    }
    return {
      cycle: cycle.length ? [...cycle] : [...DEFAULT_PLAYER_SETTINGS.cycle],
      skins,
      difficulty: ["easy", "medium", "hard"].includes(saved.difficulty) ? saved.difficulty : "easy",
      hell: saved.hell === true
    };
  } catch (error) {
    console.warn("Player settings could not be loaded.", error);
    return { cycle: [...DEFAULT_PLAYER_SETTINGS.cycle], skins: { ...DEFAULT_PLAYER_SETTINGS.skins }, difficulty: "easy", hell: false };
  }
}

function savePlayerSettings(settings) {
  localStorage.setItem(PLAYER_SETTINGS_KEY, JSON.stringify(settings));
}

function getSelectedPlayableNumbers(unlockedNumbers = []) {
  const unlocked = new Set([1, ...unlockedNumbers.map(Number)]);
  const selected = loadPlayerSettings().cycle.filter((number, index, cycle) =>
    unlocked.has(number) && cycle.indexOf(number) === index
  );
  return selected.length ? selected : [1];
}

function getStartingHealth() {
  const queryHealth = Number(new URLSearchParams(window.location.search).get("hp"));
  if (Number.isInteger(queryHealth) && queryHealth > 0) return Math.min(queryHealth, 5);
  const settings = loadPlayerSettings();
  return settings.hell ? 1 : { easy: 5, medium: 4, hard: 3 }[settings.difficulty] || 5;
}

function playerSpritePath(number, frameName) {
  const settings = loadPlayerSettings();
  const availableSkins = PLAYER_SKINS[String(number)] || PLAYER_SKINS["1"];
  const selectedSkin = settings.skins[String(number)];
  const skin = availableSkins.includes(selectedSkin) ? selectedSkin : "Standard";
  return new URL(`../Media/Player/${number}/${skin}/${number}_${frameName}.png`, PLAYER_CONTROLS_SCRIPT_URL).href;
}

const PLAYER_PROFILE = Object.freeze({
  width: 44, height: 78, scale: 0.56, speed: 300,
  jumpPower: 798.4, number4JumpPower: 1050, gravity: 1900,
  floorHeight: 78, animationDelay: 140
});

const PLAYER_MOVEMENT_LOCKS = Object.freeze({
  attack: 0.36,
  dash: 0.24,
  bladeRecall: 3,
  number1SwingHold: 0.35,
  number1HitHold: 0.7,
  number4JumpLock: 0.36
});

function getPlayerMovementLock(state = {}) {
  return {
    finished: state.finished === true,
    attacking: Number(state.attackTime || 0) > 0,
    dashing: Number(state.dashTime || 0) > 0,
    recallingBlade: state.recallingBlade === true,
    hitHeld: Number(state.number1Hold || 0) > 0
  };
}

function canPlayerMove(state = {}) {
  return !Object.values(getPlayerMovementLock(state)).some(Boolean);
}

const PLAYER_ATTACK_DAMAGE = Object.freeze({
  "-1": Object.freeze({ dash: 2 }),
  "1": Object.freeze({ space: 3, melee: 3, hold: 0.7 }),
  "2": Object.freeze({ space: 1, melee: 1 }),
  "3": Object.freeze({ space: 2, arrow: 2 }),
  "4": Object.freeze({ jump: 1, space: 2, melee: 2 }),
  "5": Object.freeze({ space: 3, melee: 3, outbound: 1, returning: 3, blade: 3 })
});

const PLAYER_ANIMATION_FRAMES = Object.freeze({
  "-1": Object.freeze({ STILL: ["Still"], WALK: ["Walk"], ATTACK: ["Charge"] }),
  "1": Object.freeze({ STILL: ["Still"], WALK: ["Still", "WalkF1", "WalkF2", "WalkF1", "WalkF2"], JUMP: ["Jump"], FALL: ["Fall"], ATTACK: ["Still", "SwingF1", "SwingF2"] }),
  "2": Object.freeze({ STILL: ["Still"], WALK: ["Still", "WalkF1", "WalkF2", "WalkF1", "WalkF2"], JUMP: ["Jump"], FALL: ["Fall"], ATTACK: ["Still", "SwingF1", "SwingF2"] }),
  "3": Object.freeze({ STILL: ["Still"], WALK: ["Walk"], JUMP: ["Jump"], FALL: ["Fall"], ATTACK: ["Swing", "Release"] }),
  "4": Object.freeze({ STILL: ["Still"], WALK: ["WalkF1", "WalkF2"], JUMP: ["Jump"], FALL: ["Sweep", "Sweep"], ATTACK: ["Sweep", "Sweep", "Sweep", "Sweep"] }),
  "5": Object.freeze({ STILL: ["Still"], WALK: ["Walk", "Still", "WalkAlt", "StillAlt"], JUMP: ["Still", "StillAlt"], FALL: ["Still", "StillAlt"], ATTACK: ["StillAlt", "StillAlt"] })
});

const PLAYER_CHARACTER_BEHAVIOR = Object.freeze({
  "-1": Object.freeze({ attackLocked: true, dashSpeed: 900, dashDuration: 0.24, invulnerable: 0.5 }),
  "1": Object.freeze({ attackLocked: true, swingHold: 0.35, hitHold: 0.7 }),
  "2": Object.freeze({ attackLocked: true }),
  "3": Object.freeze({ attackLocked: true, projectileSpeed: 620, projectileLifetime: 1.3 }),
  "4": Object.freeze({ attackLocked: true, mirrorInAir: true, mirrorOnAttack: true, jumpPower: 1050, fallFrameRate: 70 }),
  "5": Object.freeze({ attackLocked: true, projectileSpeed: 300, recallSpeed: 480, recallDelay: 0.45, travelOnRecall: true })
});

function getPlayerBehavior(number) {
  return PLAYER_CHARACTER_BEHAVIOR[String(number)] || PLAYER_CHARACTER_BEHAVIOR["1"];
}

function createPlayerProjectile(number, x, y, direction) {
  if (Number(number) === 3) return { kind: "arrow", x: x + direction * 45, y: y + 48, direction, elapsed: 0 };
  if (Number(number) === 5) return { kind: "blade", x: x + direction * 42, y: y + 50, direction, elapsed: 0, phase: "outbound", phaseTime: 0, rotation: 0, outboundHit: false, returnHit: false };
  return null;
}

function updatePlayerProjectileState(projectile, dt, playerX, width) {
  if (!projectile) return { projectile: null, hit: null };
  projectile.elapsed += dt;
  projectile.phaseTime += dt;
  if (projectile.kind === "arrow") {
    projectile.x += projectile.direction * getPlayerBehavior(3).projectileSpeed * dt;
    if (projectile.elapsed >= getPlayerBehavior(3).projectileLifetime || projectile.x < 0 || projectile.x > width) return { projectile: null, hit: null, expired: true };
    return { projectile, hit: projectile.phase === "hit" ? "arrow" : null };
  }
  if (projectile.phase === "outbound") {
    projectile.x += projectile.direction * getPlayerBehavior(5).projectileSpeed * dt;
    if (projectile.phaseTime >= 3) { projectile.phase = "paused"; projectile.phaseTime = 0; }
  } else if (projectile.phase === "paused") {
    if (projectile.phaseTime >= getPlayerBehavior(5).recallDelay) { projectile.phase = "returning"; projectile.phaseTime = 0; }
  } else {
    projectile.x += Math.sign(playerX - projectile.x) * getPlayerBehavior(5).recallSpeed * dt;
    projectile.rotation += 540 * dt;
    if (Math.abs(playerX - projectile.x) < 30) return { projectile: null, hit: null, recalled: true };
  }
  return { projectile, hit: null };
}

function getPlayerHorizontalFlip(number, facing, grounded, attacking, now) {
  const behavior = getPlayerBehavior(number);
  if (Number(number) === 4 && behavior.mirrorOnAttack && (!grounded || attacking)) return Math.floor(now / 70) % 2 === 0 ? -1 : 1;
  return 1;
}

function getPlayerRecallPosition(number, projectile, playerState) {
  if (Number(number) !== 5 || !projectile) return null;
  return { x: projectile.x, y: projectile.y, grounded: false, projectile: null };
}

function getPlayerActionDuration(number, action = "attack") {
  if (action === "swing" && Number(number) === 1) return PLAYER_MOVEMENT_LOCKS.number1SwingHold;
  if (action === "swing") return PLAYER_MOVEMENT_LOCKS.attack;
  if (action === "dash") return PLAYER_MOVEMENT_LOCKS.dash;
  if (action === "bladeRecall") return PLAYER_MOVEMENT_LOCKS.bladeRecall;
  if (Number(number) === 1 && action === "hit") return PLAYER_MOVEMENT_LOCKS.number1HitHold;
  if (Number(number) === 4 && action === "jumpAttack") return PLAYER_MOVEMENT_LOCKS.number4JumpLock;
  return PLAYER_MOVEMENT_LOCKS.attack;
}

function getPlayerDamage(number, action = "space") {
  const damage = PLAYER_ATTACK_DAMAGE[String(number)] || {};
  return damage[action] ?? damage.space ?? damage.melee ?? 1;
}

function getPlayerFrames(number, state, attackKind = "space") {
  const frames = PLAYER_ANIMATION_FRAMES[String(number)] || PLAYER_ANIMATION_FRAMES["1"];
  if (state === "WALK") return frames.WALK;
  if (state === "SWING" || state === "ATTACK") {
    if (Number(number) === 3) return ["Swing", "Release"];
    if (Number(number) === 4) return attackKind === "jump" ? ["Jump"] : ["Sweep", "Sweep", "Sweep", "Sweep"];
    if (Number(number) === -1) return ["Charge"];
    return frames.ATTACK;
  }
  if (Number(number) === 5 && state === "STILL") return ["Still"];
  return frames[state] || ["Still"];
}

function getPlayerAnimationFrame(number, state, attacking, alternate = 0) {
  const normalizedState = attacking ? "SWING" : state;
  const frames = getPlayerFrames(number, normalizedState);
  return frames[alternate % frames.length] || "Still";
}

function loadPlayerBindings() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLAYER_BINDINGS_STORAGE_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(DEFAULT_PLAYER_BINDINGS).map(([action, defaultKey]) => [
        action,
        typeof saved[action] === "string" ? saved[action] : defaultKey
      ])
    );
  } catch (error) {
    console.warn("Key bindings could not be loaded; using defaults.", error);
    return { ...DEFAULT_PLAYER_BINDINGS };
  }
}

function loadKeyBindings() {
  return loadPlayerBindings();
}
