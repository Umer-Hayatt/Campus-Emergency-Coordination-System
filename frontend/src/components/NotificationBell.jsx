import React, { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../context/NotificationContext"
import { useAuth } from "../context/AuthContext"
import { formatDateTime } from "../utils/format"

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0) {
      markAllRead()
    }
  }

  const handleItemClick = (notif) => {
    setIsOpen(false)
    if (notif.incident_id && user) {
      if (user.role === "student") {
        navigate(`/student/incidents/${notif.incident_id}`)
      } else if (user.role === "admin") {
        navigate(`/admin/incidents/${notif.incident_id}`)
      } else if (user.role === "security" || user.role === "medical") {
        navigate(`/responder/incidents/${notif.incident_id}`)
      }
    }
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        aria-label={`Notifications, ${unreadCount} unread`}
        style={{
          position: "relative",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--white)",
          border: "1px solid var(--sand)",
          color: "var(--graphite)",
          cursor: "pointer"
        }}
      >
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

        {unreadCount > 0 && (
          <span
            className="tabular-num"
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "var(--rose)",
              color: "var(--white)",
              fontSize: "10px",
              fontWeight: 700,
              padding: "1px 5px",
              borderRadius: "var(--radius-pill)",
              lineHeight: 1.2
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "320px",
            maxHeight: "420px",
            background: "var(--white)",
            border: "1px solid var(--sand)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderBottom: "1px solid var(--sand)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--graphite)" }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--amber-dark)",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Mark read
              </button>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <p
                style={{
                  padding: "var(--space-6)",
                  textAlign: "center",
                  fontSize: "var(--text-xs)",
                  color: "var(--graphite-light)",
                  margin: 0
                }}
              >
                No notifications logged yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderBottom: "1px solid var(--sand-light)",
                    cursor: n.incident_id ? "pointer" : "default",
                    background: n.is_read ? "var(--white)" : "rgba(213, 138, 67, 0.05)"
                  }}
                >
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite)", margin: 0, lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <span
                    className="tabular-num"
                    style={{ fontSize: "10px", color: "var(--graphite-light)", marginTop: "4px", display: "block" }}
                  >
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
