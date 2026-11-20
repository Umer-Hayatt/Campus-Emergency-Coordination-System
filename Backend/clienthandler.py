from Backend.message_router import route

def handleclient(client_socket):
    buffer=""
    while True:
        data=client_socket.recv(4096)
        data=data.decode("utf-8")
        data +=buffer
        lines=buffer.split("\n")
        buffer=lines[-1]
        complete=lines[:-1]
        if data=="":
            break
        route(complete,client_socket)


    