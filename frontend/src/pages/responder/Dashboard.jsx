import React, { useState, useEffect, useCallback } from "react"
import { useSocket } from "../../context/SocketContext"
import { useAuth } from "../../context/AuthContext"
import { createGetIncidentsMsg, MSG_TYPES } from "../../api/protocol"
import StatCard from "../../components/StatCard"
import IncidentTable from "../../components/IncidentTable"
import EmptyState from "../../components/EmptyState"
import { formatRole } from "../../utils/format"

export default function ResponderDashboard() {
  const { request, subscribe } = useSocket()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [highlightId, setHighlightId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAssigned = useCallback(async () => {
    try {
      const reply = await request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST)
      if (reply.incidents) setIncidents(reply.incidents)
    } catch {
      // Failed to load
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    fetchAssigned()
  }, [fetchAssigned])

  // Real-time assignment listener (selective push)
  useEffect(() => {
    const unsubAssign = subscribe(MSG_TYPES.ASSIGNMENT_RECEIVED, (msg) => {
      setHighlightId(msg.incident_id)
      fetchAssigned()
      setTimeout(() => setHighlightId(null), 5000)
    })

    const unsubUpdate = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          Number(inc.id) === Number(msg.incident_id) ? { ...inc, status: msg.new_status } : inc
        )
      )
    })

    return () => {
      unsubAssign()
      unsubUpdate()
    }
  }, [subscribe, fetchAssigned])

  const pending = incidents.filter((i) => i.status === "ASSIGNED").length
  const inProgress = incidents.filter((i) =>
    ["ACCEPTED", "EN_ROUTE", "ON_SCENE"].includes(i.status)
  ).length
  const completed = incidents.filter((i) => i.status === "RESOLVED").length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0, color: "var(--graphite)" }}>
          {formatRole(user?.role)} Responder Queue
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", margin: "4px 0 0" }}>
          Active emergency assignments dispatched to {user?.username}.
        </p>
      </div>

      {/* Responder Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "var(--space-4)"
        }}
      >
        <StatCard label="Pending Acceptance" value={pending} highlight={pending > 0} />
        <StatCard label="Active Deployment" value={inProgress} highlight={inProgress > 0} />
        <StatCard label="Completed Tasks" value={completed} />
      </div>

      {/* Incident List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--graphite)", margin: 0 }}>
          Assigned Tasks
        </h3>

        {loading ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading tasks...</p>
        ) : incidents.length === 0 ? (
          <EmptyState message="No emergency incidents currently assigned to your station." />
        ) : (
          <IncidentTable incidents={incidents} role={user?.role} highlightId={highlightId} />
        )}
      </div>
    </div>
  )
}
