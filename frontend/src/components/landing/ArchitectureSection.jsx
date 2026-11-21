import React from "react"

export default function ArchitectureSection() {
  const nodes = [
    {
      title: "React UI",
      desc: "Single-page dashboard, SocketContext, NDJSON framing"
    },
    {
      title: "WebSocket",
      desc: "Browser-compatible full duplex stream (ws://localhost:8080)"
    },
    {
      title: "Node.js Bridge",
      desc: "WebSocket to TCP relay, 1 TCP socket per frontend client"
    },
    {
      title: "TCP Sockets",
      desc: "Raw byte stream over port 5000, newline delimiters"
    },
    {
      title: "Python Server",
      desc: "Thread per client, in-memory registry, per-socket send locks"
    },
    {
      title: "SQLite Database",
      desc: "ACID transactions, DB write lock, PBKDF2 credentials"
    }
  ]

  return (
    <section
      id="architecture"
      style={{
        padding: "var(--space-24) var(--space-8)",
        backgroundColor: "var(--graphite)",
        color: "var(--cream)"
      }}
    >
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-12)", textAlign: "left" }}>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--amber)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}
          >
            Network Architecture
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-4xl)",
              textTransform: "uppercase",
              margin: "var(--space-2) 0 0",
              letterSpacing: "0.02em",
              color: "var(--white)"
            }}
          >
            System Pipeline
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--sand)", maxWidth: "56ch", marginTop: "var(--space-2)" }}>
            Application-level routing built directly on standard library TCP sockets and multi-threading.
          </p>
        </div>

        {/* Diagram container */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: "var(--space-3)",
            overflowX: "auto",
            paddingBottom: "var(--space-6)"
          }}
          className="arch-flow"
        >
          {nodes.map((n, i) => (
            <React.Fragment key={n.title}>
              {/* Node Card */}
              <div
                style={{
                  flex: "1 1 0",
                  minWidth: "160px",
                  background: "var(--graphite-light)",
                  border: "1px solid rgba(232, 220, 210, 0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-xs)",
                      color: "var(--amber)",
                      display: "block",
                      marginBottom: "var(--space-2)"
                    }}
                  >
                    STEP 0{i + 1}
                  </span>
                  <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--white)", margin: "0 0 6px" }}>
                    {n.title}
                  </h3>
                </div>
                <p style={{ fontSize: "11px", color: "var(--sand)", lineHeight: 1.4, margin: 0 }}>
                  {n.desc}
                </p>
              </div>

              {/* Animated Connector Arrow between nodes */}
              {i < nodes.length - 1 && (
                <div
                  className="arch-connector"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    width: "24px",
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "2px",
                      background: "rgba(232, 220, 210, 0.2)",
                      position: "relative"
                    }}
                  >
                    {/* Animated moving dot */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-3px",
                        left: 0,
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "var(--amber)",
                        animation: "arrowDot 2s ease-in-out infinite"
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes arrowDot {
          0% { left: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 80%; opacity: 0; }
        }

        @media (max-width: 900px) {
          .arch-flow {
            flex-direction: column !important;
          }
          .arch-connector {
            width: 2px !important;
            height: 20px !important;
            margin: 0 auto;
          }
          .arch-connector > div {
            width: 2px !important;
            height: 100% !important;
          }
          @keyframes arrowDot {
            0% { top: 0%; opacity: 0; left: -3px; }
            50% { opacity: 1; }
            100% { top: 80%; opacity: 0; left: -3px; }
          }
        }
      `}</style>
    </section>
  )
}
