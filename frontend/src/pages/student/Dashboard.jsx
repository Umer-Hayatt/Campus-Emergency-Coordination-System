import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useSocket } from "../../context/SocketContext"
import { useAuth } from "../../context/AuthContext"
import { createGetIncidentsMsg, MSG_TYPES } from "../../api/protocol"
import StatCard from "../../components/StatCard"
import IncidentTable from "../../components/IncidentTable"
import EmptyState from "../../components/EmptyState"

export default function StudentDashboard() {
  const { request, subscribe } = useSocket()
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchIncidents = useCallback(async () => {
    try {
      const reply = await request(createGetIncidentsMsg(), MSG_TYPES.INCIDENTS_LIST)
      if (reply.incidents) {
        setIncidents(reply.incidents)
      }
    } catch {
      // Failed to load reports
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  // Real-time update listeners
  useEffect(() => {
    const unsubUpdate = subscribe(MSG_TYPES.INCIDENT_UPDATE, (msg) => {
      setIncidents((prev) =>
        prev.map((inc) =>
          Number(inc.id) === Number(msg.incident_id) ? { ...inc, status: msg.new_status } : inc
        )
      )
    })

    return () => unsubUpdate()
  }, [subscribe])

  // Calculate live summary counts
  const total = incidents.length
  const underReview = incidents.filter((i) => i.status === "UNDER_REVIEW").length
  const active = incidents.filter((i) =>
    ["REPORTED", "ASSIGNED", "ACCEPTED", "EN_ROUTE", "ON_SCENE"].includes(i.status)
  ).length
  const resolved = incidents.filter((i) => i.status === "RESOLVED").length

  const recent = incidents.slice(0, 5)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Top Banner & Quick Action */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)"
        }}
      >
        <div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, margin: 0, color: "var(--graphite)" }}>
            Welcome, {user?.username}
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)", margin: "4px 0 0" }}>
            Campus emergency status and reporting portal.
          </p>
        </div>

        <Link
          to="/student/report"
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--rose)",
            color: "var(--white)",
            borderRadius: "var(--radius-pill)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            boxShadow: "var(--shadow-sm)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Report emergency</span>
        </Link>
      </div>

      {/* Operations Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "var(--space-4)"
        }}
      >
        <StatCard label="Total Reports" value={total} />
        <StatCard label="Under Review" value={underReview} highlight={underReview > 0} />
        <StatCard label="Active Incidents" value={active} highlight={active > 0} />
        <StatCard label="Resolved" value={resolved} />
      </div>

      {/* Recent Incident Reports Table */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--graphite)", margin: 0 }}>
            Recent Reports
          </h3>
          {incidents.length > 5 && (
            <Link to="/student/reports" style={{ fontSize: "var(--text-xs)", color: "var(--rose)", fontWeight: 600 }}>
              View all ({incidents.length})
            </Link>
          )}
        </div>

        {loading ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--graphite-light)" }}>Loading reports...</p>
        ) : recent.length === 0 ? (
          <EmptyState
            message="No reports submitted yet. Use Report emergency to submit an alert."
            actionLabel="Report emergency"
            onAction={() => (window.location.href = "/student/report")}
          />
        ) : (
          <IncidentTable incidents={recent} role="student" />
        )}
      </div>
    </div>
  )
}
