from dotenv import load_dotenv
load_dotenv('.env')

from modules import start_app

# Start the app
app = start_app()

if __name__ == '__main__':
    app.run(debug=True)