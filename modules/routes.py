'''
Every function that have a route, place here
'''

from flask import Blueprint, render_template, url_for

routes = Blueprint('routes', __name__)


@routes.route("/")
def base():
    return render_template('base.html')

@routes.route('/landing_page')
def landing_page():
    return render_template('landingpage.html')
