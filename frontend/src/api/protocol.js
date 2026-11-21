// Protocol constants and message factory functions for AlertBridge.
// Every message type and parameter matches Backend/message_router.py.

export const MSG_TYPES = {
  // Client requests
  LOGIN: "login",
  LOGOUT: "logout",
  REPORT_INCIDENT: "report_incident",
  GET_INCIDENTS: "get_incidents",
  UPDATE_STATUS: "update_status",
  ASSIGN_RESPONDER: "assign_responder",
  GET_NOTIFICATIONS: "get_notifications",
  GET_RESPONDERS: "get_responders",
  GET_INCIDENT_HISTORY: "get_incident_history",

  // Server replies
  LOGIN_SUCCESS: "login_success",
  LOGOUT_SUCCESS: "logout_success",
  INCIDENT_CREATED: "incident_created",
  INCIDENTS_LIST: "incidents_list",
  STATUS_UPDATED: "status_updated",
  ASSIGNED: "assigned",
  NOTIFICATIONS_LIST: "notifications_list",
  RESPONDERS_LIST: "responders_list",
  INCIDENT_HISTORY: "incident_history",
  ERROR: "error",

  // Server real-time pushes
  NEW_INCIDENT: "new_incident",
  ASSIGNMENT_RECEIVED: "assignment_received",
  INCIDENT_UPDATE: "incident_update",
  UNREAD_NOTIFICATIONS: "unread_notifications"
}

export const INCIDENT_TYPES = ["medical", "fire", "security", "accident", "other"]
export const SEVERITIES = ["low", "medium", "high", "critical"]

// Message builders ensuring uniform flat JSON formatting
export const createLoginMsg = (username, password) => ({
  type: MSG_TYPES.LOGIN,
  username,
  password
})

export const createLogoutMsg = () => ({
  type: MSG_TYPES.LOGOUT
})

export const createReportIncidentMsg = (title, description, location, incident_type, severity) => ({
  type: MSG_TYPES.REPORT_INCIDENT,
  title,
  description,
  location,
  incident_type,
  severity
})

export const createGetIncidentsMsg = () => ({
  type: MSG_TYPES.GET_INCIDENTS
})

export const createUpdateStatusMsg = (incident_id, new_status) => ({
  type: MSG_TYPES.UPDATE_STATUS,
  incident_id: Number(incident_id),
  new_status
})

export const createAssignResponderMsg = (incident_id, responder_id) => ({
  type: MSG_TYPES.ASSIGN_RESPONDER,
  incident_id: Number(incident_id),
  responder_id: Number(responder_id)
})

export const createGetNotificationsMsg = () => ({
  type: MSG_TYPES.GET_NOTIFICATIONS
})

export const createGetRespondersMsg = () => ({
  type: MSG_TYPES.GET_RESPONDERS
})

export const createGetIncidentHistoryMsg = (incident_id) => ({
  type: MSG_TYPES.GET_INCIDENT_HISTORY,
  incident_id: Number(incident_id)
})
