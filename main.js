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
        pill.addEventListener("mouseenter", () => pill.classList.add("is-active"));
        pill.addEventListener("mouseleave", () => pill.classList.remove("is-active"));
      });
    }
  }
});

