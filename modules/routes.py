'''
Every function that have a route, place here
'''

from flask import Blueprint, render_template
from . import app

@app.route('/')
def index():
    return render_template('landingpage.html')