from modules import start_app
from dotenv import load_dotenv

load_dotenv('.env')

# Start the app
app = start_app()

if __name__ == '__main__':
    app.run(debug=True)