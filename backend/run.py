"""
Production startup script for Render.
Render sets the PORT environment variable automatically.
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,          # No hot-reload in production
        workers=1,             # Single worker for SQLite (use PostgreSQL for multi-worker)
        log_level="info",
    )
