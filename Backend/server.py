import socket
import threading
from Backend import clienthandler
server=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.bind("0,0,0,0",5000)
server.listen(5)
client_socket,client_address=server.accept()
thread=threading.Thread(target=clienthandler,args=(client_socket,))
thread.start