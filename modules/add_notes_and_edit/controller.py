from flask import current_app
from flask_mysqldb import MySQL
import datetime

def add_note(name, link, privacy, owner_id):
    mysql = current_app.extensions['mysql']
    cursor = mysql.connection.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO notes (title, link, privacy, owner_id, created_on)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, link, privacy, owner_id, datetime.datetime.now()))
        mysql.connection.commit()
        return {"status": "success", "message": "Note added successfully"}
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error: {str(e)}")  # Log the full error for debugging
        return {"status": "error", "message": str(e)}
    finally:
        cursor.close()
