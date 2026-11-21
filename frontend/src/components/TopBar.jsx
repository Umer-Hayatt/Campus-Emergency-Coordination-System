import React from "react"
import ConnectionStatus from "./ConnectionStatus"
import NotificationBell from "./NotificationBell"
import { useAuth } from "../context/AuthContext"
import { formatRole } from "../utils/format"

export default function TopBar({ title = "Dashboard" }) {
  const { user } = useAuth()

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "var(--white)",
        borderBottom: "1px solid var(--sand)",
        padding: "0 var(--space-8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}
    >
      <h1
        style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--graphite)",
          margin: 0
        }}
      >
        {title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <ConnectionStatus />
        <NotificationBell />

        {user && (
          <div
            style={{
              padding: "4px 10px",
              background: "var(--cream)",
              border: "1px solid var(--sand)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--text-xs)",
              color: "var(--graphite)",
              fontWeight: 500
            }}
          >
            {user.username} ({formatRole(user.role)})
          </div>
        )}
      </div>
    </header>
  )
}
