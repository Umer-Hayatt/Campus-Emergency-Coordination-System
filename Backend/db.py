import sqlite3
DB_PATH="emergency.db"

def get_conn():
    return sqlite3.connect(DB_PATH)
def init_db():
    conn=get_conn()
    cursor=conn.cursor()
    cursor.execute(""" 
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL)
             """)
    cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS incidents(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                location TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT NOT NULL,
                reported_by INTEGER NOT NULL,
                create_at TEXT NOT NULL)
                 """)
    cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS assignments(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id INTEGER NOT NULL,
                responder_id INTEGER NOT NULL,
                assigned_by INTEGER NOT NULL,
                assigned_at TEXT DEFAULT(datetime('now')))
                 """)
    cursor.execute(""" 
            CREATE TABLE IF NOT EXISTS notifications(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                incident_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at TEXT DEFAULT(datetime('now')))
                 """)
    cursor.execute("SELECT COUNT (*)FROM users")
    count=cursor.fetchone()[0]
    if count == 0:
        cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ("student01", "pass", "student"))
        cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ("admin01", "pass", "admin"))
        cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ("sec01", "pass", "security"))
        cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ("med01", "pass", "medical"))
    conn.commit()

    conn.close()
def get_user_by_username(username):
     conn=get_conn()
     cursor=conn.cursor()
     cursor.execute("SELECT * FROM users WHERE username=?",(username,))
     row=cursor.fetchone()
     conn.close()
     return row
def create_incident(title,description,location,type_,reported_by):
     conn=get_conn()
     cursor=conn.cursor()
     cursor.execute(
         "INSERT INTO incidents (title, description, location, type, status, reported_by, create_at) "
         "VALUES (?,?,?,?,?,?,datetime('now'))",
         (title, description, location, type_, 'REPORTED', reported_by))
     conn.commit()
     incident_id = cursor.lastrowid
     conn.close()
     return incident_id
def get_all_incidents():
    conn=get_conn()
    cursor=conn.cursor()
    cursor.execute("SELECT * FROM incidents")
    rows=cursor.fetchall()
    conn.close()
    return rows
def get_incidents_by_user(user_id):
    conn=get_conn()
    cursor=conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE reported_by=?",(user_id,))
    rows=cursor.fetchall()
    conn.close()
    return rows
def get_assigned_incidents(responder_id):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM assignments WHERE responder_id = ?", (responder_id,))
    rows=cursor.fetchall()
    conn.close()

    return rows

def update_incident_status(incident_id, new_status):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("UPDATE incidents SET status = ? WHERE id = ?", (new_status, incident_id))
    conn.commit()
    conn.close()

def assign_responder(incident_id, responder_id, assigned_by):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO assignments (incident_id, responder_id, assigned_by) VALUES (?, ?, ?)", (incident_id, responder_id, assigned_by))
    conn.commit()
    conn.close()
    return cursor.lastrowid

def create_notification(user_id, incident_id, message):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notifications (user_id, incident_id, message) VALUES (?, ?, ?)", (user_id, incident_id, message))
    conn.commit()
    conn.close()

def get_notifications(user_id):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications WHERE user_id = ?", (user_id,))
    rows=cursor.fetchall()
    conn.close()
    return rows
     
         
if __name__=="__main__":
        init_db()
        print("Database Initialized")   