import json
from db import create_incident, get_all_incidents, get_incidents_by_user, update_incident_status, assign_responder

def create(message, client_socket):
    title = message.get("title")
    description = message.get("description")
    location = message.get("location")
    type_ = message.get("incident_type")
    reported_by = message.get("reported_by")
    incident_id = create_incident(title, description, location, type_, reported_by)
    response = {"type": "incident_created", "incident_id": incident_id}
    client_socket.send((json.dumps(response) + "\n").encode("utf-8"))

def get_incidents(message, client_socket):
    user_id = message.get("user_id")
    role = message.get("role")
    if role == "admin":
        incidents = get_all_incidents()
    else:
        incidents = get_incidents_by_user(user_id)
    response = {"type": "incidents_list", "incidents": incidents}
    client_socket.send((json.dumps(response) + "\n").encode("utf-8"))

def update_status(message, client_socket):
    incident_id = message.get("incident_id")
    new_status = message.get("new_status")
    update_incident_status(incident_id, new_status)
    response = {"type": "status_updated"}
    client_socket.send((json.dumps(response) + "\n").encode("utf-8"))

def assign(message, client_socket):
    incident_id = message.get("incident_id")
    responder_id = message.get("responder_id")
    assigned_by = message.get("assigned_by")
    assign_responder(incident_id, responder_id, assigned_by)
    response = {"type": "assigned"}
    client_socket.send((json.dumps(response) + "\n").encode("utf-8"))