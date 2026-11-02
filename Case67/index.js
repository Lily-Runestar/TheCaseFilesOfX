const chapterButtons = document.querySelectorAll(".chapter-button");
const bookButton = document.getElementById("book-button");
const bookOverlay = document.getElementById("book-overlay");
const closeBookButton = document.getElementById("close-book");
const characterList = document.getElementById("character-list");
const previousPageButton = document.getElementById("previous-page");
const nextPageButton = document.getElementById("next-page");
const pageNumber = document.getElementById("page-number");
const settingsButton = document.getElementById("settings-button");
const settingsOverlay = document.getElementById("settings-overlay");
const closeSettingsButton = document.getElementById("close-settings");
const keyBindingsElement = document.getElementById("key-bindings");
const settingsStatus = document.getElementById("settings-status");
const resetProgressButton = document.getElementById("reset-progress");
const menuStatus = document.getElementById("menu-status");

const DEFAULT_BINDINGS = DEFAULT_PLAYER_BINDINGS;
const BINDING_LABELS = PLAYER_BINDING_LABELS;
const BINDINGS_STORAGE_KEY = PLAYER_BINDINGS_STORAGE_KEY;
const PROGRESS_STORAGE_KEY = "sixtySevenProgress";
const UNLOCK_ALL_CODE = "six-seven";
let enteredCode = "";

function createDefaultProgress() {
  return {
    chapters: {
      "1": "UNLOCKED",
      "2": "LOCKED",
      "3": "INCOMPLETE",
      "4": "INCOMPLETE",
      "5": "INCOMPLETE",
      "6": "INCOMPLETE",
      "7": "INCOMPLETE"
    },
    characters: {
      "1": "UNLOCKED",
      "2": "LOCKED",
      "3": "INCOMPLETE",
      "4": "INCOMPLETE",
      "5": "INCOMPLETE",
      "-1": "INCOMPLETE"
    },
    keys: {
      summon: "LOCKED"
    }
  };
}

let completionState = createDefaultProgress();

function loadProgress() {
  try {
    const storedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (storedProgress === null) {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completionState));
    } else {
      const savedProgress = JSON.parse(storedProgress);
      for (const section of ["chapters", "characters", "keys"]) {
        const savedSection = savedProgress[section];
        if (!savedSection || typeof savedSection !== "object") continue;
        for (const [id, status] of Object.entries(savedSection)) {
          if (
            Object.hasOwn(completionState[section], id) &&
            ["UNLOCKED", "LOCKED", "INCOMPLETE"].includes(status)
          ) {
            completionState[section][id] = status;
          }
        }
      }
    }

    if (localStorage.getItem("chapter1Completed") === "true") {
      completionState.chapters["2"] = "UNLOCKED";
      completionState.characters["2"] = "UNLOCKED";
      if (saveProgress()) {
        localStorage.removeItem("chapter1Completed");
      }
    }
    if (
      completionState.chapters["4"] === "UNLOCKED" &&
      completionState.keys.summon !== "UNLOCKED"
    ) {
      completionState.keys.summon = "UNLOCKED";
      saveProgress();
    }
  } catch (error) {
    console.error("Saved game progress could not be loaded.", error);
  }

  applyChapterState();
  renderBook();
  renderKeyBindings();
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completionState));
    return true;
  } catch (error) {
    console.error("Game progress could not be saved.", error);
    return false;
  }
}

function unlockAllProgress() {
  const unlockedProgress = {
    chapters: Object.fromEntries(
      Object.keys(completionState.chapters).map((chapter) => [chapter, "UNLOCKED"])
    ),
    characters: Object.fromEntries(
      Object.keys(completionState.characters).map((character) => [character, "UNLOCKED"])
    ),
    keys: Object.fromEntries(
      Object.keys(completionState.keys).map((key) => [key, "UNLOCKED"])
    )
  };

  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(unlockedProgress));
    localStorage.removeItem("chapter1Completed");
    completionState = unlockedProgress;
    applyChapterState();
    renderBook();
    renderKeyBindings();
    menuStatus.textContent = "ALL CHAPTERS AND CHARACTERS UNLOCKED.";
  } catch (error) {
    console.error("All chapters and characters could not be unlocked.", error);
    menuStatus.textContent = "COULD NOT SAVE THE UNLOCKED PROGRESS.";
  }
}

