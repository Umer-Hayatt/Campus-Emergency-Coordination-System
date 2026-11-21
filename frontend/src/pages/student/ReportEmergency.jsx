import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../../context/SocketContext"
import { createReportIncidentMsg, MSG_TYPES, INCIDENT_TYPES, SEVERITIES } from "../../api/protocol"
import { formatIncidentType } from "../../utils/format"

export default function ReportEmergency() {
  const { request } = useSocket()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [incidentType, setIncidentType] = useState("medical")
  const [severity, setSeverity] = useState("high")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validations mirroring server limits
    if (!title.trim() || title.trim().length > 100) {
      setErrorMsg("Title must be a non-empty string of up to 100 characters.")
      return
    }
    if (!location.trim() || location.trim().length > 200) {
      setErrorMsg("Location must be a non-empty string of up to 200 characters.")
      return
    }
    if (!description.trim() || description.trim().length > 1000) {
      setErrorMsg("Description must be a non-empty string of up to 1000 characters.")
      return
    }

    setErrorMsg("")
    setSubmitting(true)

    try {
      const msg = createReportIncidentMsg(
        title.trim(),
        description.trim(),
        location.trim(),
        incidentType,
        severity
      )
      const reply = await request(msg, MSG_TYPES.INCIDENT_CREATED)
      navigate(`/student/incidents/${reply.incident_id}`)
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit emergency report.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0, color: "var(--graphite)" }}>
          Report Campus Emergency
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", margin: "4px 0 0" }}>
          Submitted alerts transmit directly to control room administrators via real-time TCP sockets.
        </p>
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--sand)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              background: "rgba(143, 52, 56, 0.1)",
              color: "var(--rose)",
              borderRadius: "var(--radius-sm)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              marginBottom: "var(--space-6)",
              border: "1px solid rgba(143, 52, 56, 0.25)"
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Title */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <label htmlFor="title" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)" }}>
                Incident Title
              </label>
              <span className="tabular-num" style={{ fontSize: "11px", color: "var(--graphite-light)" }}>
                {title.length}/100
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chemical spill in chemistry lab"
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

          {/* Type and Severity 2-column */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <div>
              <label htmlFor="incidentType" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)", marginBottom: "4px" }}>
                Emergency Category
              </label>
              <select
                id="incidentType"
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--sand)",
                  backgroundColor: "var(--cream)",
                  cursor: "pointer"
                }}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatIncidentType(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="severity" style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)", marginBottom: "4px" }}>
                Severity Level
              </label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--sand)",
                  backgroundColor: "var(--cream)",
                  cursor: "pointer"
                }}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <label htmlFor="location" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)" }}>
                Campus Location
              </label>
              <span className="tabular-num" style={{ fontSize: "11px", color: "var(--graphite-light)" }}>
                {location.length}/200
              </span>
            </div>
            <input
              id="location"
              type="text"
              value={location}
              maxLength={200}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Block C, 2nd floor room 204"
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

          {/* Description */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <label htmlFor="description" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite)" }}>
                Situation Description
              </label>
              <span className="tabular-num" style={{ fontSize: "11px", color: "var(--graphite-light)" }}>
                {description.length}/1000
              </span>
            </div>
            <textarea
              id="description"
              rows={4}
              value={description}
              maxLength={1000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details about the situation, casualties, or hazards present."
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--sand)",
                backgroundColor: "var(--cream)",
                resize: "vertical"
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
            <button
              type="button"
              onClick={() => navigate("/student")}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "var(--graphite-light)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "12px 28px",
                backgroundColor: "var(--rose)",
                color: "var(--white)",
                borderRadius: "var(--radius-pill)",
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                cursor: submitting ? "wait" : "pointer",
                border: "none",
                boxShadow: "var(--shadow-sm)"
              }}
            >
              {submitting ? "Transmitting..." : "Report emergency"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
