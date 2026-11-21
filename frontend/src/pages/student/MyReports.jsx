import React, { useState, useEffect, useCallback } from "react"
import { useSocket } from "../../context/SocketContext"
import { createGetIncidentsMsg, MSG_TYPES, INCIDENT_TYPES } from "../../api/protocol"
import IncidentTable from "../../components/IncidentTable"
import EmptyState from "../../components/EmptyState"
import { formatIncidentType } from "../../utils/format"

export default function MyReports() {
  const { request, subscribe } = useSocket()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")

  const fetchIncidents = useCallback(async () => {
    try {
      const reply = await request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST)
      if (reply.incidents) {
        setIncidents(reply.incidents)
      }
    } catch {
      // Failed to load
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  // Live status updates
  useEffect(() => {
    const unsub = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          Number(inc.id) === Number(msg.incident_id) ? { ...inc, status: msg.new_status } : inc
        )
      )
    })
    return () => unsub()
  }, [subscribe])

  const filtered = incidents.filter((inc) => {
    if (statusFilter !== "ALL" && inc.status !== statusFilter) return false
    if (typeFilter !== "ALL" && inc.type !== typeFilter) return false
    return true
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0, color: "var(--graphite)" }}>
          My Incident Reports
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", margin: "4px 0 0" }}>
          All emergency alerts submitted under your student account.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-4)",
          alignItems: "center",
          flexWrap: "wrap",
          background: "var(--white)",
          padding: "var(--space-3) var(--space-4)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--sand)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label htmlFor="statusFilter" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite-light)" }}>
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--sand)",
              fontSize: "var(--text-xs)"
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ON_SCENE">On Scene</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label htmlFor="typeFilter" style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--graphite-light)" }}>
            Category:
          </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--sand)",
              fontSize: "var(--text-xs)"
            }}
          >
            <option value="ALL">All categories</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatIncidentType(t)}
              </option>
            ))}
          </select>
        </div>

        <span className="tabular-num" style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--graphite-light)" }}>
          Showing {filtered.length} of {incidents.length} reports
        </span>
      </div>

      {loading ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading reports...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No reports match the current filter selection."
          actionLabel={statusFilter !== "ALL" || typeFilter !== "ALL" ? "Clear filters" : null}
          onAction={() => {
            setStatusFilter("ALL")
            setTypeFilter("ALL")
          }}
        />
      ) : (
        <IncidentTable incidents={filtered} role="student" />
      )}
    </div>
  )
}
