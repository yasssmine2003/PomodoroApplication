"""
Run this file to start the FlowTime FastAPI backend.
Usage: python run.py
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Hot reload for development; remove for pure production
    )
