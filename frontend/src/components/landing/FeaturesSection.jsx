import React from "react"

export default function FeaturesSection() {
  const features = [
    {
      title: "Real-time alerts",
      desc: "Instant socket pushes notify administrators and assigned responders without manual refreshing."
    },
    {
      title: "Role-based access",
      desc: "Strict server-side validation restricts report creation, assignment, and status transitions by role."
    },
    {
      title: "Live status tracking",
      desc: "Progress state transitions from reported to resolved update the interface automatically."
    },
    {
      title: "Incident history",
      desc: "Full audit trail tracks every status transition, timestamp, and responsible user."
    },
    {
      title: "Persistent storage",
      desc: "SQLite database stores incidents, assignments, notifications, and hashed credentials."
    },
    {
      title: "Multi-client connections",
      desc: "Concurrent TCP client handling with thread-safe send locks prevents message interleaving."
    }
  ]

  return (
    <section
      id="features"
      style={{
        padding: "var(--space-24) var(--space-8)",
        backgroundColor: "var(--cream)",
        color: "var(--graphite)"
      }}
    >
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-12)", textAlign: "left" }}>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--amber-dark)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}
          >
            System Capabilities
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-4xl)",
              textTransform: "uppercase",
              margin: "var(--space-2) 0 0",
              letterSpacing: "0.02em"
            }}
          >
            Features
          </h2>
        </div>

        {/* Two-column list with horizontal dividers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "var(--space-8) var(--space-12)"
          }}
        >
          {features.map((f, i) => (
            <div
              key={f.title}
              style={{
                borderTop: "1px solid var(--sand)",
                paddingTop: "var(--space-4)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)"
              }}
            >
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--amber)",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.04em"
                }}
              >
                0{i + 1}
              </span>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--graphite)", margin: 0 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", lineHeight: 1.5, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
