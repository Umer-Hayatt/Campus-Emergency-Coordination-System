import React from "react"
import { useSocket } from "../context/SocketContext"

export default function ConnectionStatus() {
  const { connectionStatus, retry } = useSocket()

  const config = {
    connected: {
      label: "Connected",
      bg: "rgba(63, 125, 78, 0.12)",
      fg: "#3f7d4e",
      dot: "#3f7d4e"
    },
    connecting: {
      label: "Connecting",
      bg: "rgba(213, 138, 67, 0.15)",
      fg: "var(--amber-dark)",
      dot: "var(--amber)"
    },
    disconnected: {
      label: "Disconnected",
      bg: "rgba(143, 52, 56, 0.12)",
      fg: "var(--rose)",
      dot: "var(--rose)"
    }
  }

  const current = config[connectionStatus] || config.disconnected

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "4px 10px",
        borderRadius: "var(--radius-pill)",
        background: current.bg,
        color: current.fg,
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        border: `1px solid ${current.fg}22`
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          backgroundColor: current.dot
        }}
      />
      <span>{current.label}</span>
      {connectionStatus === "disconnected" && (
        <button
          onClick={retry}
          style={{
            marginLeft: "var(--space-1)",
            padding: "2px 6px",
            background: "var(--rose)",
            color: "var(--white)",
            borderRadius: "var(--radius-sm)",
            fontSize: "10px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      )}
    </div>
  )
}
