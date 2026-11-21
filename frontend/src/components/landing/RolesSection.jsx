import React from "react"

export default function RolesSection() {
  return (
    <section
      id="roles"
      style={{
        padding: "var(--space-24) var(--space-8)",
        backgroundColor: "var(--white)",
        color: "var(--graphite)"
      }}
    >
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-12)", textAlign: "left" }}>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--rose)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}
          >
            Access Control
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
            User Roles
          </h2>
        </div>

        {/* Asymmetric layout: 1 large featured card + 2 secondary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "var(--space-6)"
          }}
          className="roles-grid"
        >
          {/* Card 1: Administrator (Featured) */}
          <div
            style={{
              background: "var(--graphite)",
              color: "var(--cream)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(232, 220, 210, 0.2)"
            }}
          >
            <div>
              <div style={{ display: "inline-block", padding: "4px 10px", background: "var(--amber)", color: "var(--graphite)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "var(--space-4)" }}>
                COORDINATION
              </div>
              <h3 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--white)" }}>
                Administrator
              </h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--sand)", lineHeight: 1.6, marginBottom: "var(--space-6)" }}>
                The central control room officer responsible for incident triage, responder deployment, and situation tracking.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)", fontSize: "var(--text-sm)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>•</span>
                  <span>Monitor all campus incident reports in real time</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>•</span>
                  <span>Review reports and assign eligible security or medical responders</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>•</span>
                  <span>Cancel or reject reports with an audit log record</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>•</span>
                  <span>Send manual alerts across active connections</span>
                </li>
              </ul>
            </div>
            <div style={{ marginTop: "var(--space-8)", fontSize: "var(--text-xs)", color: "var(--sand)", borderTop: "1px solid rgba(232, 220, 210, 0.15)", paddingTop: "var(--space-4)" }}>
              Demo account: admin01
            </div>
          </div>

          {/* Right column: Student and Responder */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {/* Card 2: Student */}
            <div
              style={{
                background: "var(--cream)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                border: "1px solid var(--sand)"
              }}
            >
              <div style={{ display: "inline-block", padding: "4px 10px", background: "var(--sand)", color: "var(--graphite)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
                REPORTING
              </div>
              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                Student
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--rose)", fontWeight: 700 }}>•</span>
                  <span>Submit emergency reports with location and severity</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--rose)", fontWeight: 700 }}>•</span>
                  <span>Track status updates pushed directly by responders</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--rose)", fontWeight: 700 }}>•</span>
                  <span>View full history for submitted reports</span>
                </li>
              </ul>
              <div style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--graphite-light)" }}>
                Demo account: student01
              </div>
            </div>

            {/* Card 3: Responder */}
            <div
              style={{
                background: "var(--cream)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                border: "1px solid var(--sand)"
              }}
            >
              <div style={{ display: "inline-block", padding: "4px 10px", background: "var(--rose)", color: "var(--white)", borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 700, marginBottom: "var(--space-3)" }}>
                RESPONSE
              </div>
              <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                Responder (Security & Medical)
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--rose)", fontWeight: 700 }}>•</span>
                  <span>Receive assigned incidents via selective push notifications</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--rose)", fontWeight: 700 }}>•</span>
                  <span>Progress task lifecycle: Accepted, En Route, On Scene, Resolved</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--rose)", fontWeight: 700 }}>•</span>
                  <span>Manage emergency tasks on a focused queue</span>
                </li>
              </ul>
              <div style={{ marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--graphite-light)" }}>
                Demo accounts: sec01, med01
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .roles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
