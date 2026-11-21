import auth
import incident_manager
import notification_manager
import registry

def route(message, client_socket):
    """
    Central application message dispatcher.
    Extracts server-side identity from the registry on the connection.
    Rejects any unauthenticated requests (except 'login') with 'not logged in'.
    """
    if not isinstance(message, dict):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Message payload must be a JSON object",
            "request": "unknown"
        })
        return

    msg_type = message.get("type")
    if not msg_type or not isinstance(msg_type, str):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Missing or invalid 'type' field in message",
            "request": "unknown"
        })
        return

    # Check connection identity in the registry
    user_info = registry.get_connection(client_socket)

    # Login request is the only unauthenticated endpoint permitted
    if msg_type == "login":
        auth.authenticate(message.get("username"), message.get("password"), client_socket)
        return

    # All other endpoints require authentication
    if not user_info or not user_info.get("user_id"):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Not logged in",
            "request": msg_type
        })
        return

    # Dispatch to appropriate handler using server-verified identity
    if msg_type == "logout":
        registry.send_json(client_socket, {
            "type": "logout_success",
            "message": "Logged out successfully"
        })
        registry.remove_connection(client_socket)
        try:
            client_socket.close()
        except Exception:
            pass

    elif msg_type == "report_incident":
        incident_manager.create(message, client_socket, user_info)

    elif msg_type == "get_incidents":
        incident_manager.get_incidents(message, client_socket, user_info)

    elif msg_type == "update_status":
        incident_manager.update_status(message, client_socket, user_info)

    elif msg_type == "assign_responder":
        incident_manager.assign(message, client_socket, user_info)

    elif msg_type == "get_notifications":
        notification_manager.get_notifs(message, client_socket, user_info)

    elif msg_type == "send_notification":
        notification_manager.notify(message, client_socket, user_info)

    elif msg_type == "get_responders":
        incident_manager.get_responders(message, client_socket, user_info)

    elif msg_type == "get_incident_history":
        incident_manager.get_incident_history(message, client_socket, user_info)

    else:
        registry.send_json(client_socket, {
            "type": "error",
            "message": f"Unknown message type '{msg_type}'",
            "request": msg_type
        })
