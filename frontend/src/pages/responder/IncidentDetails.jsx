import React, { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { useSocket } from "../../context/SocketContext"
import { useAuth } from "../../context/AuthContext"
import {
  createGetIncidentsMsg,
  createGetIncidentHistoryMsg,
  createUpdateStatusMsg,
  MSG_TYPES
} from "../../api/protocol"
import { getAvailableStatusActions } from "../../utils/transitions"
import StatusBadge from "../../components/StatusBadge"
import SeverityChip from "../../components/SeverityChip"
import Timeline from "../../components/Timeline"
import { formatDateTime, formatIncidentType, formatStatus } from "../../utils/format"

export default function ResponderIncidentDetails() {
  const { id } = useParams()
  const { request, subscribe } = useSocket()
  const { user } = useAuth()

  const [incident, setIncident] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionPending, setActionPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [listReply, histReply] = await Promise.all([
        request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST),
        request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY)
      ])
      const found = (listReply.incidents || []).find((i) => Number(i.id) === Number(id))
      setIncident(found || null)
      setHistory(histReply.history || [])
    } catch {
      // Failed to load
    } finally {
      setLoading(false)
    }
  }, [id, request])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time status update push
  useEffect(() => {
    const unsub = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      if (Number(msg.incident_id) === Number(id)) {
        setIncident((prev) => (prev ? { ...prev, status: msg.new_status } : prev))
        request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY).then((r) => {
          if (r.history) setHistory(r.history)
        })
      }
    })
    return () => unsub()
  }, [id, subscribe, request])

  // Progress incident lifecycle step
  const handleTransition = async (nextStatus) => {
    setErrorMsg("")
    setActionPending(true)
    try {
      await request(createUpdateStatusMsg(id, nextStatus), MSG_TYPES.STATUS_UPDATED)
      setIncident((prev) => (prev ? { ...prev, status: nextStatus } : prev))
      const hist = await request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY)
      if (hist.history) setHistory(hist.history)
    } catch (err) {
      setErrorMsg(err.message || "Failed to update incident progress.")
    } finally {
      setActionPending(false)
    }
  }

  if (loading) {
    return <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading incident details...</p>
  }

  if (!incident) {
    return (
      <div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Incident #{id} not found.</p>
        <Link to="/responder" style={{ fontSize: "var(--text-xs)", color: "var(--rose)", fontWeight: 600 }}>
          Back to Task Queue
        </Link>
      </div>
    )
  }

  // Next valid actions allowed for this responder
  const nextActions = getAvailableStatusActions(incident.status, user?.role, true)

  const getActionLabel = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "Accept assignment"
      case "EN_ROUTE":
        return "Mark en route"
      case "ON_SCENE":
        return "Mark on scene"
      case "RESOLVED":
        return "Mark resolved"
      default:
        return `Transition to ${formatStatus(status)}`
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "860px" }}>
      {/* Breadcrumb */}
      <div>
        <Link
          to="/responder"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--graphite-light)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 500
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to task queue
        </Link>
      </div>

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
            border: "1px solid rgba(143, 52, 56, 0.25)"
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Main Details Card */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--sand)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
          <div>
            <span
              className="tabular-num"
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--graphite-light)",
                fontWeight: 600,
                textTransform: "uppercase"
              }}
            >
              Task #{incident.id}
            </span>
            <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: "2px 0 0", color: "var(--graphite)" }}>
              {incident.title}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <SeverityChip severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Metadata */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-4)",
            padding: "var(--space-4)",
            background: "var(--cream)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-6)"
          }}
        >
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", display: "block" }}>Location</span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--graphite)" }}>{incident.location}</span>
          </div>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", display: "block" }}>Category</span>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--graphite)" }}>{formatIncidentType(incident.type)}</span>
          </div>
          <div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", display: "block" }}>Reported Time</span>
            <span className="tabular-num" style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--graphite)" }}>{formatDateTime(incident.created_at)}</span>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--graphite-light)", marginBottom: "var(--space-2)" }}>
            Situation Description
          </h4>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite)", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
            {incident.description}
          </p>
        </div>
      </div>

      {/* Lifecycle Progression Control Card */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--sand)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-6)"
        }}
      >
        <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "0 0 var(--space-4)", color: "var(--graphite)" }}>
          Response Progress Actions
        </h3>

        {nextActions.length > 0 ? (
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {nextActions.map((nextStatus) => (
              <button
                key={nextStatus}
                disabled={actionPending}
                onClick={() => handleTransition(nextStatus)}
                style={{
                  padding: "12px 24px",
                  background: nextStatus === "RESOLVED" ? "#3f7d4e" : "var(--rose)",
                  color: "var(--white)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  cursor: actionPending ? "wait" : "pointer",
                  border: "none",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                {getActionLabel(nextStatus)}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", margin: 0 }}>
            {incident.status === "RESOLVED"
              ? "Incident is resolved."
              : `Current status is ${formatStatus(incident.status)}. No immediate actions available.`}
          </p>
        )}
      </div>

      {/* Response Timeline */}
      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--sand)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-sm)"
        }}
      >
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-6)", color: "var(--graphite)" }}>
          Response Timeline
        </h3>
        <Timeline history={history} />
      </div>
    </div>
  )
}
