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
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 2
      }}
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* LEFT CLUSTER: Fanned incident cards overlapping headline  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div
        className="hero-left-cluster"
        style={{
          position: "absolute",
          top: "22%",
          left: "5%",
          transform: `translate(${mousePos.x * 0.7}px, ${mousePos.y * 0.7}px)`
        }}
      >
        {/* Card 1: Medical (White glossy clay card, rotated -18deg) */}
        <div
          style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "170px",
            padding: "12px 14px",
            background: "linear-gradient(135deg, #FFFFFF 0%, #FAF6F2 100%)",
            borderRadius: "14px",
            border: "1px solid rgba(232, 220, 210, 0.8)",
            boxShadow: "0 18px 36px rgba(48, 43, 42, 0.3)",
            transform: "rotate(-18deg)",
            animation: "floatSlow 6s ease-in-out infinite"
          }}
        >
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
        <div
          style={{
            position: "absolute",
            top: "52px",
            left: "54px",
            width: "175px",
            padding: "12px 14px",
            background: "linear-gradient(135deg, #E0954F 0%, #D58A43 100%)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 20px 40px rgba(48, 43, 42, 0.35)",
            transform: "rotate(-11deg)",
            color: "var(--white)",
            animation: "floatMed 7s ease-in-out infinite 0.5s"
          }}
        >
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
        <div
          style={{
            position: "absolute",
            top: "108px",
            left: "108px",
            width: "175px",
            padding: "12px 14px",
            background: "linear-gradient(135deg, #3A3432 0%, #2A2524 100%)",
            borderRadius: "14px",
            border: "1px solid rgba(232, 220, 210, 0.2)",
            boxShadow: "0 22px 44px rgba(48, 43, 42, 0.4)",
            transform: "rotate(-4deg)",
            color: "var(--cream)",
            animation: "floatSlow 8s ease-in-out infinite 1s"
          }}
        >
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

        {/* 3D Pointer Cursor arrow pointing at the front card */}
        <div
          style={{
            position: "absolute",
            top: "160px",
            left: "70px",
            zIndex: 10,
            filter: "drop-shadow(0 8px 16px rgba(48, 43, 42, 0.4))",
            animation: "cursorFloat 5s ease-in-out infinite"
          }}
        >
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
        className="hero-bridge-track"
        style={{
          position: "absolute",
          bottom: "16%",
          left: "12%",
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
          position: "absolute",
          top: "20%",
          right: "6%",
          width: "280px",
          height: "360px",
          transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px)`
        }}
      >
        {/* Glossy Toggle Switch: "Available" */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 16px",
            background: "linear-gradient(135deg, #FFFFFF, #FAF6F2)",
            borderRadius: "var(--radius-pill)",
            boxShadow: "0 14px 28px rgba(48, 43, 42, 0.28)",
            transform: "rotate(6deg)",
            animation: "floatSlow 7s ease-in-out infinite 0.2s"
          }}
        >
          <div
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              background: "#3f7d4e",
              position: "relative",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)"
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FFFFFF, #F0EAE1)",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)"
              }}
            />
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--graphite)" }}>Available</span>
        </div>

        {/* Real-time siren tile (graphite rounded tile) */}
        <div
          style={{
            position: "absolute",
            top: "84px",
            right: "130px",
            width: "68px",
            height: "68px",
            background: "linear-gradient(135deg, #383230, #252120)",
            borderRadius: "18px",
            border: "1px solid rgba(232, 220, 210, 0.15)",
            boxShadow: "0 18px 36px rgba(48, 43, 42, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-8deg)",
            animation: "floatMed 6s ease-in-out infinite 0.8s"
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.75">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>

        {/* Frosted Glass Tile (allowed single glassmorphism element) */}
        <div
          style={{
            position: "absolute",
            top: "154px",
            right: "50px",
            width: "84px",
            height: "84px",
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 20px 40px rgba(48, 43, 42, 0.25)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            transform: "rotate(4deg)",
            animation: "floatSlow 8s ease-in-out infinite 1.2s"
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="1.75">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: "9px", color: "var(--white)", fontWeight: 600 }}>CAMPUS</span>
        </div>

        {/* Role-based Shield & Padlock */}
        <div
          style={{
            position: "absolute",
            top: "220px",
            right: "140px",
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, var(--rose-dark), var(--rose))",
            borderRadius: "16px",
            border: "1px solid var(--amber)",
            boxShadow: "0 16px 32px rgba(48, 43, 42, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-12deg)",
            animation: "floatMed 7s ease-in-out infinite 1.5s"
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.75">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-8px) rotate(var(--rot, 0deg)); }
        }
        @keyframes floatMed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-11px); }
        }
        @keyframes cursorFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(4px, -6px); }
        }

        @media (max-width: 1024px) {
          .hero-bridge-track { display: none; }
          .hero-left-cluster { left: -20px; transform: scale(0.85); }
          .hero-right-cluster { right: -20px; transform: scale(0.85); }
        }

        @media (max-width: 768px) {
          .hero-left-cluster { display: none; }
          .hero-right-cluster {
            top: auto;
            bottom: 40px;
            right: 10px;
            transform: scale(0.7);
          }
        }
      `}</style>
    </div>
  )
}
