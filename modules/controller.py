from . import mysql
from functools import wraps
from flask import session, redirect, url_for


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
            return redirect(url_for('index'))
        return func(*args, **kwargs)
    return decorated_function

def checkStudent(id :str):
    try:
        cur = mysql.connection.cursor()

        check_query = """
            SELECT COUNT(`id`) FROM `students` WHERE `id` = %s;
        """
        
        cur.execute(check_query, (id, ))
        return cur.fetchall()[0][0] == 0
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()

# Use this to get the details of the student
def fetchStudent(id :str):
    try:
        cur = mysql.connection.cursor()

        check_query = """
            SELECT * FROM `students` WHERE `id` = %s;
        """
        
        cur.execute(check_query, (id, ))
        return cur.fetchall()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()

def createStudent(student :tuple):
    try:
        cur = mysql.connection.cursor()

        create_query = """
            INSERT INTO `students` (`id`, `name`, `email`)
            VALUES (%s, %s, %s);
        """
        
        cur.execute(create_query, student)
        mysql.connection.commit()
    except mysql.connection.Error as e:
        mysql.connection.rollback()  # Rollback in case of error
        raise e
    finally:
        cur.close()


from google.oauth2 import id_token
from google.auth.transport import requests
from config import CLIENT_ID

def decode_google_jwt(token):
    try:
        # Verify the token using Google's public keys and audience
        decoded_token = id_token.verify_oauth2_token(token, requests.Request(), audience=CLIENT_ID, clock_skew_in_seconds=60)
        
        return decoded_token  # Contains user info like email, name, picture
    except ValueError as error:
        print("Token verification failed:", error)
        return None
    except Exception as e:
        # Catch any other errors and print the exception
        print(f"Error during token verification: {e}")
        return None
