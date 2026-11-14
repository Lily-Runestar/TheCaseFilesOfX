(() => {
  const page = document.querySelector("main");
  const title = document.getElementById("story-title");
  const story = document.getElementById("story-text");
  const action = document.getElementById("story-action");
  const fastButton = document.getElementById("story-fast");
  const menuButton = document.getElementById("story-menu");
  const { case: caseName, variant, screen } = page.dataset;
  const name = caseName === "christmas" ? "Christmas Nightmare" : "Halloween Massacre";
  const variantName = variant === "hell" ? "Hell " : "";
  const stories = {
    christmas: {
      normal: {
        intro: "12 days after Christmas, a darkness setled over the forest again. Heading inside, a tall figure stands, waiting...  -X"
      },
      hell: {
        intro: "The forest is darker than before, and hiding at the center, a beast of unknown origin hides in the dark, smiling, looking for a kill...  -X"
      }
    },
    halloween: {
      normal: {
        intro: "Inside the forest I was told a tree was killing inocent people. So into this forest I shall go, to investigate further  -X"
      },
      hell: {
        intro: "The forest is soaked in blood, and the massacre has started up again. Something bloodsoaked is hiding and must be stopped.  -X"
      }
    }
  };
  const outcome = stories[caseName][variant];

  if (screen === "intro") {
    title.hidden = true;
    story.textContent = "";
    action.textContent = "Continue";
    action.href = `index.html${window.location.search}`;
    document.title = `${variantName}${name} — Introduction`;

    const text = outcome.intro;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let typingTimer;
    let isFast = false;

    function typeNextCharacter() {
      if (index >= text.length) return;
      story.textContent += text[index++];
      if (index < text.length) {
        const delay = text[index - 1] === "\n" ? 280 : 45;
        typingTimer = window.setTimeout(typeNextCharacter, delay / (isFast ? 10 : 1));
      }
    }

    if (reducedMotion) {
      story.textContent = text;
      index = text.length;
    } else {
      typeNextCharacter();
    }
    fastButton.addEventListener("click", () => {
      isFast = true;
      window.clearTimeout(typingTimer);
      typeNextCharacter();
    });
    return;
  }

  const won = new URLSearchParams(window.location.search).get("result") === "victory";
  if (!won) {
    document.querySelector("body").classList.add("death-screen");
    title.textContent = "YOU DIED";
    story.hidden = true;
    action.textContent = "Restart";
    action.href = "index.html";
    menuButton.hidden = false;
    menuButton.textContent = "Main Menu";
    menuButton.href = "../CaseSelection.html";
    document.title = `${variantName}${name} — You Died`;
    return;
  }

  title.hidden = true;
  story.textContent = "";
  if (new URLSearchParams(window.location.search).get("save") === "failed") {
    story.textContent = "The case result could not be saved. Check browser storage and try again.";
  }
  action.textContent = "Return to Case Selection";
  action.href = "../CaseSelection.html";
  menuButton.hidden = true;
  document.title = `${variantName}${name} — Conclusion`;
})();
