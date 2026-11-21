import React from "react"

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Suppress crash propagation
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-6)",
            background: "var(--cream)",
            color: "var(--graphite)",
            textAlign: "center"
          }}
        >
          <div
            style={{
              maxWidth: "460px",
              background: "var(--white)",
              border: "1px solid var(--sand)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-8)",
              boxShadow: "var(--shadow-md)"
            }}
          >
            <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)", color: "var(--rose)" }}>
              Application error encountered
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", marginBottom: "var(--space-6)" }}>
              The component tree hit an unhandled exception. Return to home to resume operations.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: "10px 20px",
                background: "var(--graphite)",
                color: "var(--cream)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Return to landing page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
