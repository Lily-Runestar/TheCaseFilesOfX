(function () {
  const script = document.currentScript;
  const scriptUrl = new URL(script.src, document.baseURI);
  const mediaUrl = new URL("Media/", scriptUrl);

  if (!document.querySelector('link[href*="media-ui.css"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("media-ui.css", scriptUrl).href;
    document.head.appendChild(stylesheet);
  }

  document.documentElement.classList.add("media-scaled");
  document.body.classList.add("media-scaled");

  const path = window.location.pathname.replace(/\\/g, "/");
  const basePath = scriptUrl.pathname.replace(/\/[^/]*$/, "/");
  const isMainMenu = path === basePath || path === `${basePath}index.html`;
  document.body.classList.toggle("menu-main", isMainMenu);
  document.documentElement.style.setProperty("--media-menu-bg", `url("${new URL("BG.png", mediaUrl)}")`);
  document.documentElement.style.setProperty("--media-main-menu-bg", `url("${new URL("MainMenuBG.png", mediaUrl)}")`);

  const buttonImages = {
    back: "Back.png",
    case: "CaseSelect.png",
    caseselection: "CaseSelect.png",
    controls: "Controls.png",
    notebook: "Notebook.png",
    easy: "Easy.png",
    medium: "Medium.png",
    hard: "Hard.png",
    characterselection: "CharacterSkinSelect.png",
    characterskinselection: "CharacterSkinSelect.png",
    casesixtyseven: "Case67.png",
    case67: "Case67.png",
    casechristmasnightmare: "CaseChristmasNightmare.png",
    hell67: "Hell67.png",
    hellchristmasnightmare: "HellChristmasNightmare.png",
    casehalloweenmassacre: "CaseHalloweenMassacre.png",
    hellholloweenmassacre: "HellHolloweenMassacre.png",
    returntocaseselection: "Back.png"
  };

  function buttonKey(element) {
    if (element.dataset.mediaKey) {
      return element.dataset.mediaKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    const text = (element.textContent || element.getAttribute("aria-label") || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (text) return text;

    const href = element.getAttribute("href") || "";
    if (/CaseSelection/i.test(href)) return "case";
    if (/Controls/i.test(href)) return "controls";
    if (/Notebook/i.test(href)) return "notebook";
    return "";
  }

  function applyButtonArt(element) {
    const key = buttonKey(element);
    let filename = buttonImages[key];
    if (!filename) return;
    element.classList.add("media-button");
    let folder = "Buttons/";
    if (["Easy.png", "Medium.png", "Hard.png", "CharacterSkinSelect.png"].includes(filename)) {
      folder = "Difficulty/";
    }
    element.style.backgroundImage = `url("${new URL(folder + filename, mediaUrl)}")`;
    const dimensions = {
      back: [412, 208], case: [673, 197], caseselection: [673, 197],
      controls: [687, 201], notebook: [663, 198],
      easy: [299, 180], medium: [314, 177], hard: [324, 171],
      characterselection: [625, 205], characterskinselection: [625, 205],
      case67: [369, 249], casesixtyseven: [369, 249],
      casechristmasnightmare: [370, 256], hell67: [370, 248],
      hellchristmasnightmare: [386, 276], casehalloweenmassacre: [403, 248],
      hellholloweenmassacre: [409, 255], returntocaseselection: [412, 208]
    }[key] || [250, 170];
    element.style.setProperty("--media-button-width", `${dimensions[0] / 2}px`);
    element.style.setProperty("--media-button-height", `${dimensions[1] / 2}px`);
  }

  document.querySelectorAll("a, button").forEach(applyButtonArt);
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("a, button")) applyButtonArt(node);
        node.querySelectorAll("a, button").forEach(applyButtonArt);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  const cursor = document.createElement("img");
  cursor.className = "media-cursor";
  cursor.src = new URL("Mouse.png", mediaUrl).href;
  cursor.alt = "";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resizeScreen() {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    scale = Math.min(availableWidth / 1920, availableHeight / 1080);
    offsetX = Math.round((availableWidth - 1920 * scale) / 2);
    offsetY = Math.round((availableHeight - 1080 * scale) / 2);
    document.body.style.transform = `scale(${scale})`;
    document.body.style.left = `${offsetX}px`;
    document.body.style.top = `${offsetY}px`;
    document.body.style.position = "absolute";
  }

  document.addEventListener("mousemove", (event) => {
    const x = (event.clientX - offsetX) / scale;
    const y = (event.clientY - offsetY) / scale;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.display = "";
  });
  document.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
  });

  window.addEventListener("resize", resizeScreen);
  resizeScreen();
})();
