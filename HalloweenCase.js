(() => {
  const game = document.getElementById("game");
  const player = document.getElementById("player");
  const boss = document.getElementById("boss");
  const branch = document.getElementById("branch");
  const branchWarning = document.getElementById("branch-warning");
  const health = document.getElementById("HEALTH");
  const numberImage = document.getElementById("NUMBER-IMAGE");
  const numberControl = document.getElementById("NUMBER-CIRCLE");
  const message = document.getElementById("MESSAGE");
  const hellMode = document.body.dataset.mode === "hell";
  const bloodTree = "../Media/Enemy/BloodTree/";
  const keyBindings = loadPlayerBindings();
  const keys = { left: false, right: false };
  const caseKey = "CaseHalloweenMasacre";
  const branchTravelDuration = .45;
  const branchLingerDuration = 10;
  const attackDuration = branchTravelDuration + branchLingerDuration;
  let playableNumbers = [1];
  let number = 1;
  let playerX = 120;
  let playerY = 0;
  let playerVelocityY = 0;
  let playerGrounded = true;
  let playerAttacking = false;
  let attackCooldown = 0;
  let damageCooldown = 0;
  let number1Hold = 0;
  let branchHp = 100;
  let playerHealth = getStartingHealth();
  let facing = 1;
  let last = performance.now();
  let phase = "REST";
  let phaseTimer = 2;
  let attackElapsed = 0;
  let attackSide = "right";
  let nextAttackSide = "left";
  let branchHit = false;
  let projectile = null;
  let finished = false;

  function loadCharacters() {
    const available = new Set([-1, 1, 2, 3, 4, 5, 16, 44]);
    playableNumbers = [...new Set(loadPlayerSettings().cycle.filter((character) => available.has(character)))];
    if (!playableNumbers.includes(1)) playableNumbers.unshift(1);
    if (!playableNumbers.length) playableNumbers = [1];
    if (!playableNumbers.includes(number)) number = playableNumbers[0];
  }

  function drawHealth() {
    health.replaceChildren();
    for (let index = 0; index < getStartingHealth(); index++) {
      const heart = document.createElement("img");
      heart.className = "HEART";
      heart.src = "../Media/Images/Heart.png";
      heart.alt = index < playerHealth ? "Heart" : "Empty heart";
      heart.style.opacity = index < playerHealth ? "1" : ".2";
      health.appendChild(heart);
    }
  }

  function setNumber(character) {
    if (!playableNumbers.includes(character)) return;
    number = character;
    numberImage.src = `../Media/Images/${number}.png`;
    numberImage.alt = `Number ${number}`;
    const iconScale = { "-1": 0.28, "1": 0.2933, "2": 0.32, "3": 0.26, "4": 0.26, "5": 0.30, "16": 0.30, "44": 0.30 };
    const iconOffset = number === 1 || number === 2 ? 20 : 0;
    numberImage.style.transform = `translate(${iconOffset}px, 3px) scale(${iconScale[number]})`;
  }

  function cycleCharacter(direction) {
    const index = playableNumbers.indexOf(number);
    setNumber(playableNumbers[(index + direction + playableNumbers.length) % playableNumbers.length]);
  }

  function playerFrame() {
    const alternate = Math.floor(performance.now() / 140) % 2;
    const state = !playerGrounded
      ? playerVelocityY > 0 ? "JUMP" : "FALL"
      : keys.left || keys.right ? "WALK" : "STILL";
    return getPlayerAnimationFrame(number, state, playerAttacking, alternate);
  }

  function draw() {
    player.src = playerSpritePath(number, playerFrame());
    player.style.left = `${playerX}px`;
    player.style.bottom = `${78 + playerY}px`;
    const characterMirror = getPlayerHorizontalFlip(number, facing, playerGrounded, playerAttacking, performance.now());
    player.style.transform = `translateX(-50%) scale(.56) scaleX(${-facing * characterMirror})`;
  }

  function flashBranch() {
    let flashes = 0;
    const pulse = () => {
      if (flashes >= 6) {
        branch.style.opacity = "1";
        return;
      }
      branch.style.opacity = flashes++ % 2 ? "1" : ".25";
      window.setTimeout(pulse, 70);
    };
    pulse();
  }

  function finishCase(result, saveFailed = false) {
    if (finished) return;
    finished = true;
    message.textContent = result === "victory" ? "THE BLOOD TREE HAS FALLEN" : "THE FOREST CLAIMS YOU";
    message.style.opacity = "1";
    window.setTimeout(() => {
      const query = new URLSearchParams({ result });
      if (saveFailed) query.set("save", "failed");
      window.location.href = `Exit.html?${query}`;
    }, 1000);
  }

  function saveCompletion() {
    try {
      const progress = JSON.parse(localStorage.getItem("sixtySevenProgress") || "{}");
      progress.cases = progress.cases || {};
      progress.cases[caseKey] = "COMPLETED";
      localStorage.setItem("sixtySevenProgress", JSON.stringify(progress));
      localStorage.setItem("caseHalloweenMasacreCompleted", "true");
      return true;
    } catch (error) {
      console.error("Could not save Halloween case completion.", error);
      return false;
    }
  }

  function hurtPlayer() {
    if (finished || damageCooldown > 0) return;
    damageCooldown = .8;
    playerHealth--;
    drawHealth();
    if (playerHealth <= 0) finishCase("defeat");
  }

  function damageBranch(amount) {
    if (phase !== "ATTACK" || branchHp <= 0) return;
    branchHp = Math.max(0, branchHp - amount);
    updateBranchHealth();
    flashBranch();
    if (branchHp === 0) finishCase("victory", !saveCompletion());
  }

  function pointToSegmentDistance(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    const projection = lengthSquared
      ? Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared))
      : 0;
    return Math.hypot(point.x - (start.x + projection * dx), point.y - (start.y + projection * dy));
  }

  function branchSegment(progress = Math.min(1, attackElapsed / branchTravelDuration)) {
    const width = game.clientWidth;
    const height = game.clientHeight;
    const start = { x: attackSide === "left" ? 0 : width, y: 0 };
    const target = {
      x: width * (attackSide === "left" ? .72 : .28),
      y: height - 78
    };
    const end = {
      x: start.x + (target.x - start.x) * progress,
      y: start.y + (target.y - start.y) * progress
    };
    return { start, end };
  }

  function updateBranchVisual() {
    if (phase !== "ATTACK") return;
    const { start, end } = branchSegment();
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const scaledWidth = length * 177 / 1018;
    branch.style.left = `${start.x - scaledWidth / 2}px`;
    branch.style.top = `${start.y}px`;
    branch.style.height = `${length}px`;
    branch.style.transform = `rotate(${Math.atan2(dx, dy) * 180 / Math.PI}deg)`;
    branch.style.display = "block";
  }

  function showBranchWarning() {
    const { start, end } = branchSegment(1);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const width = length * 177 / 1018 + 28;
    branchWarning.style.left = `${start.x - width / 2}px`;
    branchWarning.style.top = `${start.y}px`;
    branchWarning.style.width = `${width}px`;
    branchWarning.style.height = `${length}px`;
    branchWarning.style.transform = `rotate(${Math.atan2(dx, dy) * 180 / Math.PI}deg)`;
    branchWarning.style.display = "block";
  }

  function startAttack() {
    attackSide = nextAttackSide;
    nextAttackSide = nextAttackSide === "left" ? "right" : "left";
    attackElapsed = 0;
    branchHit = false;
    phase = "TELEGRAPH";
    phaseTimer = 3;
    branch.src = bloodTree + (hellMode ? "BranchBlood.png" : "Branch.png");
    branch.style.opacity = "1";
    branch.style.display = "none";
    showBranchWarning();
    boss.src = bloodTree + (hellMode ? "TreeBloodAGRO.png" : "TreeAGRO.png");
  }

  function attackWithWeapon() {
    playerAttacking = true;
    attackCooldown = getPlayerActionDuration(number, "swing");
    if (number === 1) number1Hold = getPlayerActionDuration(1, "swing");
    if (number === 5 && projectile) {
      const recalled = getPlayerRecallPosition(number, projectile, { x: playerX, y: playerY });
      playerX = recalled.x;
      playerY = 0;
      playerGrounded = true;
      projectile = null;
      document.getElementById("PLAYER-PROJECTILE").style.display = "none";
      attackCooldown = .36;
      return;
    }

    if ([3, 5, 16].includes(number)) {
      projectile = createPlayerProjectile(number, playerX, 78 + playerY, facing);
      const projectileImage = document.getElementById("PLAYER-PROJECTILE");
      const frame = number === 3 ? "Arrow" : number === 5 ? "Alt" : "Bomb";
      projectileImage.src = playerSpritePath(number, frame);
      projectileImage.style.left = `${projectile.x}px`;
      projectileImage.style.bottom = `${projectile.y}px`;
      projectileImage.style.display = "block";
    } else {
      if (number === -1 || number === 44) {
        playerX = Math.max(22, Math.min(game.clientWidth - 22, playerX + facing * 180));
        if (number === 44) playerVelocityY = 0;
      }
      if (phase === "ATTACK") {
        const { start, end } = branchSegment();
        const playerPoint = { x: playerX + facing * 32, y: game.clientHeight - (78 + playerY + 40) };
        if (pointToSegmentDistance(playerPoint, start, end) < 110) {
          damageBranch(getPlayerDamage(number));
        }
      }
    }
    window.setTimeout(() => { playerAttacking = false; }, 180);
  }

  function updateWeapon(dt) {
    if (!projectile) return;
    const projectileImage = document.getElementById("PLAYER-PROJECTILE");
    const update = updatePlayerProjectileState(projectile, dt, playerX, game.clientWidth);
    projectile = update.projectile;
    if (!projectile) {
      projectileImage.style.display = "none";
      return;
    }
    projectileImage.style.left = `${projectile.x}px`;
    projectileImage.style.transform = `translateX(-50%) scale(.75) scaleX(${projectile.direction})`;
    if (projectile.kind === "bomb") {
      projectileImage.src = playerSpritePath(16, projectile.phase === "exploding" ? "Explode" : "Bomb");
      if (projectile.phase === "exploding" && !projectile.hit && phase === "ATTACK") {
        const { start, end } = branchSegment();
        const point = { x: projectile.x, y: game.clientHeight - projectile.y };
        if (pointToSegmentDistance(point, start, end) < 65) {
          projectile.hit = true;
          damageBranch(getPlayerDamage(16, "bomb"));
        }
      }
      if (update.expired) {
        projectile = null;
        projectileImage.style.display = "none";
      }
      return;
    }
    if (phase === "ATTACK") {
      const { start, end } = branchSegment();
      const point = { x: projectile.x, y: game.clientHeight - projectile.y };
      if (pointToSegmentDistance(point, start, end) < 55) {
        const action = projectile.kind === "blade"
          ? projectile.phase === "returning" ? "returning" : "outbound"
          : "arrow";
        projectile = null;
        projectileImage.style.display = "none";
        damageBranch(getPlayerDamage(number, action));
        return;
      }
    }
    if (update.expired || update.recalled) {
      projectile = null;
      projectileImage.style.display = "none";
    }
  }

  function updateAttack(dt) {
    if (phase === "REST") {
      phaseTimer -= dt;
      if (phaseTimer <= 0) startAttack();
      return;
    }
    if (phase === "TELEGRAPH") {
      phaseTimer -= dt;
      if (phaseTimer <= 0) {
        phase = "ATTACK";
        attackElapsed = 0;
        branchWarning.style.display = "none";
        message.textContent = "";
        message.style.opacity = "0";
      }
      return;
    }

    attackElapsed += dt;
    updateBranchVisual();
    const { start, end } = branchSegment();
    const playerPoint = {
      x: playerX,
      y: game.clientHeight - (78 + playerY + 40)
    };
    if (!branchHit && pointToSegmentDistance(playerPoint, start, end) < 42) {
      branchHit = true;
      hurtPlayer();
    }
    if (attackElapsed >= attackDuration) {
      phase = "REST";
      phaseTimer = 1.6;
      branch.style.display = "none";
      branchWarning.style.display = "none";
      boss.src = bloodTree + (hellMode ? "TreeBlood.png" : "Tree.png");
    }
  }

  function loop(now) {
    const dt = Math.min((now - last) / 1000, .04);
    last = now;
    if (finished) return;

    const movement = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if ((playerGrounded || canPlayerControlInAir(number)) &&
      canPlayerMove({ finished, attackTime: attackCooldown, number1Hold, recallingBlade: number === 5 && projectile?.kind === "blade" })) {
      playerX += movement * PLAYER_PROFILE.speed * dt;
    }
    if (movement) facing = movement;
    playerX = Math.max(22, Math.min(game.clientWidth - 22, playerX));
    updateAttack(dt);
    updateWeapon(dt);
    damageCooldown = Math.max(0, damageCooldown - dt);
    attackCooldown = Math.max(0, attackCooldown - dt);
    number1Hold = Math.max(0, number1Hold - dt);
    if (!playerGrounded && shouldApplyPlayerGravity(number, playerAttacking)) {
      playerVelocityY -= PLAYER_PROFILE.gravity * dt;
      playerY += playerVelocityY * dt;
      if (playerY <= 0) {
        playerY = 0;
        playerVelocityY = 0;
        playerGrounded = true;
      }
    }
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === keyBindings.left || key === "arrowleft") keys.left = true;
    if (key === keyBindings.right || key === "arrowright") keys.right = true;
    if ((key === keyBindings.jump || key === "arrowup") && !event.repeat && playerGrounded && canPlayerJump(number)) {
      playerVelocityY = getPlayerJumpPower(number);
      playerGrounded = false;
    }
    if (key === keyBindings.previous && !event.repeat) {
      cycleCharacter(-1);
    }
    if (key === keyBindings.next && !event.repeat) {
      cycleCharacter(1);
    }
    for (let slot = 1; slot <= 5; slot++) {
      if (key === keyBindings[`number${slot}`] && !event.repeat) {
        const character = playableNumbers[slot - 1];
        if (character !== undefined) setNumber(character);
      }
    }
    if (key === keyBindings.attack && !event.repeat && attackCooldown <= 0) attackWithWeapon();
  });
  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === keyBindings.left || key === "arrowleft") keys.left = false;
    if (key === keyBindings.right || key === "arrowright") keys.right = false;
  });
  numberControl.addEventListener("click", () => cycleCharacter(1));

  loadCharacters();
  setNumber(number);
  drawHealth();
  boss.src = bloodTree + (hellMode ? "TreeBlood.png" : "Tree.png");
  draw();
  requestAnimationFrame(loop);
})();
