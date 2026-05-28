pythonfrom dotenv import load_dotenv
import os

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "K-Bridge Platform")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG = os.getenv("DEBUG", "True") == "True"
SECRET_KEY = os.getenv("SECRET_KEY", "kbridge-secret-key")

DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY")

SUPPORTED_LANGUAGES = ["ko", "bn", "en", "km", "vi"]
LANGUAGE_NAMES = {
    "ko": "한국어",
    "bn": "বাংলা",
    "en": "English",
    "km": "ភាសាខ្មែរ",
    "vi": "Tiếng Việt"
}
DEFAULT_LANGUAGE = "bn"