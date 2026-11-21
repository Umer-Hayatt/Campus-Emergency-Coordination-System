from db import get_user_by_username
import json

def authenticate(username,password,client_socket):
    name=get_user_by_username(username)
    if name is None:
        response={"type":"login failed"}
        client_socket.send((json.dumps(response)+"\n").encode("utf-8"))
        
    else:
        if password!=name[2]:
            response={"type":"login failed"}
            client_socket.send((json.dumps(response)+"\n").encode("utf-8"))
        else:
            response ={"type": "login_success", "role": name[3], "user_id": name[0]}
            client_socket.send((json.dumps(response)+"\n").encode("utf-8"))