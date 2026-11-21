import React from "react"

export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div
      style={{
        padding: "var(--space-12) var(--space-6)",
        textAlign: "center",
        background: "var(--white)",
        border: "1px solid var(--sand)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)"
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "var(--sand)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--graphite)"
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="M22 6l-10 7L2 6" />
        </svg>
      </div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--graphite-light)",
          maxWidth: "36ch",
          margin: 0
        }}
      >
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: "var(--space-2)",
            padding: "8px 16px",
            background: "var(--graphite)",
            color: "var(--cream)",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