let currentPage = 0;
const charactersPerPage = 1;
let capturingBinding = null;

function getKeyBindings() {
  try {
    const saved = JSON.parse(localStorage.getItem(BINDINGS_STORAGE_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(DEFAULT_BINDINGS).map(([action, defaultKey]) => [
        action,
        typeof saved[action] === "string" ? saved[action] : defaultKey
      ])
    );
  } catch (error) {
    console.warn("Key bindings could not be loaded; using defaults.", error);
    return { ...DEFAULT_BINDINGS };
  }
}

function saveKeyBindings(bindings) {
  try {
    localStorage.setItem(BINDINGS_STORAGE_KEY, JSON.stringify(bindings));
    settingsStatus.textContent = "Key binding saved.";
  } catch (error) {
    console.error("Key bindings could not be saved.", error);
    settingsStatus.textContent = "Could not save key binding in this browser.";
  }
}

function formatBinding(key) {
  if (!key) return "?";
  if (key === " ") return "SPACE";
  return key.length === 1 ? key.toUpperCase() : key;
}

function isBindingUnlocked(action) {
  if (action === "previous" || action === "next") {
    return completionState.chapters["2"] === "UNLOCKED";
  }
  if (action === "summon") {
    return completionState.keys.summon === "UNLOCKED";
  }
  return true;
}

function renderKeyBindings() {
  if (!keyBindingsElement) return;
  const bindings = getKeyBindings();
  keyBindingsElement.innerHTML = "";

  Object.entries(BINDING_LABELS).forEach(([action, label]) => {
    const unlocked = isBindingUnlocked(action);
    const row = document.createElement("div");
    row.className = "binding-row";

    const actionLabel = document.createElement("span");
    actionLabel.textContent = unlocked ? label : "???";
    row.appendChild(actionLabel);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = formatBinding(bindings[action]);
    button.setAttribute(
      "aria-label",
      unlocked
        ? `${label}: ${formatBinding(bindings[action])}. Press to change.`
        : `Locked action: ${formatBinding(bindings[action])}. Press to change its key.`
    );
    button.addEventListener("click", () => {
      capturingBinding = action;
      settingsStatus.textContent = `Press a key for ${unlocked ? label : "this locked action"}.`;
      button.textContent = "...";
      button.focus();
    });
    row.appendChild(button);
    keyBindingsElement.appendChild(row);
  });
}

function openSettings() {
  settingsStatus.textContent = "";
  renderKeyBindings();
  settingsOverlay.hidden = false;
  closeSettingsButton.focus();
}

function closeSettings() {
  capturingBinding = null;
  settingsOverlay.hidden = true;
  settingsButton.focus();
}

function applyChapterState() {
  chapterButtons.forEach((button) => {
    const chapter = button.dataset.chapter;
    const unlocked = completionState.chapters[chapter] === "UNLOCKED";

    button.disabled = !unlocked;
    button.classList.toggle("unlocked", unlocked);

    button.onclick = unlocked
      ? () => {
          const destination = chapter === "1"
            ? "Chapter_1/Chapter1_Enter.html"
            : chapter === "2"
              ? "Chapter_2/Chapter2_Enter.html"
            : chapter === "3"
              ? "Chapter_3/Chapter3_Enter.html"
            : chapter === "4"
              ? "Chapter_4/Chapter4_Enter.html"
            : chapter === "5"
              ? "Chapter_5/Chapter5_Enter.html"
            : chapter === "6"
              ? "Chapter_6/Chapter6_Enter.html"
            : chapter === "7"
              ? "Chapter_7/Chapter7_Enter.html"
            : `Chapter_${chapter}/Chapter${chapter}.html`;
          window.location.href = destination;
        }
      : null;
  });
}

function getBookEntries() {
  return Object.entries(completionState.characters)
    .filter(([, status]) => ["UNLOCKED", "LOCKED", "INCOMPLETE"].includes(status))
    .map(([number, status]) => ({
      number,
      locked: status !== "UNLOCKED"
    }));
}

function renderBook() {
  const entries = getBookEntries();

  const totalPages = Math.max(
    1,
    Math.ceil(entries.length / charactersPerPage)
  );

  currentPage = Math.max(
    0,
    Math.min(currentPage, totalPages - 1)
  );

  const start = currentPage * charactersPerPage;
  const visibleEntries = entries.slice(
    start,
    start + charactersPerPage
  );

  characterList.innerHTML = "";

  if (visibleEntries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "character locked";
    empty.textContent = "?";
    characterList.appendChild(empty);
  } else {
    visibleEntries.forEach((entry) => {
      const element = document.createElement("div");
      element.className = `character${entry.locked ? " locked" : ""}`;

      if (entry.locked) {
        element.textContent = "?";
        element.setAttribute("aria-label", "Locked character");
      } else {
        const image = document.createElement("img");

        image.src =
          `Media/Player/${entry.number}/${entry.number}_Still.png`;

        image.alt = `Character ${entry.number}`;
        image.loading = "lazy";

        image.addEventListener("error", () => {
          image.remove();
          element.textContent = entry.number;
        });

        element.appendChild(image);
        element.setAttribute(
          "aria-label",
          `Character ${entry.number}`
        );
      }

      characterList.appendChild(element);
    });
  }

  pageNumber.textContent = `${currentPage + 1} / ${totalPages}`;
  previousPageButton.disabled = currentPage === 0;
  nextPageButton.disabled = currentPage >= totalPages - 1;
}

function openBook() {
  currentPage = 0;
  renderBook();
  bookOverlay.hidden = false;
  closeBookButton.focus();
}

function closeBook() {
  bookOverlay.hidden = true;
  bookButton.focus();
}

bookButton.addEventListener("click", openBook);
closeBookButton.addEventListener("click", closeBook);

bookOverlay.addEventListener("click", (event) => {
  if (event.target === bookOverlay) {
    closeBook();
  }
});

previousPageButton.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    renderBook();
  }
});

