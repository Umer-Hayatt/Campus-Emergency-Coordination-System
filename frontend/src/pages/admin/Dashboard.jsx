import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useSocket } from "../../context/SocketContext"
import { createGetIncidentsMsg, createGetRespondersMsg, MSG_TYPES } from "../../api/protocol"
import StatCard from "../../components/StatCard"
import IncidentTable from "../../components/IncidentTable"
import EmptyState from "../../components/EmptyState"
import { formatDateTime } from "../../utils/format"

export default function AdminDashboard() {
  const { request, subscribe } = useSocket()
  const [incidents, setIncidents] = useState([])
  const [responders, setResponders] = useState([])
  const [highlightId, setHighlightId] = useState(null)
  const [activityFeed, setActivityFeed] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [incReply, respReply] = await Promise.all([
        request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST),
        request(createGetRespondersMsg(), MSG_TYPES.RESPONDERS_LIST)
      ])
      if (incReply.incidents) setIncidents(incReply.incidents)
      if (respReply.responders) setResponders(respReply.responders)
    } catch {
      // Failed to load
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time pushes
  useEffect(() => {
    // 1. New incident reported
    const unsubNew = subscribe(MSG_TYPES.NEW_INCIDENT, (msg) => {
      const inc = msg.incident
      if (inc) {
        setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)])
        setHighlightId(inc.id)
        setActivityFeed((prev) => [
          {
            id: Date.now(),
            text: `New incident reported: #${inc.id} (${inc.title}) at ${inc.location}`,
            time: new Date().toISOString()
          },
          ...prev.slice(0, 19)
        ])
        setTimeout(() => setHighlightId(null), 4000)
      }
    })

    // 2. Incident update
    const unsubUpdate = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          Number(inc.id) === Number(msg.incident_id) ? { ...inc, status: msg.new_status } : inc
        )
      )
      setActivityFeed((prev) => [
        {
          id: Date.now(),
          text: `Incident #${msg.incident_id} status updated to ${msg.new_status} by ${msg.updated_by || "user"}`,
          time: new Date().toISOString()
        },
        ...prev.slice(0, 19)
      ])
    })

    return () => {
      unsubNew()
      unsubUpdate()
    }
  }, [subscribe])

  const total = incidents.length
  const pendingReview = incidents.filter((i) => i.status === "REPORTED" || i.status === "UNDER_REVIEW").length
  const active = incidents.filter((i) =>
    ["ASSIGNED", "ACCEPTED", "EN_ROUTE", "ON_SCENE"].includes(i.status)
  ).length
  const critical = incidents.filter((i) => i.severity === "critical" && i.status !== "RESOLVED").length
  const availableResponders = responders.filter((r) => r.online).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0, color: "var(--graphite)" }}>
          Emergency Coordination Center
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", margin: "4px 0 0" }}>
          Live control room monitoring, incident triage, and responder deployment.
        </p>
      </div>

      {/* Live Operations Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "var(--space-4)"
        }}
      >
        <StatCard label="Total Incidents" value={total} />
        <StatCard label="Pending Review" value={pendingReview} highlight={pendingReview > 0} />
        <StatCard label="Active Deployments" value={active} highlight={active > 0} />
        <StatCard label="Critical Unresolved" value={critical} highlight={critical > 0} />
        <StatCard label="Online Responders" value={availableResponders} />
      </div>

      {/* Main Content Layout: Live Incidents Table + Live Activity Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }} className="admin-grid">
        {/* Incident Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--graphite)", margin: 0 }}>
              Live Incident Stream
            </h3>
            <Link to="/admin/incidents" style={{ fontSize: "var(--text-xs)", color: "var(--rose)", fontWeight: 600 }}>
              View all ({incidents.length})
            </Link>
          </div>

          {loading ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading incidents...</p>
          ) : incidents.length === 0 ? (
            <EmptyState message="No incidents reported across campus." />
          ) : (
            <IncidentTable incidents={incidents.slice(0, 8)} role="admin" highlightId={highlightId} />
          )}
        </div>

        {/* Live Activity Feed */}
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--sand)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "560px"
          }}
        >
          <h3 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--graphite)", margin: "0 0 var(--space-4)" }}>
            Live Push Activity
          </h3>

          <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {activityFeed.length === 0 ? (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", margin: 0 }}>
                Awaiting incoming TCP socket pushes...
              </p>
            ) : (
              activityFeed.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "8px 10px",
                    background: "var(--cream)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--sand-light)"
                  }}
                >
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--graphite)", margin: 0, lineHeight: 1.4 }}>
                    {item.text}
                  </p>
                  <span className="tabular-num" style={{ fontSize: "10px", color: "var(--graphite-light)", display: "block", marginTop: "2px" }}>
                    {formatDateTime(item.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
