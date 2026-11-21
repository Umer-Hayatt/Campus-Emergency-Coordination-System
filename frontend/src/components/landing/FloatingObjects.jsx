import React, { useEffect, useState } from "react"
import BridgeTrack from "./BridgeTrack"

export default function FloatingObjects() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Gentle depth parallax factor
      const x = (e.clientX / window.innerWidth - 0.5) * 16
      const y = (e.clientY / window.innerHeight - 0.5) * 16
      setMousePos({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="floating-objects-container" aria-hidden="true">
      {/* ────────────────────────────────────────────────────────── */}
      {/* LEFT CLUSTER: Tilted overlapping cards                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        className="hero-left-cluster"
        style={{
          transform: `translate(${mousePos.x * 0.7}px, ${mousePos.y * 0.7}px)`
        }}
      >
        {/* Card 1: Medical (White glossy clay card, rotated -18deg) */}
        <div className="hero-card-medical">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--rose)", textTransform: "uppercase" }}>
              Medical
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                background: "var(--rose)",
                color: "var(--white)",
                padding: "1px 6px",
                borderRadius: "4px"
              }}
            >
              CRITICAL
            </span>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--graphite)", margin: 0, lineHeight: 1.2 }}>
            Library Floor 3
          </p>
          <span style={{ fontSize: "9px", color: "var(--graphite-light)", display: "block", marginTop: "4px" }}>
            Asthma response
          </span>
        </div>

        {/* Card 2: Fire (Amber glossy card, rotated -11deg) */}
        <div className="hero-card-fire">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Fire Alert
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                background: "rgba(48, 43, 42, 0.8)",
                color: "var(--white)",
                padding: "1px 6px",
                borderRadius: "4px"
              }}
            >
              HIGH
            </span>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Science Lab 204</p>
          <span style={{ fontSize: "9px", opacity: 0.9, display: "block", marginTop: "4px" }}>Chemical cabinet</span>
        </div>

        {/* Card 3: Security (Dark graphite card, rotated -4deg) */}
        <div className="hero-card-security">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--amber)", textTransform: "uppercase" }}>
              Security
            </span>
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                background: "rgba(232, 220, 210, 0.2)",
                color: "var(--sand)",
                padding: "1px 6px",
                borderRadius: "4px"
              }}
            >
              MEDIUM
            </span>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Main Gate Block A</p>
          <span style={{ fontSize: "9px", color: "var(--sand)", display: "block", marginTop: "4px" }}>
            Access incident
          </span>
        </div>

        {/* 3D Pointer Cursor arrow */}
        <div className="hero-cursor-pointer">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
              fill="var(--graphite)"
              stroke="var(--white)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* CENTER-LEFT: Bridge track slot (representing TCP bridge)  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        className="hero-bridge-track-container"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`
        }}
      >
        <BridgeTrack />
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* RIGHT CLUSTER: Glossy controls, tiles and badges           */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        className="hero-right-cluster"
        style={{
          transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px)`
        }}
      >
        {/* Glossy Toggle Switch: "Available" */}
        <div className="hero-toggle-available">
          <div className="hero-toggle-pill">
            <div className="hero-toggle-knob" />
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--graphite)" }}>Available</span>
        </div>

        {/* Real-time siren tile (graphite rounded tile) */}
        <div className="hero-tile-siren">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.75">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Frosted Glass Tile */}
        <div className="hero-tile-frosted">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="1.75">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: "9px", color: "var(--white)", fontWeight: 600 }}>CAMPUS</span>
        </div>

        {/* Role-based Shield & Padlock */}
        <div className="hero-tile-shield">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.75">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
      </div>
    </div>
  )
}
