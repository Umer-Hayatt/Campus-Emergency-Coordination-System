import React from "react"
import { formatDateTime, formatStatus } from "../utils/format"

export default function Timeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>
        No status transitions recorded yet.
      </p>
    )
  }

  return (
    <div style={{ position: "relative", paddingLeft: "var(--space-6)" }}>
      {/* Vertical connector line */}
      <div
        style={{
          position: "absolute",
          left: "9px",
          top: "8px",
          bottom: "8px",
          width: "2px",
          backgroundColor: "var(--sand)"
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {history.map((item, index) => {
          const isLatest = index === history.length - 1

          return (
            <div key={item.id || index} style={{ position: "relative" }}>
              {/* Node indicator */}
              <div
                style={{
                  position: "absolute",
                  left: "-21px",
                  top: "2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: isLatest ? "var(--rose)" : "var(--sand)",
                  border: "2px solid var(--white)",
                  boxShadow: "0 0 0 1px var(--sand)"
                }}
              />

              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--graphite)" }}>
                    {formatStatus(item.new_status)}
                  </span>
                  {item.changed_by_username && (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)" }}>
                      by {item.changed_by_username}
                    </span>
                  )}
                  <span
                    className="tabular-num"
                    style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", marginLeft: "auto" }}
                  >
                    {formatDateTime(item.created_at)}
                  </span>
                </div>
                {item.old_status && (
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", marginTop: "2px", margin: 0 }}>
                    Transitioned from {formatStatus(item.old_status)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
