import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")
    TCGAPI_BASE_URL = os.environ.get("TCGAPI_BASE_URL", "http://localhost:8080")
