'''
Every function that have a route, place here
'''
from . import app
from flask import session, redirect, url_for, render_template, request, jsonify, make_response
from modules.controller import checkStudent, createStudent, require_login, decode_google_jwt, fetchStudent
from config import CLIENT_ID

@app.route('/', methods=["GET"])
def index():
    if 'user-id' not in session:
        return render_template('landingpage.html', client_id = CLIENT_ID)
    
    studentData = fetchStudent(session['user-id'])
    GetName = studentData[0][1] if studentData else None
    return render_template('main.html', userName = GetName, userIMG = session['user-photo'])    # Pulihi nalang ni sa unsa ang e render pag naka login na

@app.route('/login', methods=["POST"])
def login():
    try:
        # Get the token from the request
        req = request.get_json()
        token = req.get('token')

        if not token:
            return make_response(jsonify({'message': 'Token is required'}), 400)

        decoded_token = decode_google_jwt(token)    # Decode the token to get the user info

        if not decoded_token:
            return make_response(jsonify({'message': 'Invalid or expired token'}), 400)

        student_id = decoded_token.get('sub')
        student_name = decoded_token.get('name')
        student_email = decoded_token.get('email')
        student_picture = decoded_token.get('picture')

        success_code = 200
        # If the user is new, create a new student in the database
        if checkStudent(student_id):
            student = (student_id, student_name, student_email)
            createStudent(student)
            success_code = 201
        
        # Add the user/student id to the session
        session['user-id'] = student_id
        session['user-photo'] = student_picture  # URL

        return make_response(jsonify({'redirect_url': session.pop('next_url', url_for('index'))}), success_code)
    except Exception as e:
        print(f"Error: {str(e)}")  # Log the full error for debugging
        return make_response(jsonify({'message': 'Invalid JSON format', 'error': str(e)}), 400)

@app.route('/logout')
@require_login
def logout():
    # Clear the session
    session.pop('user-id', None)
    session.pop('user-photo', None)
    return redirect(url_for('index'))