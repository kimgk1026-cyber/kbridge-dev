from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.services.auth import register_user, login_user
from pydantic import BaseModel
from app.database import engine, Base
from app.models.conversation import Conversation, Message
from app.routers.conversations import router as conv_router

load_dotenv()

app = FastAPI(
    title="K-Bridge Platform",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)
app.include_router(conv_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "K-Bridge 서버 작동중! 🚀", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/verticals")
def get_verticals():
    return {
        "verticals": [
            {"id": "k_edu", "name": "K-EDU", "character": "지수"},
            {"id": "k_work", "name": "K-WORK", "character": "라힘"},
            {"id": "k_culture", "name": "K-CULTURE", "character": "민지"},
        ]
    }

class ChatRequest(BaseModel):
    message: str
    vertical: str
    user_name: str = "친구"
    conversation_history: list = []

@app.post("/chat")
def chat(request: ChatRequest):
    from app.services.ai_character import chat_with_character
    result = chat_with_character(
        message=request.message,
        vertical=request.vertical,
        user_name=request.user_name,
        conversation_history=request.conversation_history
    )
    return result

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    country: str = ""
    purpose: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(request: UserRegister):
    result = register_user(
        name=request.name,
        email=request.email,
        password=request.password
    )
    return result

@app.post("/login")
def login(request: UserLogin):
    result = login_user(
        email=request.email,
        password=request.password
    )
    return result