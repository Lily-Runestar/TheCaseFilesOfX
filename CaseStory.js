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
        intro: "The town's Christmas lights still glow, but no one is celebrating. Nicholas Renegade has taken over the frozen streets. Find a way through the storm and stop him before Christmas night ends.",
        victory: "The storm has finally gone quiet. Nicholas Renegade is defeated, and the town can see its Christmas lights again.",
        defeat: "The cold swallowed the last of your strength. Nicholas Renegade still rules the night."
      },
      hell: {
        intro: "The lights have gone dark. Nicholas Renegade is waiting in the heart of a relentless blizzard. You have one heart and no second chance.",
        victory: "Even in the endless blizzard, Nicholas Renegade has fallen. The frozen night loosens its grip.",
        defeat: "The blizzard claims you. Nicholas Renegade remains, untouched by the cold."
      }
    },
    halloween: {
      normal: {
        intro: "Deep in the Halloween woods, a blood-red gaze watches from inside an ancient tree. Its branches are moving, and the path behind you has disappeared. Face the Blood Tree and escape the forest.",
        victory: "The Blood Tree's eyes have gone dark. The branches fall still, and a path out of the forest opens.",
        defeat: "The forest closes around you. The Blood Tree's red eyes remain fixed on the path."
      },
      hell: {
        intro: "The forest is soaked in blood, and the Blood Tree has awakened. Its branches will not rest. You have one heart; make every move count.",
        victory: "The Blood Tree has fallen in the blood-soaked forest. For one quiet moment, the woods are still.",
        defeat: "The Blood Tree's branches drag you into the dark. The forest keeps its secret."
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
