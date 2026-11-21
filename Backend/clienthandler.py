from message_router import route
import json

def handleclient(client_socket):
    buffer=""
    while True:
        data=client_socket.recv(4096)
        buffer +=data.decode("utf-8")
        lines=buffer.split("\n")
        buffer=lines[-1]
        complete=lines[:-1]
        if not data:
            break
        for line in complete:
            if line:
                try:
                    message = json.loads(line)
                    route(message, client_socket)
                except:
                    pass


    