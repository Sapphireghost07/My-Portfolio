document.addEventListener("DOMContentLoaded", () => {
  const yearTarget = document.getElementById("year");
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "sab-theme-preference";

  const applyTheme = (mode) => {
    const isLight = mode === "light";
    body.classList.toggle("light-theme", isLight);
    localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  };

  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

  if (storedTheme) {
    applyTheme(storedTheme);
  } else if (prefersLight) {
    applyTheme("light");
  }

  if (themeToggle) {
    const toggleTheme = () => {
      const isCurrentlyLight = body.classList.contains("light-theme");
      applyTheme(isCurrentlyLight ? "dark" : "light");
    };

    themeToggle.addEventListener("click", toggleTheme);

    themeToggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleTheme();
      }
    });
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    const skillPills = document.querySelectorAll(".pill-list span");
    if (skillPills.length) {
      skillPills.forEach((pill) => {
        // NOTE: Removed redundant `is-active` class logic here, as CSS already handles `:hover`
        pill.addEventListener("mouseenter", () => pill.classList.add("is-active"));
        pill.addEventListener("mouseleave", () => pill.classList.remove("is-active"));
      });
    }
  }
}); 

const canvas = document.getElementById("bgCanvas");
if (canvas?.getContext) {
  const ctx = canvas.getContext("2d");
  function drawBg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawBg);
  }
  drawBg();
}

// === TYPING EFFECT (Character-by-Character Animation) ===
const typingTarget = document.getElementById("typingRole");

if (typingTarget) {
  const roles = JSON.parse(typingTarget.getAttribute("data-roles"));
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const type = () => {
    const current = roles[roleIndex];
    
    typingTarget.textContent = current.substring(0, charIndex);

    if (!isDeleting && charIndex < current.length) {
      charIndex++;
      setTimeout(type, 90);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(type, 60);
    } else {
      isDeleting = !isDeleting;
      if (!isDeleting) roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(type, 800);
    }
  };

  type();
}