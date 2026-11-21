// Formatting helpers for dates, labels, and identifiers.

export function formatDateTime(dateStr) {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return dateStr
  }
}

export function formatTime(dateStr) {
  if (!dateStr) return ""
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return dateStr
  }
}

export function formatStatus(status) {
  if (!status) return ""
  return status.replace(/_/g, " ")
}

export function formatRole(role) {
  if (!role) return ""
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function formatIncidentType(type) {
  if (!type) return ""
  return type.charAt(0).toUpperCase() + type.slice(1)
}
