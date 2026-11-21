import React from "react"

export default function BridgeTrack() {
  return (
    <div
      style={{
        position: "relative",
        width: "260px",
        height: "64px",
        background: "var(--graphite)",
        borderRadius: "var(--radius-pill)",
        border: "1px solid rgba(232, 220, 210, 0.25)",
        boxShadow: "inset 0 3px 8px rgba(0, 0, 0, 0.5), 0 12px 24px rgba(48, 43, 42, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        overflow: "hidden",
        userSelect: "none"
      }}
    >
      {/* Background connector track line */}
      <div
        style={{
          position: "absolute",
          left: "28px",
          right: "28px",
          top: "50%",
          height: "2px",
          backgroundColor: "rgba(232, 220, 210, 0.2)",
          transform: "translateY(-50%)",
          zIndex: 1
        }}
      />

      {/* Node 1: Student */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "var(--cream)",
            border: "2px solid var(--graphite)"
          }}
        />
        <span style={{ fontSize: "9px", color: "var(--sand)", marginTop: "2px", fontWeight: 600 }}>STUDENT</span>
      </div>

      {/* Node 2: Server */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "var(--amber)",
            border: "2px solid var(--graphite)"
          }}
        />
        <span style={{ fontSize: "9px", color: "var(--amber)", marginTop: "2px", fontWeight: 700 }}>TCP SERVER</span>
      </div>

      {/* Node 3: Responder */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "var(--cream)",
            border: "2px solid var(--graphite)"
          }}
        />
        <span style={{ fontSize: "9px", color: "var(--sand)", marginTop: "2px", fontWeight: 600 }}>RESPONDER</span>
      </div>

      {/* Sliding report packet animation */}
      <div
        style={{
          position: "absolute",
          top: "18px",
          width: "28px",
          height: "28px",
          background: "linear-gradient(135deg, #FFFFFF, var(--sand))",
          borderRadius: "6px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          animation: "slideTrack 4s ease-in-out infinite"
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="2.5">
          <path d="M12 2v20M2 12h20" />
        </svg>
      </div>

      <style>{`
        @keyframes slideTrack {
          0% { left: 16px; opacity: 0; transform: scale(0.85); }
          15% { left: 24px; opacity: 1; transform: scale(1); }
          50% { left: 116px; opacity: 1; transform: scale(1.05); }
          85% { left: 206px; opacity: 1; transform: scale(1); }
          100% { left: 220px; opacity: 0; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
