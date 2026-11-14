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
        intro: "12 days after Christmas, a darkness setled over the forest again. Heading inside, a tall figure stands, waiting...  -X",
        victory: "The darkness lifts once more. The Christmas Nightmare is gone for now.  -X",
        defeat: "By some miracle, life courses through my veins. But the Christmas Nightmare remains, waiting...  -X"
      },
      hell: {
        intro: "The forest is darker than before, and hiding at the center, a beast of unknown origin hides in the dark, smiling, looking for a kill...  -X",
        victory: "The darkness lifts once more, this time for good, no poor people will die to this entity.  -X",
        defeat: "The entity left me, enjoying the hunt too much to finish me off... \"Come back when you are stronger\".  -X"
      }
    },
    halloween: {
      normal: {
        intro: "Inside the forest I was told a tree was killing inocent people. So into this forest I shall go, to investigate further  -X",
        victory: "The Blood Tree's eyes have gone dark. The branches fall still, and a path out of the forest opens. The murders are done.  -X",
        defeat: "The forest closed around me as I ran. The tree's eyes remain fixed on the path.  -X"
      },
      hell: {
        intro: "The forest is soaked in blood, and the massacre has started up again. Something bloodsoaked is hiding and must be stopped.  -X",
        victory: "The tree returned, covered in the blood, but it has been put to rest.  -X",
        defeat: "The tree attempted to drag me down into the dirt, but I ran fast... But it is still there, waiting...  -X"
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
  title.textContent = won ? "CASE COMPLETE" : "CASE ENDED";
  story.textContent = won ? outcome.victory : outcome.defeat;
  if (won && new URLSearchParams(window.location.search).get("save") === "failed") {
    story.textContent += "\n\nYour victory could not be saved. Check browser storage and try again.";
  }
  action.textContent = "Return to Case Selection";
  action.href = "../CaseSelection.html";
  document.title = `${variantName}${name} — ${won ? "Complete" : "Ended"}`;
})();
