"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const t = localStorage.getItem("theme") ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setDark(t === "dark");
    document.documentElement.dataset.theme = t;
  }, []);
  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => {
        const t = dark ? "light" : "dark";
        setDark(!dark);
        localStorage.setItem("theme", t);
        document.documentElement.dataset.theme = t;
      }}
    >
      {dark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
