import React from "react"
import { Link } from "react-router-dom"
import Navbar from "./Navbar"
import FloatingObjects from "./FloatingObjects"

export default function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "calc(var(--space-24) + 20px) var(--space-6) var(--space-16)",
        background: "radial-gradient(circle at 50% 48%, var(--rose-glow) 0%, var(--rose) 62%)",
        color: "var(--white)",
        overflow: "hidden"
      }}
    >
      <Navbar />
      <FloatingObjects />

      {/* Main Headline content container */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: "1000px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-display)",
            lineHeight: 0.95,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            margin: "0 0 var(--space-6)",
            userSelect: "none"
          }}
        >
          <span style={{ color: "var(--white)", display: "block" }}>Connecting</span>
          <span style={{ color: "var(--white)", display: "block" }}>emergencies</span>
          <span style={{ color: "var(--amber)", display: "block" }}>to action.</span>
        </h1>

        <p
          style={{
            fontSize: "clamp(0.95rem, 1.6vw, 1.125rem)",
            color: "var(--sand)",
            maxWidth: "44ch",
            lineHeight: 1.5,
            margin: "0 0 var(--space-8)",
            fontWeight: 400
          }}
        >
          Report, assign and resolve campus emergencies in real time, from the first alert to final resolution.
        </p>

        {/* Bevelled keycap button */}
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
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(232, 220, 210, 0.5), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 12px 32px rgba(48, 43, 42, 0.5)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow =
              "inset 0 1px 0 rgba(232, 220, 210, 0.45), inset 0 -2px 0 rgba(0, 0, 0, 0.6), 0 8px 24px rgba(48, 43, 42, 0.4)"
          }}
        >
          <span>Get started</span>

          {/* Small amber triangle corner accent */}
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
