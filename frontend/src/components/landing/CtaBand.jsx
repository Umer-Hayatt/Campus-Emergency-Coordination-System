import React from "react"
import { Link } from "react-router-dom"

export default function CtaBand() {
  return (
    <section
      style={{
        padding: "var(--space-16) var(--space-8)",
        backgroundColor: "var(--rose)",
        color: "var(--white)",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            textTransform: "uppercase",
            lineHeight: 1,
            margin: "0 0 var(--space-6)"
          }}
        >
          Connecting emergencies to action.
        </h2>

        <Link
          to="/login"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 44px",
            background: "var(--graphite)",
            color: "var(--cream)",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--text-base)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            boxShadow:
              "inset 0 1px 0 rgba(232, 220, 210, 0.45), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 8px 24px rgba(48, 43, 42, 0.4)",
            border: "1px solid rgba(232, 220, 210, 0.25)",
            transition: "transform 180ms ease, box-shadow 180ms ease",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
          }}
        >
          <span>Get started</span>
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "16px",
              height: "16px",
              clipPath: "polygon(100% 0, 0 0, 100% 100%)",
              backgroundColor: "var(--amber)"
            }}
          />
        </Link>
      </div>
    </section>
  )
}
