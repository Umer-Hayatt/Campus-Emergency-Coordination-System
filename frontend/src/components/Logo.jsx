import React from "react"

export default function Logo({ variant = "light", size = "normal" }) {
  const isLight = variant === "light"
  const textColor = isLight ? "var(--cream)" : "var(--graphite)"
  const archColor = isLight ? "var(--cream)" : "var(--rose)"

  const scale = size === "small" ? 0.8 : 1

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", userSelect: "none" }}>
      <svg
        width={30 * scale}
        height={26 * scale}
        viewBox="0 0 30 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Signal beacon dot */}
        <circle cx="15" cy="4" r="3" fill="var(--amber)" />
        {/* Signal waves */}
        <path
          d="M10 5.5C11.3 4 13 3 15 3C17 3 18.7 4 20 5.5"
          stroke="var(--amber)"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Bridge deck */}
        <path
          d="M2 13H28"
          stroke={archColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Bridge arch */}
        <path
          d="M5 24C6.5 17 10 14 15 14C20 14 23.5 17 25 24"
          stroke={archColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Pier foundations */}
        <path d="M5 24V25M25 24V25" stroke={archColor} strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size === "small" ? "var(--text-lg)" : "var(--text-xl)",
          letterSpacing: "0.05em",
          color: textColor,
          textTransform: "uppercase",
          lineHeight: 1
        }}
      >
        AlertBridge
      </span>
    </div>
  )
}
