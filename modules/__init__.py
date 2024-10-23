from flask import Flask
from flask_mysqldb import MySQL
from config import SECRET_KEY,DB_NAME, DB_USERNAME, DB_PASSWORD, DB_HOST,BOOTSTRAP_SERVE_LOCAL, CLIENT_ID, CLIENT_SECRET
from flask_wtf.csrf import CSRFProtect
from authlib.integrations.flask_client import OAuth

mysql = MySQL()
oauth = OAuth()

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

    oauth.register(
        name='google',
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        client_kwargs={ 'scope': 'openid profile email'},
        api_base_url='https://www.googleapis.com/oauth2/v1/',
        access_token_params=None,
        access_token_method='POST',
        # access_token_url='https://accounts.google.com/o/oauth2/token',
        # authorize_url='https://accounts.google.com/o/oauth2/auth',
        jwks_uri="https://www.googleapis.com/oauth2/v1/certs",
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration'
    )
    
    '''
    Add the blueprints here to the app
    e.g "app.register_blueprint(<blueprint_name>, url_prefix="/<something>")"
    '''    
    mysql.init_app(app)
    oauth.init_app(app)
    CSRFProtect(app)
    return app


from . import routes