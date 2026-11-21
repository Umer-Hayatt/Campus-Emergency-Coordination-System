import socket
import threading
import json
import time
import queue
import sys
import os

# Ensure Backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import server

HOST = os.environ.get("ALERTBRIDGE_HOST", "127.0.0.1")
PORT = int(os.environ.get("ALERTBRIDGE_PORT", 5000))

class TestClient:
    """Helper client using raw sockets and a background reader thread."""
    def __init__(self, name="client"):
        self.name = name
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((HOST, PORT))
        self.inbox = queue.Queue()
        self.running = True
        self.reader_thread = threading.Thread(target=self._reader, daemon=True)
        self.reader_thread.start()

    def _reader(self):
        buf = b""
        try:
            while self.running:
                data = self.sock.recv(4096)
                if not data:
                    break
                buf += data
                while b"\n" in buf:
                    line, buf = buf.split(b"\n", 1)
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        msg = json.loads(line.decode("utf-8"))
                        self.inbox.put(msg)
                    except Exception as e:
                        self.inbox.put({"_raw": line, "_error": str(e)})
        except Exception:
            pass

    def send(self, payload: dict):
        raw = (json.dumps(payload) + "\n").encode("utf-8")
        self.sock.sendall(raw)

    def send_raw(self, raw_str: str):
        self.sock.sendall(raw_str.encode("utf-8"))

    def recv(self, timeout=3.0):
        try:
            return self.inbox.get(timeout=timeout)
        except queue.Empty:
            raise TimeoutError(f"[{self.name}] No message received within {timeout}s")

    def recv_until_type(self, expected_type, timeout=3.0):
        deadline = time.time() + timeout
        while time.time() < deadline:
            remaining = max(0.1, deadline - time.time())
            try:
                msg = self.inbox.get(timeout=remaining)
                if isinstance(msg, dict) and msg.get("type") == expected_type:
                    return msg
            except queue.Empty:
                break
        raise TimeoutError(f"[{self.name}] Did not receive expected type '{expected_type}' within {timeout}s")

    def expect_no_message(self, duration=0.5):
        time.sleep(duration)
        if not self.inbox.empty():
            msg = self.inbox.get_nowait()
            raise AssertionError(f"[{self.name}] Expected no message, but got: {msg}")

    def close(self):
        self.running = False
        try:
            self.sock.close()
        except Exception:
            pass

