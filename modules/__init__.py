from flask import Flask
from flask_mysqldb import MySQL
from config import SECRET_KEY, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST, BOOTSTRAP_SERVE_LOCAL
from flask_wtf.csrf import CSRFProtect
from datetime import timedelta

mysql = MySQL()
csrf = CSRFProtect()

'''
Place the blueprints here

e.g "from <modules.feature_module> import <blueprint_name>"
'''
from modules.reviewersFeed import reviewers_feed_bp
from modules.reviewers import reviewers_bp
from modules.notes import notes_bp


app = Flask(__name__, instance_relative_config=True)

def start_app():    
    app.config.from_mapping(
        SECRET_KEY=SECRET_KEY,
        MYSQL_USER=DB_USERNAME,
        MYSQL_PASSWORD=DB_PASSWORD,
        MYSQL_DB=DB_NAME,
        MYSQL_HOST=DB_HOST,
        BOOTSTRAP_SERVE_LOCAL=BOOTSTRAP_SERVE_LOCAL
    )
    
    '''
    Add the blueprints here to the app
    e.g "app.register_blueprint(<blueprint_name>, url_prefix="/<something>")"
    '''    
    app.register_blueprint(reviewers_feed_bp, url_prefix="/reviewers-feed")
    app.register_blueprint(reviewers_bp, url_prefix="/reviewers")
    app.register_blueprint(notes_bp, url_prefix="/notes")

   

    app.permanent_session_lifetime = timedelta(days=1)  # Make sure the session/login of the user is valid for 1 day only
    mysql.init_app(app)
    csrf.init_app(app)  
    CSRFProtect(app)
    return app

from . import routes