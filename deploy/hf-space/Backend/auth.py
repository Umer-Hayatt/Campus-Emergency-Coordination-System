import db
import registry
import notification_manager

def authenticate(username, password, client_socket):
    """
    Authenticate a user, store server-side identity in registry upon success,
    and push unread notifications. Replaces all direct client_socket.send calls
    with registry.send_json.
    """
    if not username or not password or not isinstance(username, str) or not isinstance(password, str):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Username and password must be non-empty strings",
            "request": "login"
        })
        return

    user = db.get_user_by_username(username)
    if user is None or not db.verify_password(password, user["password"]):
        registry.send_json(client_socket, {
            "type": "error",
            "message": "Invalid username or password",
            "request": "login"
        })
        return

    # Successful login: store identity in registry on the connection
    registry.set_identity(client_socket, user_id=user["id"], username=user["username"], role=user["role"])

    # Reply to client with server-verified credentials
    registry.send_json(client_socket, {
        "type": "login_success",
        "role": user["role"],
        "user_id": user["id"],
        "username": user["username"]
    })

    # Deliver any pending notifications queued while offline
    notification_manager.send_unread_on_login(client_socket, user["id"])
