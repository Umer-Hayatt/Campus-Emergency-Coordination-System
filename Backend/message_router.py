from incident_manager import 
from auth import authenticate
def route(message,client_socket):
    if message.get("type")=="login":
        authenticate(message,client_socket)
    elif message.get("type")=="report_incident":
        report_incident(message,client_socket)
    elif message.get("type")=="get_my_incidents":
        get_my_incidents(message,client_socket)
    elif message.get("type")=="update_status":
            update_status(message,client_socket)
    elif message.get("type")=="assign_responder":
            assign_responder(message,client_socket)
    elif message.get("type")=="login_success":
            login_success(message,client_socket)
    elif message.get("type")=="login_error":
            login_error(message,client_socket)
    elif message.get("type")=="incidents":
            incidents(message,client_socket)
    elif message.get("type")=="error":
            error(message,client_socket)
    
