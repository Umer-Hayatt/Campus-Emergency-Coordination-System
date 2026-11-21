import React from "react"

export default function StatCard({ label, value, highlight = false }) {
  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid var(--sand)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4) var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        minWidth: "140px"
      }}
    >
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--graphite-light)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600
        }}
      >
        {label}
      </span>
      <span
        className="tabular-num"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-3xl)",
          lineHeight: 1,
          color: highlight ? "var(--rose)" : "var(--graphite)"
        }}
      >
        {value}
      </span>
    </div>
  )
}
