import db
import registry
import notification_manager

# Status transition finite-state machine (FSM)
# REPORTED -> UNDER_REVIEW -> ASSIGNED -> ACCEPTED -> EN_ROUTE -> ON_SCENE -> RESOLVED
# plus REPORTED / UNDER_REVIEW / ASSIGNED -> CANCELLED or REJECTED by admin
VALID_TRANSITIONS = {
    "REPORTED": ["UNDER_REVIEW", "ASSIGNED", "CANCELLED", "REJECTED"],
    "UNDER_REVIEW": ["ASSIGNED", "CANCELLED", "REJECTED"],
    "ASSIGNED": ["ACCEPTED", "CANCELLED", "REJECTED"],
    "ACCEPTED": ["EN_ROUTE"],
    "EN_ROUTE": ["ON_SCENE"],
    "ON_SCENE": ["RESOLVED"],
    "RESOLVED": [],    # Terminal state
    "CANCELLED": [],   # Terminal state
    "REJECTED": []     # Terminal state
}

# Role-specific status permissions
ADMIN_PERMITTED_STATUSES = {"UNDER_REVIEW", "CANCELLED", "REJECTED"}
RESPONDER_PERMITTED_STATUSES = {"ACCEPTED", "EN_ROUTE", "ON_SCENE", "RESOLVED"}

# Incident type to required responder role mapping
RESPONDER_TYPE_MAP = {
    "medical": "medical",
    "fire": "security",
    "security": "security"
    # "accident" and "other" default to any responder (security or medical)
}

VALID_INCIDENT_TYPES = {"fire", "medical", "security", "accident", "other"}
VALID_SEVERITIES = {"low", "medium", "high", "critical"}

def create(message, client_socket, user_info):
    """
    Handle report_incident: student only.
    Validates fields and uses server-side identity exclusively.
    """
    if user_info.get("role") != "student":
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Only students are authorized to report incidents",
            "request": "report_incident"
        })
        return

    title = message.get("title")
    description = message.get("description")
    location = message.get("location")
    incident_type = message.get("incident_type")
    severity = message.get("severity")

    # Field validations
    if not isinstance(title, str) or not title.strip() or len(title.strip()) > 100:
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Title must be a non-empty string of up to 100 characters",
            "request": "report_incident"
        })
        return

    if not isinstance(description, str) or not description.strip() or len(description.strip()) > 1000:
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Description must be a non-empty string of up to 1000 characters",
            "request": "report_incident"
        })
        return

    if not isinstance(location, str) or not location.strip() or len(location.strip()) > 200:
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Location must be a non-empty string of up to 200 characters",
            "request": "report_incident"
        })
        return

    if not isinstance(incident_type, str) or incident_type.strip().lower() not in VALID_INCIDENT_TYPES:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"incident_type must be one of: {', '.join(sorted(VALID_INCIDENT_TYPES))}",
            "request": "report_incident"
        })
        return

    if not isinstance(severity, str) or severity.strip().lower() not in VALID_SEVERITIES:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"severity must be one of: {', '.join(sorted(VALID_SEVERITIES))}",
            "request": "report_incident"
        })
        return

    clean_type = incident_type.strip().lower()
    clean_severity = severity.strip().lower()
    # Server-verified user_id - client-provided 'reported_by' is completely ignored
    reported_by = user_info["user_id"]

    incident_id = db.create_incident(
        title.strip(),
        description.strip(),
        location.strip(),
        clean_type,
        clean_severity,
        reported_by
    )

    # Reply to the reporting student
    registry.send_json(client_socket, {
        "type": "incident_created",
        "incident_id": incident_id
    })

    # Push to ALL connected admins in real time
    incident_record = db.get_incident_by_id(incident_id)
    notification_manager.send_to_admins({
        "type": "new_incident",
        "incident": incident_record
    }, incident_id=incident_id)

def get_incidents(message, client_socket, user_info):
    """
    Handle get_incidents:
    - Admin: gets all incidents
    - Student: gets only incidents reported by this student
    - Security / Medical: gets only incidents assigned to them
    """
    role = user_info.get("role")
    user_id = user_info.get("user_id")

    if role == "admin":
        incidents = db.get_all_incidents()
    elif role == "student":
        incidents = db.get_incidents_by_user(user_id)
    elif role in ("security", "medical"):
        incidents = db.get_assigned_incidents(user_id)
    else:
        incidents = []

    registry.send_json(client_socket, {
        "type": "incidents_list",
        "incidents": incidents
    })

