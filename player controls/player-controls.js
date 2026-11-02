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
  "3": Object.freeze(["Standard"]),
  "4": Object.freeze(["Standard"]),
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
      if (PLAYER_SKINS[number].includes(savedSkins[number])) skins[number] = savedSkins[number];
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
  width: 44,
  height: 78,
  scale: 0.56,
  speed: 320,
  jumpPower: 798.4,
  number4JumpPower: 1050,
  gravity: 1900
});

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
