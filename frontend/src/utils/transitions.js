// Incident state transition helper.
// The server in incident_manager.py is the authority; this table is used
// to show valid action buttons in the UI.

export const VALID_TRANSITIONS = {
  REPORTED: ["UNDER_REVIEW", "ASSIGNED", "CANCELLED", "REJECTED"],
  UNDER_REVIEW: ["ASSIGNED", "CANCELLED", "REJECTED"],
  ASSIGNED: ["ACCEPTED", "CANCELLED", "REJECTED"],
  ACCEPTED: ["EN_ROUTE"],
  EN_ROUTE: ["ON_SCENE"],
  ON_SCENE: ["RESOLVED"],
  RESOLVED: [],
  CANCELLED: [],
  REJECTED: []
}

export const ADMIN_PERMITTED_STATUSES = ["UNDER_REVIEW", "CANCELLED", "REJECTED"]
export const RESPONDER_PERMITTED_STATUSES = ["ACCEPTED", "EN_ROUTE", "ON_SCENE", "RESOLVED"]

// Required responder roles by incident type
export const RESPONDER_TYPE_MAP = {
  medical: "medical",
  fire: "security",
  security: "security"
}

// Compute the next valid status actions for a user based on role and assignment
export function getAvailableStatusActions(currentStatus, userRole, isAssigned = false) {
  if (!currentStatus) return []
  const allowed = VALID_TRANSITIONS[currentStatus] || []

  if (userRole === "admin") {
    return allowed.filter((s) => ADMIN_PERMITTED_STATUSES.includes(s))
  }

  if ((userRole === "security" || userRole === "medical") && isAssigned) {
    return allowed.filter((s) => RESPONDER_PERMITTED_STATUSES.includes(s))
  }

  return []
}

export function isTerminalStatus(status) {
  return status === "RESOLVED" || status === "CANCELLED" || status === "REJECTED"
}
