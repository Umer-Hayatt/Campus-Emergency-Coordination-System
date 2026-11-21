import React from "react"
import { NavLink } from "react-router-dom"
import Logo from "./Logo"
import { useAuth } from "../context/AuthContext"
import { formatRole } from "../utils/format"

export default function Sidebar() {
  const { user, logout } = useAuth()

  if (!user) return null

  const role = user.role

  const getLinks = () => {
    if (role === "student") {
      return [
        { to: "/student", label: "Dashboard", end: true },
        { to: "/student/report", label: "Report emergency" },
        { to: "/student/reports", label: "My reports" }
      ]
    }
    if (role === "admin") {
      return [
        { to: "/admin", label: "Dashboard", end: true },
        { to: "/admin/incidents", label: "All incidents" }
      ]
    }
    if (role === "security" || role === "medical") {
      return [{ to: "/responder", label: "Task queue", end: true }]
    }
    return []
  }

  const links = getLinks()

  return (
    <aside
      style={{
        width: "240px",
        backgroundColor: "var(--graphite)",
        color: "var(--cream)",
        display: "flex",
        flexDirection: "column",
        padding: "var(--space-6) var(--space-4)",
        borderRight: "1px solid rgba(232, 220, 210, 0.1)",
        minHeight: "100vh"
      }}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: "var(--space-8)", paddingLeft: "var(--space-2)" }}>
        <Logo variant="light" size="small" />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            style={({ isActive }) => ({
              display: "block",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: isActive ? "var(--graphite)" : "var(--sand)",
              backgroundColor: isActive ? "var(--amber)" : "transparent",
              transition: "background-color 150ms ease, color 150ms ease"
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User info card & Logout button */}
      <div
        style={{
          borderTop: "1px solid rgba(232, 220, 210, 0.15)",
          paddingTop: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "var(--space-2)" }}>
          <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--white)" }}>
            {user.username}
          </span>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--amber)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontWeight: 600
            }}
          >
            {formatRole(user.role)}
          </span>
        </div>

        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "8px 12px",
            background: "rgba(232, 220, 210, 0.08)",
            color: "var(--sand)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            cursor: "pointer",
            width: "100%",
            textAlign: "left"
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
