from fastapi import FastAPI, HTTPException, Request
from fastapi import FastAPI, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import os
from dotenv import load_dotenv

from app.database import engine, Base
from app.services.ai_character import get_ai_response
from app.services.auth import register_user, login_user
from app.routers import conversations

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="K-Bridge API", version="1.3.0")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
    "http://localhost:3000",
    "https://www.k-bridge.ai",
    "https://k-bridge.ai",
    "https://kbridge-frontend.onrender.com",
],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router)

# ── 통계 저장소 ────────────────────────────────────────────────────
stats_store: dict = {}

def get_today() -> str:
    return date.today().isoformat()

def get_stats(email: str) -> dict:
    if email not in stats_store:
        stats_store[email] = {
            "chat_total":  0,
            "chat_today":  0,
            "chat_date":   get_today(),
            "topik_total": 0,
            "streak":      1,
            "last_login":  get_today(),
            "login_dates": [get_today()],
        }
    s = stats_store[email]
    if s["chat_date"] != get_today():
        s["chat_today"] = 0
        s["chat_date"]  = get_today()
    return s

# ── 요청 모델 ──────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    vertical: str
    user_name: Optional[str] = "친구"
    conversation_history: Optional[List[dict]] = []

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    country: Optional[str] = ""
    purpose: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class StatsUpdateRequest(BaseModel):
    user_email: str
    action: str

# ── 라우터 ─────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "K-Bridge 서버 작동중! 🚀", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "time": datetime.now().isoformat()}

@app.post("/chat")
@limiter.limit("30/minute")
async def chat(request: Request, req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="메시지가 비어있습니다.")
    response = get_ai_response(
        message=req.message,
        vertical=req.vertical,
        user_name=req.user_name or "친구",
        conversation_history=req.conversation_history or [],
    )
    return {"response": response, "vertical": req.vertical}

@app.post("/register")
async def register(req: UserRegister):
    result = register_user(
        name=req.name,
        email=req.email,
        password=req.password,
    )
    # result 를 그대로 반환 (기존 auth.py 형식 유지)
    if not result.get("success", True):
        raise HTTPException(status_code=400, detail=result.get("message", "회원가입 실패"))
    return result

@app.post("/login")
async def login(req: UserLogin):
    result = login_user(
        email=req.email,
        password=req.password,
    )
    # result 를 그대로 반환 (기존 auth.py 형식 유지)
    if not result.get("success", True):
        raise HTTPException(status_code=401, detail=result.get("message", "로그인 실패"))
    # 통계 업데이트
    try:
        s = get_stats(req.email)
        today = get_today()
        if today not in s["login_dates"]:
            s["login_dates"].append(today)
            s["streak"] = len(s["login_dates"])
        s["last_login"] = today
    except:
        pass
    return result

# ── 통계 API ───────────────────────────────────────────────────────
@app.post("/stats/update")
async def update_stats(req: StatsUpdateRequest):
    s = get_stats(req.user_email)
    if req.action == "chat":
        s["chat_total"] += 1
        s["chat_today"] += 1
    elif req.action == "topik":
        s["topik_total"] += 1
    return {"success": True, "stats": s}

@app.get("/stats/{email}")
async def get_user_stats(email: str):
    s = get_stats(email)
    return {
        "chat_total":       s["chat_total"],
        "chat_today":       s["chat_today"],
        "chat_limit_today": 10,
        "topik_total":      s["topik_total"],
        "vocab_memorized":  0,
        "streak":           s["streak"],
        "last_login":       s["last_login"],
    }

@app.get("/verticals")
def get_verticals():
    return {
        "verticals": [
            {"id": "k_edu",     "name": "K-EDU",     "character": "지수"},
            {"id": "k_work",    "name": "K-WORK",    "character": "라힘"},
            {"id": "k_culture", "name": "K-CULTURE", "character": "민지"},
        ]
    }
