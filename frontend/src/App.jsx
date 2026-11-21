import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SocketProvider } from "./context/SocketContext"
import { AuthProvider } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import ErrorBoundary from "./components/ErrorBoundary"
import ProtectedRoute from "./components/ProtectedRoute"

import AppLayout from "./layouts/AppLayout"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

// Student pages
import StudentDashboard from "./pages/student/Dashboard"
import ReportEmergency from "./pages/student/ReportEmergency"
import MyReports from "./pages/student/MyReports"
import StudentIncidentDetails from "./pages/student/IncidentDetails"

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard"
import AdminIncidents from "./pages/admin/Incidents"
import AdminIncidentDetails from "./pages/admin/IncidentDetails"

// Responder pages
import ResponderDashboard from "./pages/responder/Dashboard"
import ResponderIncidentDetails from "./pages/responder/IncidentDetails"

export default function App() {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Public landing and login */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Student Routes */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="report" element={<ReportEmergency />} />
                  <Route path="reports" element={<MyReports />} />
                  <Route path="incidents/:id" element={<StudentIncidentDetails />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="incidents" element={<AdminIncidents />} />
                  <Route path="incidents/:id" element={<AdminIncidentDetails />} />
                </Route>

                {/* Protected Responder Routes (Security & Medical) */}
                <Route
                  path="/responder"
                  element={
                    <ProtectedRoute allowedRoles={["security", "medical"]}>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ResponderDashboard />} />
                  <Route path="incidents/:id" element={<ResponderIncidentDetails />} />
                </Route>

                {/* 404 handler */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </SocketProvider>
    </ErrorBoundary>
  )
}
