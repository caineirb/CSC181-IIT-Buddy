from flask import Flask
from .routes import routes
from flask_mysqldb import MySQL
from config import SECRET_KEY,DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST,BOOTSTRAP_SERVE_LOCAL
from flask_wtf.csrf import CSRFProtect

mysql = MySQL()

'''
Place the blueprints here

e.g "from <modules.feature_module> import <blueprint_name>"
'''

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

    app = Flask(__name__)
    app.register_blueprint(routes, url_prefix="/")

    mysql.init_app(app)
    CSRFProtect(app)
    return app

from . import routes