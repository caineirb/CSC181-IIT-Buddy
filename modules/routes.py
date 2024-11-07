'''
Every function that have a route, place here
'''
from . import app
from flask import session, redirect, url_for, render_template, request, jsonify, make_response
from modules.controller import checkStudent, createStudent
from config import CLIENT_ID


@app.route('/')
def index():
    if 'user-id' not in session:
        return render_template('index.html', client_id = CLIENT_ID)
    
    return f"Welcome {session['user-id']}"

@app.route('/login', methods=["POST"])
def login():
    try:
        req = request.get_json()

        # If the user is new, create a new student in the database
        if len(checkStudent(req['id'])) == 0:
            student = (req['id'], req['name'], req['email'])
            createStudent(student)
        
        # add the user/student id to the session
        session['user-id'] = req['id']
        session['user-name'] = req['name']
        session['user-email'] = req['email']
        print(session['user-id'])

        return jsonify({'redirect_url': url_for('index')})
    except Exception as e:
        return make_response(jsonify({'message': 'Invalid JSON format'}), 400)

@app.route('/logout')
def logout():
    # Clear the session
    session.pop('user-id', None)
    session.pop('user-name', None)
    session.pop('user-email', None)
    return redirect(url_for('index'))