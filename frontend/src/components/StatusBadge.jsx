import React from "react"
import { formatStatus } from "../utils/format"

const STATUS_THEMES = {
  REPORTED: {
    bg: "var(--sand)",
    fg: "var(--graphite)"
  },
  UNDER_REVIEW: {
    bg: "var(--amber)",
    fg: "var(--white)"
  },
  ASSIGNED: {
    bg: "var(--amber-dark)",
    fg: "var(--white)"
  },
  ACCEPTED: {
    bg: "var(--rose)",
    fg: "var(--white)"
  },
  EN_ROUTE: {
    bg: "var(--rose)",
    fg: "var(--white)"
  },
  ON_SCENE: {
    bg: "var(--rose)",
    fg: "var(--white)"
  },
  RESOLVED: {
    bg: "#3f7d4e",
    fg: "var(--white)"
  },
  CANCELLED: {
    bg: "#5e5755",
    fg: "var(--white)"
  },
  REJECTED: {
    bg: "#5e5755",
    fg: "var(--white)"
  }
}

export default function StatusBadge({ status }) {
  const theme = STATUS_THEMES[status] || STATUS_THEMES.REPORTED

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        background: theme.bg,
        color: theme.fg,
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        whiteSpace: "nowrap"
      }}
    >
      {formatStatus(status)}
    </span>
  )
}
