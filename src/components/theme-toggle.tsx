"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "9px 12px",
        border: "1px solid var(--rule-2)",
        borderRadius: 6,
        background: "transparent",
        color: "var(--ink-3)",
        fontFamily: "var(--sans)",
        fontSize: 13,
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color .15s, color .15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink-4)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rule-2)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)";
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{dark ? "○" : "●"}</span>
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}

/** Compact icon-only toggle for use in page headers */
export function ThemeToggleIcon() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    setDark(stored === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        border: "1px solid var(--rule-2)",
        borderRadius: 999,
        background: "transparent",
        color: "var(--ink-3)",
        cursor: "pointer",
        fontSize: 15,
        transition: "border-color .15s, color .15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--rule-2)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-3)";
      }}
    >
      {dark ? "○" : "●"}
    </button>
  );
}
