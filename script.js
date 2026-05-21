/* Particle network background */
(function initBg() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles = [];
  const linkDist = 140;
  const colors = ["#00f5ff", "#ff00aa", "#8b5cf6", "#00ff88"];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.max(40, Math.floor((w * h) / 12000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;

      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.35;
          ctx.strokeStyle = `rgba(0, 245, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
})();

/* Typing effect */
(function initTyping() {
  const el = document.getElementById("typing-text");
  if (!el) return;

  const phrases = [
    "Game Developer",
    "Unity / Godot Enthusiast",
    "C# & GDScript Coder",
    "3D & Game Design Learner",
    "Prototype Architect",
    "Boss Fight Debugger",
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 2000);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 45 : 90);
  }

  tick();
})();

/* Scroll reveal */
(function initReveal() {
  const targets = document.querySelectorAll(".reveal, .skill-chip:not(.lang)");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");

        if (entry.target.classList.contains("skill-chip")) {
          const level = entry.target.dataset.level;
          if (level) {
            entry.target.querySelector(".skill-bar span").style.width = level + "%";
          }
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
})();

/* Animated player stat counters */
(function initCounters() {
  const nums = document.querySelectorAll(".player-stat-num[data-count]");
  if (!nums.length) return;

  function animate(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  nums.forEach((n) => observer.observe(n));
})();

/* Logo easter egg */
(function initEasterEgg() {
  const logo = document.querySelector(".sidebar-logo");
  if (!logo) return;
  let clicks = 0;
  const defaultHtml = logo.innerHTML;

  logo.addEventListener("click", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    clicks++;
    if (clicks >= 3) {
      document.body.style.setProperty("--cyan", "#00ff88");
      setTimeout(() => document.body.style.removeProperty("--cyan"), 4000);
      clicks = 0;
      logo.innerHTML = defaultHtml;
    } else {
      logo.textContent = "CHEAT";
    }
  });
})();

/* Sidebar nav */
(function initNav() {
  const toggle = document.querySelector(".sidebar-toggle");
  const nav = document.querySelector(".sidebar-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

/* Active sidebar link on scroll */
(function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".sidebar-nav a");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => observer.observe(s));
})();

/* Contact form → email via FormSubmit */
(function initContactForm() {
  const form = document.getElementById("contact-form");
  const nextInput = document.getElementById("form-next-url");
  const successBanner = document.getElementById("form-success");
  if (!form || !nextInput) return;

  const base = window.location.href.split(/[?#]/)[0];
  nextInput.value = base + "#contact?sent=success";

  if (new URLSearchParams(window.location.search).get("sent") === "success") {
    if (successBanner) successBanner.hidden = false;
    history.replaceState(null, "", base + "#contact");
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  form.addEventListener("submit", () => {
    const btn = form.querySelector(".btn-submit");
    const text = form.querySelector(".btn-submit-text");
    const loading = form.querySelector(".btn-submit-loading");
    if (btn) btn.disabled = true;
    if (text) text.hidden = true;
    if (loading) loading.hidden = false;
  });
})();
