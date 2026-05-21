/* Game-style portfolio interactions */
(function initGameMode() {
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");
  const gameHud = document.getElementById("game-hud");
  const hudLevel = document.getElementById("hud-level");
  const hudCoins = document.getElementById("hud-coins");
  const hudHp = document.getElementById("hud-hp");
  const hudXp = document.getElementById("hud-xp");
  const hudZone = document.getElementById("hud-zone");
  const levelFlash = document.getElementById("levelup-flash");
  const achievementBox = document.getElementById("achievement-box");
  const floatLayer = document.getElementById("float-layer");
  const cursor = document.getElementById("game-cursor");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let gameStarted = false;
  let totalXp = 0;
  let coins = 0;
  let level = 1;
  const visitedSections = new Set();
  let lastFloatTime = 0;

  const SECTION_DATA = {
    hero: { zone: "TITLE SCREEN", achievement: "Spawned In", xp: 50 },
    about: { zone: "PROFILE ZONE", achievement: "Profile Loaded", xp: 80 },
    skills: { zone: "SKILL TREE", achievement: "Skills Unlocked", xp: 80 },
    projects: { zone: "INVENTORY", achievement: "Projects Found", xp: 100 },
    lab: { zone: "SECRET LAB", achievement: "Lab Discovered", xp: 90 },
    experience: { zone: "QUEST LOG", achievement: "History Read", xp: 80 },
    education: { zone: "ACADEMY", achievement: "Knowledge +1", xp: 70 },
    contact: { zone: "FINAL STAGE", achievement: "Boss: Contact", xp: 120 },
  };

  const xpPerLevel = 200;

  /* ----- Start screen ----- */
  function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.body.classList.add("game-active");
    startScreen.classList.add("hide");
    gameHud.setAttribute("aria-hidden", "false");
    setTimeout(() => startScreen.remove(), 800);
    spawnFloatText("GAME START!", "start");
    updateHud();
    if (!prefersReduced) document.body.classList.add("screen-unlock");
    setTimeout(() => document.body.classList.remove("screen-unlock"), 600);
  }

  startBtn.addEventListener("click", startGame);
  document.addEventListener("keydown", (e) => {
    if (!gameStarted && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      startGame();
    }
  });

  /* ----- HUD updates ----- */
  function updateHud() {
    const xpPercent = Math.min(100, (totalXp % xpPerLevel) / xpPerLevel * 100);
    const displayLevel = Math.floor(totalXp / xpPerLevel) + 1;

    if (displayLevel > level) {
      level = displayLevel;
      levelUp();
    }

    hudLevel.textContent = level;
    hudXp.style.width = xpPercent + "%";
    hudCoins.textContent = coins;
    hudHp.style.width = Math.min(100, 25 + visitedSections.size * 10) + "%";
  }

  function levelUp() {
    hudLevel.classList.add("level-pop");
    setTimeout(() => hudLevel.classList.remove("level-pop"), 500);
    if (levelFlash) {
      levelFlash.classList.add("show");
      setTimeout(() => levelFlash.classList.remove("show"), 700);
    }
    showAchievement("LEVEL UP!", "You reached Level " + level);
    spawnFloatText("LEVEL " + level + "!", "level");
    if (!prefersReduced) {
      document.body.classList.add("level-shake");
      setTimeout(() => document.body.classList.remove("level-shake"), 400);
    }
  }

  function addXp(amount, source) {
    totalXp += amount;
    updateHud();
    if (source) spawnFloatText("+" + amount + " XP", "xp");
  }

  function addCoins(n) {
    coins += n;
    hudCoins.classList.add("coin-pop");
    setTimeout(() => hudCoins.classList.remove("coin-pop"), 300);
    updateHud();
  }

  /* ----- Floating combat text ----- */
  function spawnFloatText(text, type, x, y) {
    if (!floatLayer || prefersReduced) return;
    const now = Date.now();
    if (now - lastFloatTime < 120 && type === "xp") return;
    lastFloatTime = now;

    const el = document.createElement("span");
    el.className = "float-text float-text--" + (type || "xp");
    el.textContent = text;

    if (x != null && y != null) {
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.classList.add("float-text--cursor");
    } else {
      el.style.left = "50%";
      el.style.top = "45%";
    }

    floatLayer.appendChild(el);
    requestAnimationFrame(() => el.classList.add("float-text--go"));
    setTimeout(() => el.remove(), 1200);
  }

  /* ----- Achievements ----- */
  function showAchievement(title, desc) {
    if (!achievementBox) return;
    const toast = document.createElement("div");
    toast.className = "achievement-toast";
    toast.innerHTML =
      '<span class="ach-icon">🏆</span>' +
      '<div><strong class="ach-title">' + title + "</strong>" +
      '<p class="ach-desc">' + desc + "</p></div>";
    achievementBox.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  /* ----- Section discovery ----- */
  const sections = document.querySelectorAll("section[id]");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !gameStarted) return;
        const id = entry.target.id;
        if (visitedSections.has(id)) return;

        const data = SECTION_DATA[id];
        if (!data) return;

        visitedSections.add(id);
        entry.target.classList.add("zone-cleared");

        if (hudZone) hudZone.textContent = "ZONE: " + data.zone;
        addXp(data.xp, id);
        addCoins(15);
        showAchievement(data.achievement, data.zone + " cleared!");
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ----- Scroll XP (passive) ----- */
  if (!prefersReduced) {
    let scrollTicking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!gameStarted || scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = max > 0 ? window.scrollY / max : 0;
          if (pct > 0.02 && Math.random() < 0.08) {
            totalXp += 2;
            updateHud();
          }
          scrollTicking = false;
        });
      },
      { passive: true }
    );
  }

  /* ----- Interactive targets ----- */
  document.querySelectorAll(".btn, .project-card, .sidebar-nav a, .contact-link, .contact-form").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (!gameStarted) return;
      el.classList.add("hit-flash");
      setTimeout(() => el.classList.remove("hit-flash"), 200);
      addCoins(3);
      if (!prefersReduced) spawnFloatText("+3 ◆", "coin", e.clientX, e.clientY);
    });
  });

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      if (!gameStarted || prefersReduced) return;
      card.classList.add("loot-glow");
    });
    card.addEventListener("mouseleave", () => card.classList.remove("loot-glow"));
  });

  /* ----- Custom cursor ----- */
  if (cursor && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.body.classList.add("game-cursor-on");
    let cx = 0,
      cy = 0;
    document.addEventListener("mousemove", (e) => {
      if (!gameStarted) return;
      cx = e.clientX;
      cy = e.clientY;
      cursor.style.transform = "translate(" + (cx - 10) + "px, " + (cy - 10) + "px)";
    });
    document.querySelectorAll("a, button, .project-card, .contact-link").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("cursor-target"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-target"));
    });
  }

  /* ----- Konami-style combo: fast section hopping ----- */
  let combo = 0;
  let comboTimer;
  const origSectionHandler = () => {
    combo++;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      if (combo >= 4 && gameStarted) {
        showAchievement("Speed Runner!", "Visited zones in rapid succession");
        addXp(50);
        addCoins(25);
        spawnFloatText("COMBO x" + combo + "!", "combo");
      }
      combo = 0;
    }, 2000);
  };

  sections.forEach((s) => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && gameStarted)) origSectionHandler();
      },
      { threshold: 0.5 }
    );
    obs.observe(s);
  });

  /* ----- Idle hero pulse when game active ----- */
  const heroName = document.querySelector(".hero-name");
  if (heroName && !prefersReduced) {
    setInterval(() => {
      if (gameStarted) heroName.classList.add("idle-pulse");
      setTimeout(() => heroName.classList.remove("idle-pulse"), 600);
    }, 4000);
  }
})();
