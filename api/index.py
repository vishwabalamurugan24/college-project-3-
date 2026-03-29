from backend.app import create_app

app = create_app()

# This is the entry point for Vercel
def handler(request):
    return app(request)
