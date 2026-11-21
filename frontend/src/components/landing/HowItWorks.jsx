import React from "react"

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Report",
      desc: "Student submits incident details including location, category, severity, and situation summary.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.75">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      )
    },
    {
      num: "02",
      title: "Notify",
      desc: "The TCP server accepts the report and pushes real-time alert frames directly to all connected control room admins.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.75">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    {
      num: "03",
      title: "Assign",
      desc: "The administrator reviews the report and selects the eligible responder. The alert is unicast strictly to that responder.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.75">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      )
    },
    {
      num: "04",
      title: "Resolve",
      desc: "The responder progresses the incident through verified states until resolved. Updates reflect live across all connected clients.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.75">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    }
  ]

  return (
    <section
      id="how-it-works"
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
            Incident Lifecycle
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
            How it works
          </h2>
        </div>

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-6)"
          }}
        >
          {steps.map((s, idx) => (
            <div
              key={s.num}
              style={{
                position: "relative",
                background: "var(--white)",
                border: "1px solid var(--sand)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-3xl)",
                    color: "var(--amber)",
                    lineHeight: 1
                  }}
                >
                  {s.num}
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--sand-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {s.icon}
                </div>
              </div>

              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--graphite)", margin: 0 }}>
                {s.title}
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", lineHeight: 1.5, margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
