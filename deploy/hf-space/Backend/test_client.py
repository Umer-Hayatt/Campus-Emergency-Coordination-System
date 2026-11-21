import socket
import threading
import json
import sys
import os

def reader_loop(sock):
    """
    Background daemon thread that continuously listens for incoming
    messages from the server (both replies and asynchronous real-time pushes)
    and prints them immediately to the console.
    """
    buffer = b""
    try:
        while True:
            data = sock.recv(4096)
            if not data:
                print("\n[!] Connection closed by remote server.")
                break
            buffer += data
            while b"\n" in buffer:
                line, buffer = buffer.split(b"\n", 1)
                line = line.strip()
                if not line:
                    continue
                try:
                    msg = json.loads(line.decode("utf-8"))
                    formatted = json.dumps(msg, indent=2)
                    msg_type = msg.get("type", "unknown")
                    print(f"\n<-- [RECEIVED: {msg_type}]\n{formatted}\n> ", end="", flush=True)
                except Exception:
                    print(f"\n<-- [RAW]: {line.decode('utf-8', errors='replace')}\n> ", end="", flush=True)
    except Exception as e:
        print(f"\n[!] Reader thread terminated: {e}")
    finally:
        os._exit(0)

def print_help():
    print("""
======================================================================
Campus Emergency System - Interactive CLI Test Client
======================================================================
Commands:
  login <user> <pass>                Login (e.g. login student01 pass)
  report <title> | <desc> | <loc> | <type> | <severity>
                                     Report incident (type: fire|medical|security|accident|other)
                                     (severity: low|medium|high|critical)
  list                               Get incident list
  assign <incident_id> <resp_id>     Assign responder (admin only, med01=4, sec01=3)
  status <incident_id> <new_status>  Update incident status (e.g. ACCEPTED, EN_ROUTE)
  notifs                             Get notifications
  logout                             Log out
  raw <json>                         Send raw JSON string
  help                               Show this menu
  exit / quit                        Disconnect and exit

You can also paste raw JSON directly (starts with '{').
Real-time push alerts from other clients will appear asynchronously!
======================================================================
""")

def main():
    host = os.environ.get("ALERTBRIDGE_HOST", "127.0.0.1")
    port = int(os.environ.get("ALERTBRIDGE_PORT", 5000))

    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((host, port))
        print(f"[*] Connected to Campus Emergency TCP Server at {host}:{port}")
    except Exception as e:
        print(f"[x] Failed to connect to {host}:{port}: {e}")
        sys.exit(1)

    # Start asynchronous reader thread
    thread = threading.Thread(target=reader_loop, args=(sock,), daemon=True)
    thread.start()

    print_help()

    while True:
        try:
            cmd = input("> ").strip()
            if not cmd:
                continue

            if cmd.lower() in ("exit", "quit"):
                print("[*] Disconnecting...")
                break

            if cmd.lower() == "help":
                print_help()
                continue

            # Direct JSON paste
            if cmd.startswith("{"):
                sock.sendall((cmd + "\n").encode("utf-8"))
                continue

            # Command shortcuts
            parts = cmd.split(maxsplit=1)
            action = parts[0].lower()
            rest = parts[1] if len(parts) > 1 else ""

            payload = None

            if action == "login":
                args = rest.split()
                if len(args) == 2:
                    payload = {"type": "login", "username": args[0], "password": args[1]}
                else:
                    print("[!] Usage: login <username> <password>")

            elif action == "report":
                args = [a.strip() for a in rest.split("|")]
                if len(args) == 5:
                    payload = {
                        "type": "report_incident",
                        "title": args[0],
                        "description": args[1],
                        "location": args[2],
                        "incident_type": args[3],
                        "severity": args[4]
                    }
                else:
                    print("[!] Usage: report <title> | <desc> | <loc> | <type> | <severity>")

            elif action == "list":
                payload = {"type": "get_incidents"}

            elif action == "assign":
                args = rest.split()
                if len(args) == 2:
                    payload = {"type": "assign_responder", "incident_id": int(args[0]), "responder_id": int(args[1])}
                else:
                    print("[!] Usage: assign <incident_id> <responder_id>")

            elif action == "status":
                args = rest.split()
                if len(args) == 2:
                    payload = {"type": "update_status", "incident_id": int(args[0]), "new_status": args[1]}
                else:
                    print("[!] Usage: status <incident_id> <new_status>")

            elif action == "notifs":
                payload = {"type": "get_notifications"}

            elif action == "logout":
                payload = {"type": "logout"}

            elif action == "raw":
                sock.sendall((rest + "\n").encode("utf-8"))
                continue

            else:
                print(f"[!] Unknown command '{action}'. Type 'help' for instructions.")

            if payload is not None:
                sock.sendall((json.dumps(payload) + "\n").encode("utf-8"))

        except (KeyboardInterrupt, EOFError):
            print("\n[*] Exiting...")
            break
        except Exception as ex:
            print(f"[!] Error: {ex}")

    try:
        sock.close()
    except Exception:
        pass

if __name__ == "__main__":
    main()
