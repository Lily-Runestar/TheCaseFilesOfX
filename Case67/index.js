const chapterButtons = document.querySelectorAll(".chapter-button");
const menuStatus = document.getElementById("menu-status");
const returnButton = document.getElementById("return-button");
const progressKey = "sixtySevenProgress";

function createDefaultProgress() {
  return {
    chapters: {
      "1": "UNLOCKED",
      "2": "LOCKED",
      "3": "LOCKED",
      "4": "LOCKED",
      "5": "LOCKED",
      "6": "LOCKED",
      "7": "LOCKED"
    },
    characters: {
      "1": "UNLOCKED",
      "2": "LOCKED",
      "3": "LOCKED",
      "4": "LOCKED",
      "5": "LOCKED",
      "-1": "LOCKED"
    },
    keys: { summon: "LOCKED" }
  };
}

function loadProgress() {
  const defaults = createDefaultProgress();
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
    if (saved && typeof saved === "object") {
      for (const section of ["chapters", "characters", "keys"]) {
        if (!saved[section] || typeof saved[section] !== "object") continue;
        for (const [id, status] of Object.entries(saved[section])) {
          if (Object.hasOwn(defaults[section], id)) defaults[section][id] = status;
        }
      }
    }
  } catch (error) {
    console.error("Game progress could not be loaded.", error);
  }
  defaults.characters["1"] = "UNLOCKED";
  defaults.chapters["1"] = "UNLOCKED";
  for (let chapter = 2; chapter <= 7; chapter++) {
    const previousChapter = defaults.chapters[String(chapter - 1)];
    if (previousChapter !== "UNLOCKED") {
      defaults.chapters[String(chapter)] = "LOCKED";
    }
  }

  if (localStorage.getItem("chapter1Completed") === "true") {
    defaults.chapters["2"] = "UNLOCKED";
    defaults.characters["2"] = "UNLOCKED";
    localStorage.removeItem("chapter1Completed");
  }
  localStorage.setItem(progressKey, JSON.stringify(defaults));
  return defaults;
}

const chapterPages = {
  "1": "Chapter_1/Chapter1_Enter.html",
  "2": "Chapter_2/Chapter2_Enter.html",
  "3": "Chapter_3/Chapter3_Enter.html",
  "4": "Chapter_4/Chapter4_Enter.html",
  "5": "Chapter_5/Chapter5_Enter.html",
  "6": "Chapter_6/Chapter6_Enter.html",
  "7": "Chapter_7/Chapter7_Enter.html"
};

function applyChapterState(progress) {
  chapterButtons.forEach((button) => {
    const chapter = button.dataset.chapter;
    const unlocked = progress.chapters[chapter] === "UNLOCKED";
    button.disabled = !unlocked;
    button.onclick = unlocked ? () => {
      window.location.href = chapterPages[chapter] || "";
    } : null;
  });
}

applyChapterState(loadProgress());

returnButton.addEventListener("click", () => {
  window.location.href = "../CaseSelection.html";
});
