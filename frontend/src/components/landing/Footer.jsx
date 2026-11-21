import React from "react"
import Logo from "../Logo"

export default function Footer() {
  return (
    <footer
      style={{
        padding: "var(--space-12) var(--space-8) var(--space-8)",
        backgroundColor: "var(--graphite)",
        color: "var(--sand)",
        borderTop: "1px solid rgba(232, 220, 210, 0.15)"
      }}
    >
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-6)"
        }}
      >
        <Logo variant="light" size="small" />

        <div style={{ display: "flex", gap: "var(--space-6)", fontSize: "var(--text-xs)" }}>
          <a href="#how-it-works" style={{ color: "var(--sand)" }}>
            Lifecycle
          </a>
          <a href="#roles" style={{ color: "var(--sand)" }}>
            Roles
          </a>
          <a href="#features" style={{ color: "var(--sand)" }}>
            Capabilities
          </a>
          <a href="#architecture" style={{ color: "var(--sand)" }}>
            Architecture
          </a>
        </div>
      </div>

      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "var(--space-8) auto 0",
          paddingTop: "var(--space-6)",
          borderTop: "1px solid rgba(232, 220, 210, 0.08)",
          textAlign: "center",
          fontSize: "11px",
          color: "rgba(232, 220, 210, 0.6)"
        }}
      >
        Academic project. Not a certified emergency response system.
      </div>
    </footer>
  )
}