def assign(message, client_socket, user_info):
    """
    Handle assign_responder: admin only.
    Validates responder role, incident type matching, active assignment status,
    sets status to ASSIGNED, and unicasts push notification to assigned responder.
    """
    if user_info.get("role") != "admin":
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Only admins can assign responders",
            "request": "assign_responder"
        })
        return

    raw_incident_id = message.get("incident_id")
    raw_responder_id = message.get("responder_id")

    try:
        incident_id = int(raw_incident_id)
        responder_id = int(raw_responder_id)
    except (ValueError, TypeError):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "incident_id and responder_id must be valid integers",
            "request": "assign_responder"
        })
        return

    incident = db.get_incident_by_id(incident_id)
    if not incident:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Incident #{incident_id} not found",
            "request": "assign_responder"
        })
        return

    current_status = incident["status"]
    if current_status in ("RESOLVED", "CANCELLED", "REJECTED"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Cannot assign responder to an incident in terminal status '{current_status}'",
            "request": "assign_responder"
        })
        return

    # Check if incident already has an active assignment
    active_assignment = db.get_active_assignment(incident_id)
    if active_assignment and current_status in ("ASSIGNED", "ACCEPTED", "EN_ROUTE", "ON_SCENE"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Incident #{incident_id} already has an active assignment",
            "request": "assign_responder"
        })
        return

    # Validate target responder exists and has correct role
    responder = db.get_user_by_id(responder_id)
    if not responder:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Responder with user_id {responder_id} not found",
            "request": "assign_responder"
        })
        return

    responder_role = responder["role"]
    if responder_role not in ("security", "medical"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Target user has role '{responder_role}'; must be 'security' or 'medical'",
            "request": "assign_responder"
        })
        return

    # Validate incident type suitability
    required_role = RESPONDER_TYPE_MAP.get(incident["type"])
    if required_role and responder_role != required_role:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Incident type '{incident['type']}' requires a '{required_role}' responder, cannot assign to '{responder_role}'",
            "request": "assign_responder"
        })
        return

    # Record assignment and transition incident status to ASSIGNED in database
    db.assign_responder(incident_id, responder_id, assigned_by=user_info["user_id"])

    # Reply to admin
    registry.send_json(client_socket, {
        "type": "assigned",
        "incident_id": incident_id,
        "responder_id": responder_id
    })

    # Real-time push ONLY to the assigned responder (selective unicast routing)
    notification_manager.send_to_user(responder_id, {
        "type": "assignment_received",
        "incident_id": incident_id,
        "incident": db.get_incident_by_id(incident_id),
        "assigned_by": user_info["username"]
    }, incident_id=incident_id)

