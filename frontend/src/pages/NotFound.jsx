import React from "react"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        backgroundColor: "var(--cream)",
        color: "var(--graphite)",
        textAlign: "center"
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "5rem",
          color: "var(--rose)",
          lineHeight: 1
        }}
      >
        404
      </span>
      <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "var(--space-2) 0 var(--space-3)" }}>
        Page not found
      </h1>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", maxWidth: "40ch", marginBottom: "var(--space-6)" }}>
        The requested address does not exist in the emergency coordination portal.
      </p>
      <Link
        to="/"
        style={{
          padding: "10px 24px",
          background: "var(--graphite)",
          color: "var(--cream)",
          borderRadius: "var(--radius-pill)",
          fontSize: "var(--text-sm)",
          fontWeight: 600
        }}
      >
        Return to home
      </Link>
    </div>
  )
}
