from os import getenv
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = getenv("SECRET_KEY") or "dev_secret_key_iit_buddy_portfolio_demo"
DB_NAME = getenv("DB_NAME") or "iit_buddy_db"
DB_USERNAME = getenv("DB_USERNAME") or "root"
DB_PASSWORD = getenv("DB_PASSWORD") or ""
DB_HOST = getenv("DB_HOST") or "localhost"
BOOTSTRAP_SERVE_LOCAL = getenv("BOOTSTRAP_SERVE_LOCAL") or True
CLIENT_ID = getenv("CLIENT_ID")
CLIENT_SECRET = getenv("CLIENT_SECRET")