def update_status(message, client_socket, user_info):
    """
    Handle update_status:
    - Students are never allowed to update status.
    - Admins can set UNDER_REVIEW, CANCELLED, REJECTED.
    - Assigned responder can set ACCEPTED, EN_ROUTE, ON_SCENE, RESOLVED.
    - Enforces FSM transitions, logs history, and pushes updates to student and admins.
    """
    role = user_info.get("role")
    user_id = user_info.get("user_id")

    if role == "student":
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Students are not permitted to update incident statuses",
            "request": "update_status"
        })
        return

    raw_incident_id = message.get("incident_id")
    new_status = message.get("new_status")

    try:
        incident_id = int(raw_incident_id)
    except (ValueError, TypeError):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "incident_id must be a valid integer",
            "request": "update_status"
        })
        return

    if not isinstance(new_status, str) or not new_status.strip():
        registry.send_json(client_socket, {
            "type": "error",
            "message": "new_status must be a non-empty string",
            "request": "update_status"
        })
        return

    new_status = new_status.strip().upper()

    incident = db.get_incident_by_id(incident_id)
    if not incident:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Incident #{incident_id} not found",
            "request": "update_status"
        })
        return

    current_status = incident["status"]

    # Terminal states can never transition
    if current_status in ("RESOLVED", "CANCELLED", "REJECTED"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Incident is in terminal status '{current_status}' and cannot be modified",
            "request": "update_status"
        })
        return

    # Check FSM transition validity
    allowed_transitions = VALID_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_transitions:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Invalid status transition from '{current_status}' to '{new_status}'",
            "request": "update_status"
        })
        return

    # Check role permissions for the specific new_status
    if role == "admin":
        if new_status not in ADMIN_PERMITTED_STATUSES:
            registry.send_json(client_socket, {
                "type": "error",
                "message": f"Admins may only transition to {', '.join(sorted(ADMIN_PERMITTED_STATUSES))}",
                "request": "update_status"
            })
            return

    elif role in ("security", "medical"):
        if new_status not in RESPONDER_PERMITTED_STATUSES:
            registry.send_json(client_socket, {
                "type": "error",
                "message": f"Responders may only transition to {', '.join(sorted(RESPONDER_PERMITTED_STATUSES))}",
                "request": "update_status"
            })
            return

        # Ensure responder is the assigned responder for this incident
        active_assignment = db.get_active_assignment(incident_id)
        if not active_assignment or active_assignment["responder_id"] != user_id:
            registry.send_json(client_socket, {
                "type": "error",
                "message": "Only the assigned responder for this incident can update its status",
                "request": "update_status"
            })
            return

    # Perform unified status update and history recording
    success, old_or_err = db.change_status(incident_id, new_status, changed_by=user_id)
    if not success:
        registry.send_json(client_socket, {
            "type": "error",
            "message": str(old_or_err),
            "request": "update_status"
        })
        return

    # Reply to sender
    registry.send_json(client_socket, {
        "type": "status_updated",
        "incident_id": incident_id,
        "new_status": new_status
    })

    update_payload = {
        "type": "incident_update",
        "incident_id": incident_id,
        "new_status": new_status,
        "updated_by": user_info["username"]
    }

    # Push to reporting student
    notification_manager.send_to_user(incident["reported_by"], update_payload, incident_id=incident_id)

    # Push to all connected admins
    notification_manager.send_to_admins(update_payload, incident_id=incident_id)

    # If admin cancelled or rejected, also push notification to assigned responder if one was assigned
    if new_status in ("CANCELLED", "REJECTED"):
        active_assignment = db.get_active_assignment(incident_id)
        if active_assignment:
            notification_manager.send_to_user(active_assignment["responder_id"], update_payload, incident_id=incident_id)

def get_responders(message, client_socket, user_info):
    """
    Handle get_responders: admin only.
    Returns all security/medical users, plus whether they are currently online
    (checked via the registry). The frontend uses this to populate the assign panel.
    """
    if user_info.get("role") != "admin":
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Only admins can list responders",
            "request": "get_responders"
        })
        return

    online_ids = set()
    for conn in registry.get_all_connections():
        info = registry.get_connection(conn)
        if info and info.get("user_id"):
            online_ids.add(info["user_id"])

    responders = []
    for role in ("security", "medical"):
        for u in db.get_users_by_role(role):
            responders.append({
                "user_id": u["id"],
                "username": u["username"],
                "role": u["role"],
                "online": u["id"] in online_ids
            })

    registry.send_json(client_socket, {
        "type": "responders_list",
        "responders": responders
    })

def get_incident_history(message, client_socket, user_info):
    """
    Handle get_incident_history.
    Visible to: the admin, the student who reported the incident, or the assigned responder.
    Returns rows from incident_history ordered chronologically.
    """
    raw_incident_id = message.get("incident_id")
    try:
        incident_id = int(raw_incident_id)
    except (ValueError, TypeError):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "incident_id must be a valid integer",
            "request": "get_incident_history"
        })
        return

    incident = db.get_incident_by_id(incident_id)
    if not incident:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Incident #{incident_id} not found",
            "request": "get_incident_history"
        })
        return

    role = user_info.get("role")
    user_id = user_info.get("user_id")

    # Authorization: admin always allowed; student only for their own incident;
    # responder only if they are the assigned responder.
    if role == "admin":
        pass
    elif role == "student":
        if incident["reported_by"] != user_id:
            registry.send_json(client_socket, {
                "type": "error",
                "message": "You can only view history for incidents you reported",
                "request": "get_incident_history"
            })
            return
    elif role in ("security", "medical"):
        assignment = db.get_active_assignment(incident_id)
        if not assignment or assignment["responder_id"] != user_id:
            registry.send_json(client_socket, {
                "type": "error",
                "message": "You can only view history for incidents assigned to you",
                "request": "get_incident_history"
            })
            return
    else:
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Not authorized",
            "request": "get_incident_history"
        })
        return

    history = db.get_incident_history(incident_id)
    registry.send_json(client_socket, {
        "type": "incident_history",
        "incident_id": incident_id,
        "history": history
    })
