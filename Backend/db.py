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
if __name__=="__main__":
        init_db()
        print("Database Initialized")   