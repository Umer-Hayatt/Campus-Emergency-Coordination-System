import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Role authorization check: redirect user to their dedicated role dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "student") {
      return <Navigate to="/student" replace />
    }
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />
    }
    if (user.role === "security" || user.role === "medical") {
      return <Navigate to="/responder" replace />
    }
    return <Navigate to="/login" replace />
  }

  return children
}
