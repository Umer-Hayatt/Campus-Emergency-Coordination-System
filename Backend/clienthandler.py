import json
import traceback
from message_router import route
import registry

MAX_BUFFER_SIZE = 64 * 1024  # 64 KB safety limit to prevent memory exhaustion

def handleclient(client_socket, client_address=None):
    """
    Per-client worker thread:
    - Reads raw bytes from TCP stream and buffers them.
    - Splits on b'\\n' before decoding to UTF-8 to prevent breaking multi-byte characters split across recv calls.
    - Handles multiple messages in one recv and one message split across several recvs.
    - Catches socket disconnects cleanly without stack traces.
    - Uses try/finally to guarantee connection removal from registry and socket closure.
    """
    if client_address is None:
        try:
            client_address = client_socket.getpeername()
        except Exception:
            client_address = ("unknown", 0)

    registry.add_connection(client_socket, client_address)
    print(f"[+] Client connected from {client_address}")

    raw_buffer = b""

    try:
        while True:
            try:
                data = client_socket.recv(4096)
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, OSError):
                # Clean exit on abrupt client disconnect or network reset
                break

            if not data:
                # Client closed the connection (FIN packet received)
                break

            raw_buffer += data

            # Guard against memory exhaustion attacks
            if len(raw_buffer) > MAX_BUFFER_SIZE:
                registry.send_json(client_socket, {
                    "type": "error",
                    "message": "Message buffer exceeded 64 KB limit",
                    "request": "unknown"
                })
                break

            # Frame messages by newline delimiter on raw bytes BEFORE decoding to UTF-8
            while b"\n" in raw_buffer:
                line_bytes, raw_buffer = raw_buffer.split(b"\n", 1)
                line_bytes = line_bytes.strip()
                if not line_bytes:
                    continue

                try:
                    text = line_bytes.decode("utf-8")
                except UnicodeDecodeError as ude:
                    registry.send_json(client_socket, {
                        "type": "error",
                        "message": f"Malformed UTF-8 character encoding: {str(ude)}",
                        "request": "unknown"
                    })
                    continue

                try:
                    message = json.loads(text)
                except json.JSONDecodeError as jde:
                    registry.send_json(client_socket, {
                        "type": "error",
                        "message": f"Malformed JSON: {str(jde)}",
                        "request": "unknown"
                    })
                    # Connection keeps running after malformed JSON
                    continue

                # Isolate message dispatch so an uncaught exception cannot terminate the client thread
                try:
                    route(message, client_socket)
                except Exception as ex:
                    traceback.print_exc()
                    registry.send_json(client_socket, {
                        "type": "error",
                        "message": f"Internal server error: {str(ex)}",
                        "request": message.get("type") if isinstance(message, dict) else "unknown"
                    })

    finally:
        # Guarantee cleanup on disconnect
        registry.remove_connection(client_socket)
        try:
            client_socket.close()
        except Exception:
            pass
        print(f"[-] Client disconnected: {client_address}")
