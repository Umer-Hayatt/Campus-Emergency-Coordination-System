import threading
import json
import logging

# Module-level lock protecting the shared client registry
# Must only be held for in-memory dictionary reads/writes, NEVER during socket I/O.
_registry_lock = threading.Lock()

# Mapping: socket -> {
#   "conn": socket,
#   "addr": tuple,
#   "user_id": int or None,
#   "username": str or None,
#   "role": str or None,
#   "send_lock": threading.Lock()  # Serializes socket writes to prevent interleaving
# }
_clients = {}

def add_connection(conn, addr):
    """Register a newly accepted TCP connection before authentication."""
    with _registry_lock:
        _clients[conn] = {
            "conn": conn,
            "addr": addr,
            "user_id": None,
            "username": None,
            "role": None,
            "send_lock": threading.Lock()
        }

def set_identity(conn, user_id, username, role):
    """Attach authenticated user identity to an active connection."""
    with _registry_lock:
        if conn in _clients:
            _clients[conn]["user_id"] = user_id
            _clients[conn]["username"] = username
            _clients[conn]["role"] = role
            return True
        return False

def remove_connection(conn):
    """Remove a connection from the registry on disconnect."""
    with _registry_lock:
        return _clients.pop(conn, None)

def get_connection(conn):
    """Retrieve identity info for a connection. Returns a snapshot dict or None."""
    with _registry_lock:
        entry = _clients.get(conn)
        if entry:
            return {
                "addr": entry["addr"],
                "user_id": entry["user_id"],
                "username": entry["username"],
                "role": entry["role"]
            }
        return None

def find_by_user_id(user_id):
    """
    Find all active connection sockets for a user_id.
    Copies the list under _registry_lock and returns it immediately.
    Never perform socket sends while holding this lock!
    """
    with _registry_lock:
        return [entry["conn"] for entry in _clients.values() if entry.get("user_id") == user_id]

def find_by_role(role):
    """
    Find all active connection sockets for a role (e.g. 'admin', 'security', 'medical').
    Copies the list under _registry_lock and returns it immediately.
    """
    with _registry_lock:
        return [entry["conn"] for entry in _clients.values() if entry.get("role") == role]

def get_all_connections():
    """Return a snapshot list of all active connection sockets."""
    with _registry_lock:
        return [entry["conn"] for entry in _clients.values()]

def send_json(conn, payload):
    """
    Thread-safe JSON sender with per-connection send lock.
    Appends newline '\\n' as NDJSON delimiter and sends via socket.sendall.
    Catches socket errors, marks the connection as dead, and removes it.

    Why send_lock:
    When a background thread pushes a notification to a client while that client's
    own thread is also replying, per-connection locking prevents their byte streams
    from interleaving into corrupted JSON.
    """
    send_lock = None
    with _registry_lock:
        entry = _clients.get(conn)
        if entry:
            send_lock = entry["send_lock"]

    # Connection not in registry or already closed
    if not send_lock:
        return False

    with send_lock:
        try:
            raw_data = (json.dumps(payload) + "\n").encode("utf-8")
            conn.sendall(raw_data)
            return True
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError) as e:
            # Connection has died; remove from registry and close cleanly
            remove_connection(conn)
            try:
                conn.close()
            except Exception:
                pass
            return False
