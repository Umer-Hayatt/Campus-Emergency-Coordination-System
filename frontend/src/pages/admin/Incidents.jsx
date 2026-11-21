import React, { useState, useEffect, useCallback } from "react"
import { useSocket } from "../../context/SocketContext"
import { createGetIncidentsMsg, MSG_TYPES, INCIDENT_TYPES, SEVERITIES } from "../../api/protocol"
import IncidentTable from "../../components/IncidentTable"
import EmptyState from "../../components/EmptyState"
import { formatIncidentType } from "../../utils/format"

export default function AdminIncidents() {
  const { request, subscribe } = useSocket()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [severityFilter, setSeverityFilter] = useState("ALL")

  const fetchIncidents = useCallback(async () => {
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
    if (severityFilter !== "ALL" && inc.severity !== severityFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchId = String(inc.id).includes(q)
      const matchTitle = inc.title?.toLowerCase().includes(q)
      const matchLoc = inc.location?.toLowerCase().includes(q)
      if (!matchId && !matchTitle && !matchLoc) return false
    }
    return true
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0, color: "var(--graphite)" }}>
          All Campus Incidents
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", margin: "4px 0 0" }}>
          Full database view of emergency incident reports.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "center",
          flexWrap: "wrap",
          background: "var(--white)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--sand)"
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, title, or location..."
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--sand)",
              fontSize: "var(--text-xs)",
              background: "var(--cream)"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label htmlFor="admStatusFilter" style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", fontWeight: 600 }}>
            Status:
          </label>
          <select
            id="admStatusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--sand)", fontSize: "var(--text-xs)" }}
          >
            <option value="ALL">All</option>
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

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label htmlFor="admTypeFilter" style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", fontWeight: 600 }}>
            Category:
          </label>
          <select
            id="admTypeFilter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--sand)", fontSize: "var(--text-xs)" }}
          >
            <option value="ALL">All</option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatIncidentType(t)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <label htmlFor="admSevFilter" style={{ fontSize: "var(--text-xs)", color: "var(--graphite-light)", fontWeight: 600 }}>
            Severity:
          </label>
          <select
            id="admSevFilter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--sand)", fontSize: "var(--text-xs)" }}
          >
            <option value="ALL">All</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <span className="tabular-num" style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--graphite-light)" }}>
          {filtered.length} of {incidents.length}
        </span>
      </div>

      {loading ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading incidents...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No incidents match the specified search and filter criteria."
          actionLabel="Reset filters"
          onAction={() => {
            setSearch("")
            setStatusFilter("ALL")
            setTypeFilter("ALL")
            setSeverityFilter("ALL")
          }}
        />
      ) : (
        <IncidentTable incidents={filtered} role="admin" />
      )}
    </div>
  )
}
