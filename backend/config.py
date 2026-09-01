import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

class Settings:
    PROJECT_NAME: str = "VentureConnect"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ventureconnect_secret_jwt_key_2026_super_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days

    # MongoDB connection
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "ventureconnect")

    # CognoDB Cloud Managed Graph Database (openCypher over Bolt protocol)
    # Format: bolt+s://<instance-id>.databases.cognodb.cloud
    BOLT_URI: str = os.getenv("BOLT_URI", os.getenv("COGNODB_URI", "bolt://localhost:7687"))
    COGNODB_USER: str = os.getenv("COGNODB_USER", "cognodb")
    COGNODB_PASSWORD: str = os.getenv("COGNODB_PASSWORD", "secret")

    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(__file__), "uploads")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
