from backend.app import create_app

# Vercel needs the app object to be exported as 'app'
# We use create_app to initialize the Flask instance
app = create_app()

if __name__ == "__main__":
    app.run()
