import React from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import TopBar from "../components/TopBar"
import Toast from "../components/Toast"

export default function AppLayout() {
  const location = useLocation()

  // Derive sensible page titles from active route path
  const getTitle = () => {
    const path = location.pathname
    if (path === "/student") return "Student Dashboard"
    if (path === "/student/report") return "Report Campus Emergency"
    if (path === "/student/reports") return "My Incident Reports"
    if (path.startsWith("/student/incidents/")) return "Incident Review"
    if (path === "/admin") return "Emergency Coordination Center"
    if (path === "/admin/incidents") return "All Campus Incidents"
    if (path.startsWith("/admin/incidents/")) return "Incident Details & Responder Assignment"
    if (path === "/responder") return "Responder Task Queue"
    if (path.startsWith("/responder/incidents/")) return "Incident Response & Lifecycle"
    return "Emergency Coordination System"
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar title={getTitle()} />
        <main style={{ flex: 1, padding: "var(--space-8)", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
