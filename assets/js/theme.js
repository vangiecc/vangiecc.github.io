export function resolveTheme(savedTheme, prefersLight) {
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  return prefersLight ? "light" : "dark";
}

export function setTheme(root, storage, theme) {
  root.dataset.theme = theme;
  storage?.setItem("vangie-theme", theme);
}

function labelFor(theme) {
  return theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
}

if (typeof document !== "undefined") {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");

  const syncButton = () => {
    const label = labelFor(root.dataset.theme);
    button?.setAttribute("aria-label", label);
    button?.setAttribute("title", label);
  };

  syncButton();
  button?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(root, window.localStorage, nextTheme);
    syncButton();
  });
}
