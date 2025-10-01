import os
<<<<<<< Updated upstream
=======
from datetime import timedelta
>>>>>>> Stashed changes

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
<<<<<<< Updated upstream
    SECRET_KEY = "super-secret"  # replace later with env
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "../database/automeet.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
=======
    # Security
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-key-change-in-production"

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or \
        "sqlite:///" + os.path.join(BASE_DIR, "../database/automeet.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-secret-key-change-me"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS") or [
        "http://localhost:3000",   # React frontend
        "chrome-extension://*"     # Extension
    ]
>>>>>>> Stashed changes
