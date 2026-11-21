import socket
import threading
from clienthandler import handleclient
server=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.bind(("0.0.0.0",5000))
server.listen(5)
while True:
    client_socket,client_address=server.accept()
    thread=threading.Thread(target=handleclient,args=(client_socket,))
    thread.start()