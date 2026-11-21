import React from "react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../context/NotificationContext"
import { useAuth } from "../context/AuthContext"

export default function Toast() {
  const { toasts, removeToast } = useNotifications()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!toasts || toasts.length === 0) return null

  const handleToastClick = (toast) => {
    if (toast.incidentId && user) {
      if (user.role === "student") {
        navigate(`/student/incidents/${toast.incidentId}`)
      } else if (user.role === "admin") {
        navigate(`/admin/incidents/${toast.incidentId}`)
      } else if (user.role === "security" || user.role === "medical") {
        navigate(`/responder/incidents/${toast.incidentId}`)
      }
    }
    removeToast(toast.id)
  }

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Real-time notifications"
      style={{
        position: "fixed",
        bottom: "var(--space-6)",
        right: "var(--space-6)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        maxWidth: "380px",
        pointerEvents: "none"
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: "auto",
            background: "var(--graphite)",
            color: "var(--cream)",
            padding: "var(--space-3) var(--space-4)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--amber)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-3)",
            cursor: toast.incidentId ? "pointer" : "default"
          }}
          onClick={() => handleToastClick(toast)}
        >
          <div style={{ marginTop: "2px", color: "var(--amber)", flexShrink: 0 }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", margin: 0, color: "var(--white)" }}>
              {toast.title}
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--sand)", margin: "2px 0 0", wordBreak: "break-word" }}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeToast(toast.id)
            }}
            aria-label="Dismiss alert"
            style={{
              color: "var(--sand)",
              padding: "2px",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
