import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "super-secret"  # replace later with env
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "../database/automeet.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
