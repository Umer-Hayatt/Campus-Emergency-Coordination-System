import React, { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { useSocket } from "../../context/SocketContext"
import { createGetIncidentsMsg, createGetIncidentHistoryMsg, MSG_TYPES } from "../../api/protocol"
import StatusBadge from "../../components/StatusBadge"
import SeverityChip from "../../components/SeverityChip"
import Timeline from "../../components/Timeline"
import { formatDateTime, formatIncidentType } from "../../utils/format"

export default function StudentIncidentDetails() {
  const { id } = useParams()
  const { request, subscribe } = useSocket()
  const [incident, setIncident] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const listReply = await request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST)
      const found = (listReply.incidents || []).find((i) => Number(i.id) === Number(id))
      setIncident(found || null)

      const histReply = await request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY)
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

  // Live updates for this incident
  useEffect(() => {
    const unsub = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      if (Number(msg.incident_id) === Number(id)) {
        setIncident((prev) => (prev ? { ...prev, status: msg.new_status } : prev))
        // Refresh history to append new transition
        request(createGetIncidentHistoryMsg(id), MSG_TYPES.INCIDENT_HISTORY).then((r) => {
          if (r.history) setHistory(r.history)
        })
      }
    })
    return () => unsub()
  }, [id, subscribe, request])

  if (loading) {
    return <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading incident details...</p>
  }

  if (!incident) {
    return (
      <div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Incident #{id} not found.</p>
        <Link to="/student" style={{ fontSize: "var(--text-xs)", color: "var(--rose)", fontWeight: 600 }}>
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "860px" }}>
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/student"
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
          Back to reports
        </Link>
      </div>

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

        {/* Metadata grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
          <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {incident.description}
          </p>
        </div>
      </div>

      {/* Progress Timeline Card */}
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
