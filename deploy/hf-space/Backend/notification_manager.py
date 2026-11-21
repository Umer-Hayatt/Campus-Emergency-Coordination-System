import db
import registry

def send_to_user(user_id: int, message_payload: dict, incident_id: int = 0, save_db: bool = True):
    """
    Application-level unicast routing:
    Routes a message directly to a specific user's TCP connection(s) using
    the server's in-memory registry, rather than network-layer IP unicast.
    Also persists to SQLite so offline users receive it upon subsequent login.
    """
    if save_db:
        summary = message_payload.get("message") or f"Notification for incident #{incident_id} ({message_payload.get('type')})"
        db.create_notification(user_id, incident_id, summary)

    # Find connection sockets under the registry lock (copies list), then send outside lock
    connections = registry.find_by_user_id(user_id)
    for conn in connections:
        registry.send_json(conn, message_payload)

def send_to_role(role: str, message_payload: dict, incident_id: int = 0, save_db: bool = True):
    """
    Application-level multicast / group routing:
    Routes a message to all connected clients possessing a given role (e.g. 'admin')
    using the server's registry, rather than network-layer IP multicast.
    Also persists to SQLite for all registered users of that role.
    """
    if save_db:
        summary = message_payload.get("message") or f"Group alert for role '{role}' on incident #{incident_id} ({message_payload.get('type')})"
        users_in_role = db.get_users_by_role(role)
        for u in users_in_role:
            db.create_notification(u["id"], incident_id, summary)

    # Copy connections list under lock, then send without holding registry lock
    connections = registry.find_by_role(role)
    for conn in connections:
        registry.send_json(conn, message_payload)

def send_to_admins(message_payload: dict, incident_id: int = 0, save_db: bool = True):
    """Helper to route an alert to all system administrators."""
    send_to_role("admin", message_payload, incident_id=incident_id, save_db=save_db)

def send_unread_on_login(conn, user_id: int):
    """Push any unread notifications to the client immediately upon successful login."""
    unread = db.get_notifications(user_id, unread_only=True)
    if unread:
        registry.send_json(conn, {
            "type": "unread_notifications",
            "notifications": unread
        })
        db.mark_notifications_read(user_id)

def get_notifs(message: dict, client_socket, user_info: dict = None):
    """Handle get_notifications request: return all notifications for the authenticated user."""
    if not user_info:
        user_info = registry.get_connection(client_socket)
    if not user_info or not user_info.get("user_id"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Not logged in",
            "request": "get_notifications"
        })
        return

    user_id = user_info["user_id"]
    notifications = db.get_notifications(user_id, unread_only=False)
    db.mark_notifications_read(user_id)
    registry.send_json(client_socket, {
        "type": "notifications_list",
        "notifications": notifications
    })

def notify(message: dict, client_socket, user_info: dict = None):
    """Handle send_notification request (admin manual alert)."""
    if not user_info:
        user_info = registry.get_connection(client_socket)
    if not user_info or not user_info.get("user_id"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Not logged in",
            "request": "send_notification"
        })
        return

    if user_info.get("role") != "admin":
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Only admins can send manual notifications",
            "request": "send_notification"
        })
        return

    text = message.get("message")
    if not text or not isinstance(text, str):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Field 'message' must be a non-empty string",
            "request": "send_notification"
        })
        return

    target_role = message.get("target_role")
    target_user_id = message.get("target_user_id")
    incident_id = message.get("incident_id", 0)

    payload = {
        "type": "custom_notification",
        "from": user_info["username"],
        "message": text,
        "incident_id": incident_id
    }

    if target_role:
        send_to_role(target_role, payload, incident_id=incident_id)
    elif target_user_id:
        try:
            target_user_id = int(target_user_id)
            send_to_user(target_user_id, payload, incident_id=incident_id)
        except (ValueError, TypeError):
            registry.send_json(client_socket, {
                "type": "error",
                "message": "target_user_id must be an integer",
                "request": "send_notification"
            })
            return
    else:
        # Broadcast to all logged in users
        for conn in registry.get_all_connections():
            registry.send_json(conn, payload)

    registry.send_json(client_socket, {
        "type": "notification_sent",
        "message": "Notification dispatched successfully"
    })
