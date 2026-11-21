import auth
import incident_manager
import notification_manager

def route(message, client_socket):
    t = message.get("type")

    if t == "login":
        auth.authenticate(message.get("username"), message.get("password"), client_socket)

    elif t == "report_incident":
        incident_manager.create(message, client_socket)

    elif t == "get_incidents":
        incident_manager.get_incidents(message, client_socket)

    elif t == "update_status":
        incident_manager.update_status(message, client_socket)

    elif t == "assign_responder":
        incident_manager.assign(message, client_socket)

    elif t == "get_notifications":
        notification_manager.get_notifs(message, client_socket)

    elif t == "send_notification":
        notification_manager.notify(message, client_socket)
    
