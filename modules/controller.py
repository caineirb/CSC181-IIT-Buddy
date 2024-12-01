from . import mysql
from functools import wraps
from flask import session, redirect, url_for, request

'''
Sample Function that need login to access:

@app.route('/sample', methods=["POST", "GET"])
@require_login
def sample():
    chuchu

'''
def require_login(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if 'user-id' not in session:
            session['next_url'] = request.url   # store the url being accessed
            return redirect(url_for('index'))
        return func(*args, **kwargs)
    return decorated_function

def checkStudent(id: str):
    try:
        cur = mysql.connection.cursor()
        check_query = "SELECT COUNT(`id`) FROM `students` WHERE `id` = %s;"
        cur.execute(check_query, (id,))
        return cur.fetchall()[0][0] == 0
    except mysql.connection.Error as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()

def fetchStudent(id: str):
    try:
        cur = mysql.connection.cursor()
        check_query = "SELECT * FROM `students` WHERE `id` = %s;"
        cur.execute(check_query, (id,))
        return cur.fetchall()
    except mysql.connection.Error as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()

def createStudent(student: tuple):
    try:
        cur = mysql.connection.cursor()
        create_query = "INSERT INTO `students` (`id`, `name`, `email`) VALUES (%s, %s, %s);"
        cur.execute(create_query, student)
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()
        raise e
    finally:
        cur.close()

from google.oauth2 import id_token
from google.auth.transport import requests
from config import CLIENT_ID

def decode_google_jwt(token):
    try:
        decoded_token = id_token.verify_oauth2_token(token, requests.Request(), audience=CLIENT_ID, clock_skew_in_seconds=60)
        return decoded_token
    except ValueError as error:
        print("Token verification failed:", error)
        return None
    except Exception as e:
        print(f"Error during token verification: {e}")
        return None

from datetime import datetime

# For the datetime data displayed in the reviewer cards
def calculate_time_passed(datetime_value):
    """Calculate the time passed from a datetime value to now."""
    current_time = datetime.now()
    time_difference = current_time - datetime_value

    if time_difference.days > 0:
        return f"{time_difference.days} days ago" if time_difference.days > 1 else f"{time_difference.days} day ago"
    elif time_difference.total_seconds() >= 3600:
        hours = int(time_difference.total_seconds() // 3600)
        return f"{hours} hours ago" if hours > 1 else f"{hours} hour ago"
    elif time_difference.total_seconds() >= 60:
        minutes = int(time_difference.total_seconds() // 60)
        return f"{minutes} minutes ago" if minutes > 1 else f"{minutes} minute ago"
    else:
        return "Just now"