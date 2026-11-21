import sqlite3
import os
import threading
import hashlib
import secrets
import hmac

# SQLite database file path relative to this script directory
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "emergency.db")

# Thread lock to serialize writes across multiple client threads
DB_WRITE_LOCK = threading.Lock()

def get_conn():
    """Create a new SQLite connection with foreign keys and dict-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: str = None) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a secure random salt."""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return f"{salt}${hashed}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$hash using constant-time comparison."""
    try:
        salt, expected_hash = stored_hash.split("$", 1)
        actual_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
        return hmac.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False

def init_db():
    """Initialize database tables and seed demo accounts if empty."""
    with DB_WRITE_LOCK:
        conn = get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                type TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL,
                reported_by INTEGER NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (reported_by) REFERENCES users(id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id INTEGER NOT NULL,
                responder_id INTEGER NOT NULL,
                assigned_by INTEGER NOT NULL,
                assigned_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (incident_id) REFERENCES incidents(id),
                FOREIGN KEY (responder_id) REFERENCES users(id),
                FOREIGN KEY (assigned_by) REFERENCES users(id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS incident_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id INTEGER NOT NULL,
                changed_by INTEGER NOT NULL,
                old_status TEXT,
                new_status TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (incident_id) REFERENCES incidents(id),
                FOREIGN KEY (changed_by) REFERENCES users(id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                incident_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        if count == 0:
            demo_users = [
                ("student01", hash_password("pass"), "student"),
                ("admin01", hash_password("pass"), "admin"),
                ("sec01", hash_password("pass"), "security"),
                ("med01", hash_password("pass"), "medical")
            ]
            cursor.executemany("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", demo_users)

        conn.commit()
        conn.close()

def get_user_by_username(username: str):
    """Retrieve user record by username."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int):
    """Retrieve user record by user ID."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_users_by_role(role: str):
    """Retrieve all users with a specific role."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE role = ?", (role,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_incident(title, description, location, type_, severity, reported_by):
    """Create a new incident and log its initial creation in incident_history."""
    with DB_WRITE_LOCK:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO incidents (title, description, location, type, severity, status, reported_by, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'REPORTED', ?, datetime('now'), datetime('now'))""",
            (title, description, location, type_, severity, reported_by)
        )
        incident_id = cursor.lastrowid

        cursor.execute(
            """INSERT INTO incident_history (incident_id, changed_by, old_status, new_status, created_at)
               VALUES (?, ?, NULL, 'REPORTED', datetime('now'))""",
            (incident_id, reported_by)
        )
        conn.commit()
        conn.close()
        return incident_id

def get_incident_by_id(incident_id: int):
    """Retrieve a single incident by its ID."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_incidents():
    """Retrieve all incidents ordered by creation time descending."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_incidents_by_user(user_id: int):
    """Retrieve incidents reported by a specific user."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE reported_by = ? ORDER BY id DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_assigned_incidents(responder_id: int):
    """Retrieve incidents assigned to a specific responder."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT DISTINCT i.* FROM incidents i
           JOIN assignments a ON i.id = a.incident_id
           WHERE a.responder_id = ? ORDER BY i.id DESC""",
        (responder_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_active_assignment(incident_id: int):
    """Retrieve the most recent assignment for an incident."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT a.*, u.username as responder_username, u.role as responder_role
           FROM assignments a
           JOIN users u ON a.responder_id = u.id
           WHERE a.incident_id = ?
           ORDER BY a.id DESC LIMIT 1""",
        (incident_id,)
    )
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def assign_responder(incident_id: int, responder_id: int, assigned_by: int):
    """Record an assignment row and set incident status to ASSIGNED."""
    with DB_WRITE_LOCK:
        conn = get_conn()
        cursor = conn.cursor()

        # Insert assignment record
        cursor.execute(
            """INSERT INTO assignments (incident_id, responder_id, assigned_by, assigned_at)
               VALUES (?, ?, ?, datetime('now'))""",
            (incident_id, responder_id, assigned_by)
        )
        assign_id = cursor.lastrowid

        # Update incident status and add history
        cursor.execute("SELECT status FROM incidents WHERE id = ?", (incident_id,))
        row = cursor.fetchone()
        old_status = row["status"] if row else None

        cursor.execute(
            "UPDATE incidents SET status = 'ASSIGNED', updated_at = datetime('now') WHERE id = ?",
            (incident_id,)
        )
        cursor.execute(
            """INSERT INTO incident_history (incident_id, changed_by, old_status, new_status, created_at)
               VALUES (?, ?, ?, 'ASSIGNED', datetime('now'))""",
            (incident_id, assigned_by, old_status)
        )

        conn.commit()
        conn.close()
        return assign_id

def change_status(incident_id: int, new_status: str, changed_by: int):
    """
    Unified function for all status updates.
    Updates incidents table and inserts an entry into incident_history in one transaction.
    """
    with DB_WRITE_LOCK:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM incidents WHERE id = ?", (incident_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return False, "Incident not found"

        old_status = row["status"]
        cursor.execute(
            "UPDATE incidents SET status = ?, updated_at = datetime('now') WHERE id = ?",
            (new_status, incident_id)
        )
        cursor.execute(
            """INSERT INTO incident_history (incident_id, changed_by, old_status, new_status, created_at)
               VALUES (?, ?, ?, ?, datetime('now'))""",
            (incident_id, changed_by, old_status, new_status)
        )
        conn.commit()
        conn.close()
        return True, old_status

def create_notification(user_id: int, incident_id: int, message: str):
    """Store a notification in the database for a user."""
    with DB_WRITE_LOCK:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO notifications (user_id, incident_id, message, is_read, created_at)
               VALUES (?, ?, ?, 0, datetime('now'))""",
            (user_id, incident_id, message)
        )
        notif_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return notif_id

def get_notifications(user_id: int, unread_only: bool = False):
    """Retrieve notifications for a user."""
    conn = get_conn()
    cursor = conn.cursor()
    if unread_only:
        cursor.execute(
            "SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY id ASC",
            (user_id,)
        )
    else:
        cursor.execute(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC",
            (user_id,)
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def mark_notifications_read(user_id: int):
    """Mark all unread notifications for a user as read."""
    with DB_WRITE_LOCK:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        conn.close()

def get_incident_history(incident_id: int):
    """Retrieve status-change history for an incident, ordered chronologically."""
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """SELECT h.id, h.incident_id, h.old_status, h.new_status, h.created_at,
                  u.username as changed_by_username
           FROM incident_history h
           JOIN users u ON h.changed_by = u.id
           WHERE h.incident_id = ?
           ORDER BY h.id ASC""",
        (incident_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    init_db()
    print("Database Initialized successfully.")
