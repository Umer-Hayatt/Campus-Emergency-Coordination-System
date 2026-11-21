import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Logo from "../components/Logo"
import ConnectionStatus from "../components/ConnectionStatus"

export default function Login() {
  const { login, sessionNotice } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username and password are required.")
      return
    }

    setErrorMsg("")
    setLoading(true)

    try {
      const user = await login(username.trim(), password)
      if (user.role === "student") {
        navigate("/student")
      } else if (user.role === "admin") {
        navigate("/admin")
      } else if (user.role === "security" || user.role === "medical") {
        navigate("/responder")
      } else {
        navigate("/")
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid username or password.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (u, p) => {
    setUsername(u)
    setPassword(p)
    setErrorMsg("")
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        backgroundColor: "var(--rose)",
        backgroundImage: "radial-gradient(circle at 50% 40%, var(--rose-glow) 0%, var(--rose) 65%)"
      }}
    >
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link to="/" aria-label="Return to landing page">
          <Logo variant="light" />
        </Link>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--white)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--sand)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--graphite)", margin: 0 }}>
            Sign in
          </h2>
          <ConnectionStatus />
        </div>

        {sessionNotice && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(213, 138, 67, 0.15)",
              color: "var(--amber-dark)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              marginBottom: "var(--space-4)",
              border: "1px solid rgba(213, 138, 67, 0.3)"
            }}
          >
            {sessionNotice}
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: "8px 12px",
              background: "rgba(143, 52, 56, 0.1)",
              color: "var(--rose)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              marginBottom: "var(--space-4)",
              border: "1px solid rgba(143, 52, 56, 0.25)"
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label
              htmlFor="username"
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)", marginBottom: "4px" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. student01"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--sand)",
                backgroundColor: "var(--cream)"
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)", marginBottom: "4px" }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: "100%",
                  padding: "10px 38px 10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--sand)",
                  backgroundColor: "var(--cream)"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--graphite-light)",
                  padding: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "var(--space-2)",
              padding: "12px",
              backgroundColor: "var(--rose)",
              color: "var(--white)",
              borderRadius: "var(--radius-pill)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              transition: "background-color 150ms ease",
              border: "none"
            }}
          >
            {loading ? "Authenticating..." : "Log in"}
          </button>
        </form>

        {/* Collapsible Demo Accounts Section */}
        <div style={{ marginTop: "var(--space-6)", borderTop: "1px solid var(--sand-light)", paddingTop: "var(--space-4)" }}>
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              fontSize: "var(--text-xs)",
              color: "var(--graphite-light)",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <span>Demo accounts hint</span>
            <span style={{ fontSize: "10px" }}>{showDemo ? "Hide" : "Show"}</span>
          </button>

          {showDemo && (
            <div style={{ marginTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { u: "student01", r: "Student" },
                { u: "admin01", r: "Administrator" },
                { u: "sec01", r: "Security" },
                { u: "med01", r: "Medical" }
              ].map((acc) => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => fillDemo(acc.u, "pass")}
                  style={{
                    padding: "6px 8px",
                    background: "var(--cream)",
                    border: "1px solid var(--sand)",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "var(--text-xs)"
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--graphite)" }}>{acc.u}</span>
                  <span style={{ color: "var(--graphite-light)" }}>{acc.r} (pass)</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
