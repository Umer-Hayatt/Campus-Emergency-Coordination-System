import React from "react"

const SEVERITY_CONFIG = {
  low: {
    bg: "var(--sand)",
    fg: "var(--graphite)"
  },
  medium: {
    bg: "rgba(213, 138, 67, 0.2)",
    fg: "var(--amber-dark)"
  },
  high: {
    bg: "var(--amber)",
    fg: "var(--white)"
  },
  critical: {
    bg: "var(--rose)",
    fg: "var(--white)"
  }
}

export default function SeverityChip({ severity }) {
  const norm = (severity || "medium").toLowerCase()
  const style = SEVERITY_CONFIG[norm] || SEVERITY_CONFIG.medium

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        background: style.bg,
        color: style.fg,
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em"
      }}
    >
      {norm}
    </span>
  )
}