nextPageButton.addEventListener("click", () => {
  const totalPages = Math.max(
    1,
    Math.ceil(getBookEntries().length / charactersPerPage)
  );

  if (currentPage < totalPages - 1) {
    currentPage++;
    renderBook();
  }
});

document.addEventListener("keydown", (event) => {
  if (!capturingBinding && !event.repeat && event.key.length === 1) {
    enteredCode = (enteredCode + event.key.toLowerCase()).slice(-UNLOCK_ALL_CODE.length);
    if (enteredCode === UNLOCK_ALL_CODE) {
      enteredCode = "";
      event.preventDefault();
      unlockAllProgress();
      return;
    }
  } else if (!capturingBinding) {
    enteredCode = "";
  }

  if (capturingBinding) {
    event.preventDefault();
    if (event.key === "Escape") {
      capturingBinding = null;
      settingsStatus.textContent = "Key binding change cancelled.";
      renderKeyBindings();
      return;
    }
    if (event.key.length !== 1 && event.key !== " ") {
      settingsStatus.textContent = "Choose a single key.";
      return;
    }

    const bindings = getKeyBindings();
    const duplicate = Object.entries(bindings).find(
      ([action, key]) => action !== capturingBinding && key.toLowerCase() === event.key.toLowerCase()
    );
    if (duplicate) {
      settingsStatus.textContent = `That key is already assigned to ${BINDING_LABELS[duplicate[0]]}.`;
      return;
    }
    bindings[capturingBinding] = event.key.toLowerCase();
    capturingBinding = null;
    saveKeyBindings(bindings);
    renderKeyBindings();
    return;
  }

  if (event.key === "Escape" && !bookOverlay.hidden) {
    closeBook();
  } else if (event.key === "Escape" && !settingsOverlay.hidden) {
    closeSettings();
  }
});

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) closeSettings();
});
resetProgressButton.addEventListener("click", () => {
  capturingBinding = null;
  try {
    localStorage.removeItem("chapter1Completed");
    completionState = createDefaultProgress();
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completionState));
    applyChapterState();
    renderBook();
    renderKeyBindings();
    settingsStatus.textContent = "GAME PROGRESS RESET. CHAPTER 1 IS AVAILABLE.";
  } catch (error) {
    console.error("Game progress could not be reset.", error);
    settingsStatus.textContent = "COULD NOT RESET GAME PROGRESS IN THIS BROWSER.";
  }
});

loadProgress();
