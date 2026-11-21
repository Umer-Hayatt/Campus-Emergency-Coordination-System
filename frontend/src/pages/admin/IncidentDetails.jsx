import React, { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { useSocket } from "../../context/SocketContext"
import {
  createGetIncidentsMsg,
  createGetIncidentHistoryMsg,
  createGetRespondersMsg,
  createUpdateStatusMsg,
  createAssignResponderMsg,
  MSG_TYPES
} from "../../api/protocol"
import { RESPONDER_TYPE_MAP } from "../../utils/transitions"
import StatusBadge from "../../components/StatusBadge"
import SeverityChip from "../../components/SeverityChip"
import Timeline from "../../components/Timeline"
import { formatDateTime, formatIncidentType, formatStatus } from "../../utils/format"

export default function AdminIncidentDetails() {
  const { id } = useParams()
  const { request, subscribe } = useSocket()

  const [incident, setIncident] = useState(null)
  const [history, setHistory] = useState([])
  const [responders, setResponders] = useState([])
  const [selectedResponder, setSelectedResponder] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionPending, setActionPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [listReply, histReply, respReply] = await Promise.all([
        request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST),
        request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY),
        request(createGetRespondersMsg(), MSG_TYPES.RESPONDERS_LIST)
      ])
      const found = (listReply.incidents || []).find((i) => Number(i.id) === Number(id))
      setIncident(found || null)
      setHistory(histReply.history || [])
      setResponders(respReply.responders || [])
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

  // Handle status transition update (UNDER_REVIEW, CANCELLED, REJECTED)
  const handleStatusUpdate = async (newStatus) => {
    setErrorMsg("")
    setActionPending(true)
    try {
      await request(createUpdateStatusMsg(id, newStatus), MSG_TYPES.STATUS_UPDATED)
      setIncident((prev) => (prev ? { ...prev, status: newStatus } : prev))
      const hist = await request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY)
      if (hist.history) setHistory(hist.history)
    } catch (err) {
      setErrorMsg(err.message || "Failed to update incident status.")
    } finally {
      setActionPending(false)
    }
  }

  // Handle responder assignment
  const handleAssign = async () => {
    if (!selectedResponder) {
      setErrorMsg("Select a responder to assign.")
      return
    }

    setErrorMsg("")
    setActionPending(true)
    try {
      await request(createAssignResponderMsg(id, selectedResponder), MSG_TYPES.ASSIGNED)
      setIncident((prev) => (prev ? { ...prev, status: "ASSIGNED" } : prev))
      const hist = await request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY)
      if (hist.history) setHistory(hist.history)
    } catch (err) {
      setErrorMsg(err.message || "Failed to assign responder.")
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
        <Link to="/admin/incidents" style={{ fontSize: "var(--text-xs)", color: "var(--rose)", fontWeight: 600 }}>
          Back to incidents
        </Link>
      </div>
    )
  }

  // Determine eligible responders based on incident type
  const requiredRole = RESPONDER_TYPE_MAP[incident.type]
  const eligibleResponders = responders.filter((r) => {
    if (requiredRole) return r.role === requiredRole
    return r.role === "security" || r.role === "medical"
  })

  const canBeAssigned =
    (incident.status === "REPORTED" || incident.status === "UNDER_REVIEW") &&
    incident.status !== "RESOLVED" &&
    incident.status !== "CANCELLED" &&
    incident.status !== "REJECTED"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "960px" }}>
      {/* Breadcrumb */}
      <div>
        <Link
          to="/admin/incidents"
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
          Back to all incidents
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
              Incident #{incident.id}
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

      {/* Admin Action Controls: Status Transitions & Responder Assignment */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-6)"
        }}
        className="admin-actions-grid"
      >
        {/* Status Transition Card */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--sand)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-6)"
          }}
        >
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "0 0 var(--space-3)", color: "var(--graphite)" }}>
            Incident Review Controls
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {incident.status === "REPORTED" && (
              <button
                disabled={actionPending}
                onClick={() => handleStatusUpdate("UNDER_REVIEW")}
                style={{
                  padding: "10px 16px",
                  background: "var(--amber)",
                  color: "var(--white)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: actionPending ? "wait" : "pointer"
                }}
              >
                Mark Under Review
              </button>
            )}

            {!["RESOLVED", "CANCELLED", "REJECTED"].includes(incident.status) && (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  disabled={actionPending}
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px solid var(--graphite-light)",
                    color: "var(--graphite)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    cursor: actionPending ? "wait" : "pointer"
                  }}
                >
                  Cancel Incident
                </button>
                <button
                  disabled={actionPending}
                  onClick={() => handleStatusUpdate("REJECTED")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px solid var(--rose)",
                    color: "var(--rose)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    cursor: actionPending ? "wait" : "pointer"
                  }}
                >
                  Reject Incident
                </button>
              </div>
            )}

            {["RESOLVED", "CANCELLED", "REJECTED"].includes(incident.status) && (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", margin: 0 }}>
                This incident is in terminal state ({formatStatus(incident.status)}) and cannot be modified.
              </p>
            )}
          </div>
        </div>

        {/* Responder Assignment Panel */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--sand)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-6)"
          }}
        >
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, margin: "0 0 var(--space-3)", color: "var(--graphite)" }}>
            Responder Deployment
          </h3>

          {canBeAssigned ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div>
                <label htmlFor="responderSelect" style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", display: "block", marginBottom: "4px" }}>
                  Eligible Responders ({requiredRole || "all"}):
                </label>
                <select
                  id="responderSelect"
                  value={selectedResponder}
                  onChange={(e) => setSelectedResponder(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--sand)",
                    fontSize: "var(--text-xs)",
                    background: "var(--cream)"
                  }}
                >
                  <option value="">Select responder...</option>
                  {eligibleResponders.map((r) => (
                    <option key={r.user_id} value={r.user_id}>
                      {r.username} ({r.role}) {r.online ? "- Online" : "- Offline"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={actionPending || !selectedResponder}
                onClick={handleAssign}
                style={{
                  padding: "10px 16px",
                  background: "var(--graphite)",
                  color: "var(--cream)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: actionPending || !selectedResponder ? "not-allowed" : "pointer",
                  opacity: selectedResponder ? 1 : 0.6
                }}
              >
                Assign responder
              </button>
            </div>
          ) : (
            <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", margin: 0 }}>
              {["RESOLVED", "CANCELLED", "REJECTED"].includes(incident.status)
                ? "Incident is closed."
                : `Incident is currently ${formatStatus(incident.status)}.`}
            </p>
          )}
        </div>
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
          Audit Trail & Timeline
        </h3>
        <Timeline history={history} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-actions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
