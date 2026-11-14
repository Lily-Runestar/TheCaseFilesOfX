(() => {
  const page = document.querySelector("main");
  const title = document.getElementById("story-title");
  const story = document.getElementById("story-text");
  const action = document.getElementById("story-action");
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
    title.textContent = `${variantName}${name}`;
    story.textContent = outcome.intro;
    action.textContent = "Begin Case";
    action.href = `index.html${window.location.search}`;
    document.title = `${variantName}${name} — Introduction`;
    return;
  }

  const won = new URLSearchParams(window.location.search).get("result") === "victory";
  title.textContent = "";
  story.textContent = "";
  if (won && new URLSearchParams(window.location.search).get("save") === "failed") {
    story.textContent = "The case result could not be saved. Check browser storage and try again.";
  }
  action.textContent = "Return to Case Selection";
  action.href = "../CaseSelection.html";
  document.title = `${variantName}${name} — Conclusion`;
})();
