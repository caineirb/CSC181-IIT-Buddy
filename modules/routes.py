'''
Every function that have a route, place here
'''
from . import app, oauth
from flask import session, redirect, url_for

@app.route('/')
def index():
    email = dict(session).get('email', None)
    id = dict(session).get('id', None)
    if id:
        return f"Hello {email} with id: {id}" 
    
    # Display the landing page if not signed in
    return f'Hello! Log in with your Google account: <a href="/login">Log in</a>'

@app.route('/login')
def login():
    google = oauth.create_client('google')
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    google = oauth.create_client('google')
    token = google.authorize_access_token()
    resp = google.get('userinfo')
    user_info = resp.json()
    print(user_info)
    session['email'] = user_info['email']
    session['id'] = user_info['id']
    return redirect('/')


@app.route('/logout')
def logout():
    # Clear the session
    # session.pop('email', None)
    session.clear()
    return redirect(url_for('index'))