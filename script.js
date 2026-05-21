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

/* Contact form → Web3Forms (sends to mazeemali150@gmail.com) */
(function initContactForm() {
  const form = document.getElementById("contact-form");
  const successBanner = document.getElementById("form-success");
  const errorBanner = document.getElementById("form-error");
  const errorText = document.getElementById("form-error-text");
  const mailtoFallback = document.getElementById("form-mailto-fallback");
  const config = window.CONTACT_CONFIG || { recipientEmail: "mazeemali150@gmail.com" };

  if (!form) return;

  const btn = form.querySelector(".btn-submit");
  const btnText = form.querySelector(".btn-submit-text");
  const btnLoading = form.querySelector(".btn-submit-loading");

  function setLoading(on) {
    if (btn) btn.disabled = on;
    if (btnText) btnText.hidden = on;
    if (btnLoading) btnLoading.hidden = !on;
  }

  function hideBanners() {
    if (successBanner) successBanner.hidden = true;
    if (errorBanner) errorBanner.hidden = true;
  }

  function showSuccess() {
    hideBanners();
    if (successBanner) successBanner.hidden = false;
    form.reset();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildMailtoLink(name, email, objective) {
    const subject = encodeURIComponent("Portfolio contact from " + name);
    const body = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email + "\n\nObjective:\n" + objective
    );
    return "mailto:" + config.recipientEmail + "?subject=" + subject + "&body=" + body;
  }

  function showError(message, name, email, objective) {
    hideBanners();
    if (errorBanner) errorBanner.hidden = false;
    if (errorText) errorText.textContent = message;
    if (mailtoFallback && name) {
      mailtoFallback.href = buildMailtoLink(name, email, objective);
    }
  }

  if (new URLSearchParams(window.location.search).get("sent") === "success") {
    showSuccess();
    history.replaceState(null, "", window.location.pathname + "#contact");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanners();

    if (form.querySelector('[name="botcheck"]')?.value) return;

    const name = form.querySelector("#client-name")?.value.trim();
    const email = form.querySelector("#client-email")?.value.trim();
    const objective = form.querySelector("#client-objective")?.value.trim();

    if (!name || !email || !objective) return;

    const accessKey = config.web3formsAccessKey;
    const hasWeb3Key = accessKey && accessKey !== "PASTE_YOUR_ACCESS_KEY_HERE";

    setLoading(true);

    try {
      if (!hasWeb3Key) {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("email", email);
        fd.append("objective", objective);
        fd.append("message", objective);
        fd.append("_subject", "Portfolio contact from " + name);
        fd.append("_replyto", email);
        fd.append("_template", "table");
        fd.append("_captcha", "false");

        const fsRes = await fetch(
          "https://formsubmit.co/ajax/" + encodeURIComponent(config.recipientEmail),
          { method: "POST", body: fd, headers: { Accept: "application/json" } }
        );
        const fsData = await fsRes.json();

        if (fsData.success === "true" || fsData.success === true) {
          showSuccess();
          return;
        }

        showError(
          "Email form needs one-time setup. Owner: get a free key at web3forms.com (2 min) or activate FormSubmit in your inbox. Use the button below meanwhile.",
          name,
          email,
          objective
        );
        return;
      }

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: "Portfolio contact from " + name,
          from_name: name,
          email: email,
          replyto: email,
          message:
            "New portfolio message\n\n" +
            "Name: " + name + "\n" +
            "Email: " + email + "\n\n" +
            "Objective:\n" + objective,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showSuccess();
      } else {
        showError(
          data.message || "Something went wrong. Try the email button below.",
          name,
          email,
          objective
        );
      }
    } catch {
      showError("Network error. Use the button below to email directly.", name, email, objective);
    } finally {
      setLoading(false);
    }
  });
})();
