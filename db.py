import sqlite3
DB_PATH="emergency.db"
def get_conn():
    return sqlite3.connect(DB_PATH)
def init_db():
    Create Table IF NOT EXISTS