def ensure_server_running():
    """Checks if server is running; if not, starts server in background thread."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect((HOST, PORT))
        s.close()
        return None  # Server already listening
    except Exception:
        pass

    # Start in-process server thread
    srv_sock = server.start_server(HOST, PORT)
    srv_thread = threading.Thread(target=server.run_server, args=(srv_sock,), daemon=True)
    srv_thread.start()
    time.sleep(0.3)
    return srv_sock

def main():
    print("=" * 70)
    print("RUNNING AUTOMATED TEST FLOW FOR CAMPUS EMERGENCY SYSTEM")
    print("=" * 70)

    server_sock = ensure_server_running()

    results = []

    def record(name, passed, detail=""):
        status = "PASS" if passed else "FAIL"
        results.append((name, passed))
        print(f"[{status}] {name}" + (f" - {detail}" if detail else ""))
        if not passed:
            print(f"       -> Details: {detail}")

    try:
        # -------------------------------------------------------------
        # CHECK 1: Wrong password rejected; unauthenticated request rejected
        # -------------------------------------------------------------
        try:
            c1 = TestClient("c_unauth")
            # Unauthenticated request
            c1.send({"type": "get_incidents"})
            resp1 = c1.recv()
            assert resp1.get("type") == "error" and resp1.get("message") == "Not logged in", f"Got: {resp1}"

            # Wrong password
            c1.send({"type": "login", "username": "student01", "password": "wrongpassword"})
            resp2 = c1.recv()
            assert resp2.get("type") == "error" and "Invalid username or password" in resp2.get("message", ""), f"Got: {resp2}"

            # Successful login
            c1.send({"type": "login", "username": "student01", "password": "pass"})
            resp3 = c1.recv()
            assert resp3.get("type") == "login_success" and resp3.get("role") == "student", f"Got: {resp3}"
            c1.close()
            record("1. Authentication checks (wrong pass & pre-login rejected)", True)
        except Exception as e:
            record("1. Authentication checks (wrong pass & pre-login rejected)", False, str(e))

        # -------------------------------------------------------------
        # Open 4 simultaneous connections (Student, Admin, Security, Medical)
        # -------------------------------------------------------------
        student = TestClient("student")
        admin = TestClient("admin")
        security = TestClient("security")
        medical = TestClient("medical")

        student.send({"type": "login", "username": "student01", "password": "pass"})
        assert student.recv().get("type") == "login_success"

        admin.send({"type": "login", "username": "admin01", "password": "pass"})
        assert admin.recv().get("type") == "login_success"

        security.send({"type": "login", "username": "sec01", "password": "pass"})
        assert security.recv().get("type") == "login_success"

        medical.send({"type": "login", "username": "med01", "password": "pass"})
        assert medical.recv().get("type") == "login_success"

        # Drain any unread notifications sent at login
        for c in (student, admin, security, medical):
            while not c.inbox.empty():
                c.inbox.get_nowait()

        # -------------------------------------------------------------
        # CHECK 2: Student reports incident -> student gets reply, admin gets live push
        # -------------------------------------------------------------
        incident_id = None
        try:
            student.send({
                "type": "report_incident",
                "title": "Severe Asthma Attack",
                "description": "Student in Library 3rd floor having breathing trouble",
                "location": "Library Floor 3",
                "incident_type": "medical",
                "severity": "high"
            })
            rep_student = student.recv_until_type("incident_created")
            incident_id = rep_student.get("incident_id")
            assert incident_id is not None, "Missing incident_id in response"

            # Admin must receive real-time push without asking
            admin_push = admin.recv_until_type("new_incident")
            assert admin_push.get("incident", {}).get("id") == incident_id, f"Admin push incident id mismatch: {admin_push}"
            record("2. Student reports incident -> admin receives live push", True)
        except Exception as e:
            record("2. Student reports incident -> admin receives live push", False, str(e))

        # -------------------------------------------------------------
        # CHECK 3: Student cannot assign responder or change status
        # -------------------------------------------------------------
        try:
            # Student tries to assign
            student.send({"type": "assign_responder", "incident_id": incident_id, "responder_id": 4})
            err1 = student.recv_until_type("error")
            assert "Only admins" in err1.get("message", "")

            # Student tries to change status
            student.send({"type": "update_status", "incident_id": incident_id, "new_status": "ACCEPTED"})
            err2 = student.recv_until_type("error")
            assert "Students are not permitted" in err2.get("message", "")

            record("3. Student blocked from assign_responder & update_status", True)
        except Exception as e:
            record("3. Student blocked from assign_responder & update_status", False, str(e))

        # -------------------------------------------------------------
        # CHECK 4: Fake user_id/role in message is ignored
        # -------------------------------------------------------------
        try:
            # Student injects fake role: "admin" and fake user_id
            student.send({"type": "get_incidents", "role": "admin", "user_id": 9999})
            inc_list_msg = student.recv_until_type("incidents_list")
            inc_list = inc_list_msg.get("incidents", [])
            # Should only contain incidents reported by student (user_id=1), not all
            for inc in inc_list:
                assert inc["reported_by"] == 1, f"Found incident not reported by student: {inc}"

            record("4. Client-supplied fake role/user_id ignored", True)
        except Exception as e:
            record("4. Client-supplied fake role/user_id ignored", False, str(e))

        # -------------------------------------------------------------
        # CHECK 5: Admin sets UNDER_REVIEW, assigns med responder:
        #          ONLY medical responder receives push; security receives nothing
        # -------------------------------------------------------------
        try:
            # Admin sets UNDER_REVIEW
            admin.send({"type": "update_status", "incident_id": incident_id, "new_status": "UNDER_REVIEW"})
            admin_stat_rep = admin.recv_until_type("status_updated")
            assert admin_stat_rep.get("new_status") == "UNDER_REVIEW"

            # Student receives push for status update
            stu_update = student.recv_until_type("incident_update")
            assert stu_update.get("new_status") == "UNDER_REVIEW"

            # Admin assigns medical responder (med01 has user_id=4)
            admin.send({"type": "assign_responder", "incident_id": incident_id, "responder_id": 4})
            assign_rep = admin.recv_until_type("assigned")
            assert assign_rep.get("incident_id") == incident_id

            # Medical responder MUST receive assignment_received
            med_push = medical.recv_until_type("assignment_received")
            assert med_push.get("incident_id") == incident_id

            # Security responder MUST receive nothing (selective unicast test)
            security.expect_no_message(0.5)

            record("5. Selective unicast push to assigned responder (sec receives nothing)", True)
        except Exception as e:
            record("5. Selective unicast push to assigned responder (sec receives nothing)", False, str(e))

        # -------------------------------------------------------------
        # CHECK 6: Ineligible or nonexistent responder assignment rejected
        # -------------------------------------------------------------
        try:
            # 6a. Already active assignment rejection
            admin.send({"type": "assign_responder", "incident_id": incident_id, "responder_id": 4})
            err_reassign = admin.recv_until_type("error")
            assert "already has an active assignment" in err_reassign.get("message", "")

            # 6b. Nonexistent responder
            student.send({
                "type": "report_incident",
                "title": "Fire in Cafeteria",
                "description": "Toaster on fire",
                "location": "Cafeteria Kitchen",
                "incident_type": "fire",
                "severity": "medium"
            })
            fire_inc_id = student.recv_until_type("incident_created").get("incident_id")
            admin.recv_until_type("new_incident")  # drain admin push

            admin.send({"type": "assign_responder", "incident_id": fire_inc_id, "responder_id": 9999})
            err_nonexist = admin.recv_until_type("error")
            assert "not found" in err_nonexist.get("message", "")

            # 6c. Ineligible responder (assigning fire to medical responder)
            admin.send({"type": "assign_responder", "incident_id": fire_inc_id, "responder_id": 4})
            err_inelig = admin.recv_until_type("error")
            assert "requires a 'security' responder" in err_inelig.get("message", "")

            record("6. Ineligible and nonexistent responder assignment rejected", True)
        except Exception as e:
            record("6. Ineligible and nonexistent responder assignment rejected", False, str(e))

        # -------------------------------------------------------------
        # CHECK 7: Responder FSM transitions & notifications (and invalid jump rejected)
        # -------------------------------------------------------------
        try:
            # Invalid jump: medical tries ASSIGNED -> RESOLVED
            medical.send({"type": "update_status", "incident_id": incident_id, "new_status": "RESOLVED"})
            err_jump = medical.recv_until_type("error")
            assert "Invalid status transition" in err_jump.get("message", "")

            # Valid step 1: ACCEPTED
            medical.send({"type": "update_status", "incident_id": incident_id, "new_status": "ACCEPTED"})
            assert medical.recv_until_type("status_updated").get("new_status") == "ACCEPTED"
            assert student.recv_until_type("incident_update").get("new_status") == "ACCEPTED"
            assert admin.recv_until_type("incident_update").get("new_status") == "ACCEPTED"

            # Valid step 2: EN_ROUTE
            medical.send({"type": "update_status", "incident_id": incident_id, "new_status": "EN_ROUTE"})
            assert medical.recv_until_type("status_updated").get("new_status") == "EN_ROUTE"
            assert student.recv_until_type("incident_update").get("new_status") == "EN_ROUTE"
            assert admin.recv_until_type("incident_update").get("new_status") == "EN_ROUTE"

            # Valid step 3: ON_SCENE
            medical.send({"type": "update_status", "incident_id": incident_id, "new_status": "ON_SCENE"})
            assert medical.recv_until_type("status_updated").get("new_status") == "ON_SCENE"
            assert student.recv_until_type("incident_update").get("new_status") == "ON_SCENE"
            assert admin.recv_until_type("incident_update").get("new_status") == "ON_SCENE"

            # Valid step 4: RESOLVED (terminal)
            medical.send({"type": "update_status", "incident_id": incident_id, "new_status": "RESOLVED"})
            assert medical.recv_until_type("status_updated").get("new_status") == "RESOLVED"
            assert student.recv_until_type("incident_update").get("new_status") == "RESOLVED"
            assert admin.recv_until_type("incident_update").get("new_status") == "RESOLVED"

            # Attempt modifying terminal state
            medical.send({"type": "update_status", "incident_id": incident_id, "new_status": "ACCEPTED"})
            err_term = medical.recv_until_type("error")
            assert "terminal status" in err_term.get("message", "")

            record("7. Full FSM lifecycle (ACCEPTED->EN_ROUTE->ON_SCENE->RESOLVED) & push delivery", True)
        except Exception as e:
            record("7. Full FSM lifecycle (ACCEPTED->EN_ROUTE->ON_SCENE->RESOLVED) & push delivery", False, str(e))

        # -------------------------------------------------------------
        # CHECK 8: Broken JSON returns error reply and connection survives
        # -------------------------------------------------------------
        try:
            student.send_raw("{ this is broken JSON \n")
            err_json = student.recv_until_type("error")
            assert "Malformed JSON" in err_json.get("message", "")

            # Verify student connection is still healthy
            student.send({"type": "get_incidents"})
            ok_rep = student.recv_until_type("incidents_list")
            assert isinstance(ok_rep.get("incidents"), list)

            record("8. Broken JSON handled cleanly without killing connection", True)
        except Exception as e:
            record("8. Broken JSON handled cleanly without killing connection", False, str(e))

        # -------------------------------------------------------------
        # CHECK 9: Abrupt client disconnect does not affect remaining clients
        # -------------------------------------------------------------
        try:
            temp_client = TestClient("temp")
            temp_client.send({"type": "login", "username": "student01", "password": "pass"})
            temp_client.recv_until_type("login_success")
            # Force abrupt disconnect
            temp_client.close()
            time.sleep(0.3)

            # Check admin, student, medical are all still fully functional
            admin.send({"type": "get_incidents"})
            admin_rep = admin.recv_until_type("incidents_list")
            assert len(admin_rep.get("incidents", [])) > 0

            student.send({"type": "get_incidents"})
            stu_rep = student.recv_until_type("incidents_list")
            assert isinstance(stu_rep.get("incidents"), list)

            record("9. Abrupt client disconnect handled cleanly without server disruption", True)
        except Exception as e:
            record("9. Abrupt client disconnect handled cleanly without server disruption", False, str(e))

        # -------------------------------------------------------------
        # CHECK 10: get_responders authorization (admin allowed, others refused)
        # -------------------------------------------------------------
        try:
            # Student attempts get_responders -> refused
            student.send({"type": "get_responders"})
            err_stu = student.recv_until_type("error")
            assert "Only admins can list responders" in err_stu.get("message", "")

            # Responder (security) attempts get_responders -> refused
            security.send({"type": "get_responders"})
            err_sec = security.recv_until_type("error")
            assert "Only admins can list responders" in err_sec.get("message", "")

            # Admin attempts get_responders -> allowed
            admin.send({"type": "get_responders"})
            resp_admin = admin.recv_until_type("responders_list")
            assert "responders" in resp_admin
            assert any(r.get("role") in ("security", "medical") for r in resp_admin["responders"])

            record("10. get_responders authorization (admin allowed, student and responder refused)", True)
        except Exception as e:
            record("10. get_responders authorization (admin allowed, student and responder refused)", False, str(e))

        # -------------------------------------------------------------
        # CHECK 11: get_incident_history authorization (reporter, admin, assigned responder allowed; others refused)
        # -------------------------------------------------------------
        try:
            # incident_id was reported by student01 and assigned to med01
            # 1. Admin allowed
            admin.send({"type": "get_incident_history", "incident_id": incident_id})
            hist_admin = admin.recv_until_type("incident_history")
            assert hist_admin.get("incident_id") == incident_id
            assert len(hist_admin.get("history", [])) > 0

            # 2. Reporting student allowed
            student.send({"type": "get_incident_history", "incident_id": incident_id})
            hist_stu = student.recv_until_type("incident_history")
            assert hist_stu.get("incident_id") == incident_id
            assert len(hist_stu.get("history", [])) > 0

            # 3. Assigned responder (medical) allowed
            medical.send({"type": "get_incident_history", "incident_id": incident_id})
            hist_med = medical.recv_until_type("incident_history")
            assert hist_med.get("incident_id") == incident_id
            assert len(hist_med.get("history", [])) > 0

            # 4. Unassigned responder (security) refused
            security.send({"type": "get_incident_history", "incident_id": incident_id})
            err_sec_hist = security.recv_until_type("error")
            assert "You can only view history for incidents assigned to you" in err_sec_hist.get("message", "")

            record("11. get_incident_history authorization (admin, reporter, assigned responder allowed; unassigned refused)", True)
        except Exception as e:
            record("11. get_incident_history authorization (admin, reporter, assigned responder allowed; unassigned refused)", False, str(e))

        # Cleanup test clients
        for c in (student, admin, security, medical):
            c.close()

    finally:
        if server_sock:
            try:
                server_sock.close()
            except Exception:
                pass

    print("=" * 70)
    print("TEST SUMMARY:")
    passed_count = sum(1 for _, p in results if p)
    total_count = len(results)
    for name, p in results:
        status = "PASS" if p else "FAIL"
        print(f"  [{status}] {name}")
    print(f"\nResult: {passed_count}/{total_count} checks passed.")
    print("=" * 70)

    if passed_count != total_count:
        sys.exit(1)

if __name__ == "__main__":
    main()
