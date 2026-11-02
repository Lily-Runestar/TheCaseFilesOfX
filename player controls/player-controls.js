const PLAYER_BINDINGS_STORAGE_KEY = "sixtySevenKeyBindings";

const DEFAULT_PLAYER_BINDINGS = Object.freeze({
  left: "a",
  right: "d",
  jump: "w",
  attack: " ",
  previous: "q",
  next: "e",
  summon: "s"
});

const PLAYER_BINDING_LABELS = Object.freeze({
  left: "Move Left",
  right: "Move Right",
  jump: "Jump",
  attack: "Attack",
  previous: "Previous Character",
  next: "Next Character",
  summon: "Summon"
});

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

  function loadKeyBindings() {
    return loadPlayerBindings();
  }
}
