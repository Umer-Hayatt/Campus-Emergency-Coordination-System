import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Logo from "../Logo"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "var(--space-4) var(--space-8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background-color 250ms ease, backdrop-filter 250ms ease, box-shadow 250ms ease",
        backgroundColor: scrolled ? "rgba(48, 43, 42, 0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "var(--shadow-md)" : "none"
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <a href="#hero" aria-label="AlertBridge Home">
          <Logo variant="light" />
        </a>
      </div>

      {/* Desktop Links */}
      <nav
        aria-label="Main Navigation"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-8)"
        }}
        className="desktop-nav"
      >
        <a
          href="#how-it-works"
          style={{ fontSize: "var(--text-sm)", color: "var(--cream)", fontWeight: 500, opacity: 0.9 }}
        >
          How it works
        </a>
        <a
          href="#roles"
          style={{ fontSize: "var(--text-sm)", color: "var(--cream)", fontWeight: 500, opacity: 0.9 }}
        >
          Roles
        </a>
        <a
          href="#features"
          style={{ fontSize: "var(--text-sm)", color: "var(--cream)", fontWeight: 500, opacity: 0.9 }}
        >
          Features
        </a>
        <a
          href="#architecture"
          style={{ fontSize: "var(--text-sm)", color: "var(--cream)", fontWeight: 500, opacity: 0.9 }}
        >
          Architecture
        </a>
      </nav>

      {/* Action button */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Link
          to="/login"
          style={{
            padding: "8px 20px",
            backgroundColor: "var(--amber)",
            color: "var(--graphite)",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            letterSpacing: "0.02em",
            boxShadow: "0 2px 8px rgba(48, 43, 42, 0.2)",
            display: "inline-block"
          }}
        >
          Log in
        </Link>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="mobile-nav-toggle"
          style={{
            display: "none",
            color: "var(--cream)",
            padding: "6px",
            cursor: "pointer"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "var(--graphite)",
            borderBottom: "1px solid var(--sand)",
            padding: "var(--space-6) var(--space-8)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)"
          }}
        >
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--cream)", fontSize: "var(--text-base)" }}
          >
            How it works
          </a>
          <a
            href="#roles"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--cream)", fontSize: "var(--text-base)" }}
          >
            Roles
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--cream)", fontSize: "var(--text-base)" }}
          >
            Features
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: "var(--cream)", fontSize: "var(--text-base)" }}
          >
            Architecture
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  )
}
