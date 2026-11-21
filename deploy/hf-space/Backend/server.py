import socket
import threading
import os
import sys
from clienthandler import handleclient
from db import init_db

def start_server(host=None, port=None):
    """Initialize DB and bind listening socket."""
    init_db()
    if host is None:
        host = os.environ.get("ALERTBRIDGE_HOST", "127.0.0.1")
    if port is None:
        port = int(os.environ.get("ALERTBRIDGE_PORT", 5000))

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # Enable address reuse so server can be restarted immediately without TIME_WAIT errors
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((host, port))
    server.listen(128)
    print(f"[*] Campus Emergency TCP Server listening on {host}:{port}")
    return server

def run_server(server):
    """Accept incoming client connections and spawn daemon threads."""
    while True:
        try:
            client_socket, client_address = server.accept()
            # Daemon thread ensures worker threads do not block process shutdown
            thread = threading.Thread(
                target=handleclient,
                args=(client_socket, client_address),
                daemon=True
            )
            thread.start()
        except (ConnectionAbortedError, OSError):
            break

def main():
    server = start_server()
    print("[*] Press Ctrl+C to terminate the server gracefully.")
    try:
        run_server(server)
    except KeyboardInterrupt:
        print("\n[*] KeyboardInterrupt received. Shutting down server...")
    finally:
        try:
            server.close()
        except Exception:
            pass
        print("[*] Server stopped cleanly.")

if __name__ == "__main__":
    main()
