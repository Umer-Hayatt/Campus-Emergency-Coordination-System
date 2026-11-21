import React from "react"
import { useNavigate } from "react-router-dom"
import StatusBadge from "./StatusBadge"
import SeverityChip from "./SeverityChip"
import { formatDateTime, formatIncidentType } from "../utils/format"

export default function IncidentTable({ incidents = [], role = "student", highlightId = null }) {
  const navigate = useNavigate()

  const handleRowClick = (id) => {
    if (role === "student") {
      navigate(`/student/incidents/${id}`)
    } else if (role === "admin") {
      navigate(`/admin/incidents/${id}`)
    } else if (role === "security" || role === "medical") {
      navigate(`/responder/incidents/${id}`)
    }
  }

  if (!incidents || incidents.length === 0) {
    return null
  }

  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid var(--sand)",
        borderRadius: "var(--radius-md)",
        background: "var(--white)"
      }}
    >
      <table style={{ width: "100%", fontSize: "var(--text-sm)", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              background: "var(--cream)",
              borderBottom: "1px solid var(--sand)",
              color: "var(--graphite-light)",
              fontSize: "var(--text-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            <th style={{ padding: "10px 16px", width: "60px" }}>ID</th>
            <th style={{ padding: "10px 16px" }}>Title</th>
            <th style={{ padding: "10px 16px", width: "100px" }}>Category</th>
            <th style={{ padding: "10px 16px", width: "90px" }}>Severity</th>
            <th style={{ padding: "10px 16px" }}>Location</th>
            <th style={{ padding: "10px 16px", width: "140px" }}>Status</th>
            <th style={{ padding: "10px 16px", width: "130px" }}>Reported</th>
            <th style={{ padding: "10px 16px", width: "80px", textAlign: "right" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => {
            const isHighlighted = highlightId && Number(highlightId) === Number(inc.id)

            return (
              <tr
                key={inc.id}
                onClick={() => handleRowClick(inc.id)}
                style={{
                  borderBottom: "1px solid var(--sand-light)",
                  cursor: "pointer",
                  transition: "background-color 150ms ease",
                  backgroundColor: isHighlighted ? "rgba(213, 138, 67, 0.15)" : "transparent"
                }}
                onMouseEnter={(e) => {
                  if (!isHighlighted) e.currentTarget.style.backgroundColor = "var(--sand-light)"
                }}
                onMouseLeave={(e) => {
                  if (!isHighlighted) e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <td className="tabular-num" style={{ padding: "12px 16px", fontWeight: 600, color: "var(--graphite)" }}>
                  #{inc.id}
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--graphite)" }}>
                  <div
                    title={inc.title}
                    style={{
                      maxWidth: "240px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {inc.title}
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: "var(--graphite-light)" }}>
                  {formatIncidentType(inc.type)}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <SeverityChip severity={inc.severity} />
                </td>
                <td style={{ padding: "12px 16px", color: "var(--graphite-light)" }}>
                  <div
                    title={inc.location}
                    style={{
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {inc.location}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusBadge status={inc.status} />
                </td>
                <td className="tabular-num" style={{ padding: "12px 16px", color: "var(--graphite-light)", fontSize: "var(--text-xs)" }}>
                  {formatDateTime(inc.created_at)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--rose)",
                      fontWeight: 600
                    }}
                  >
                    View
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
