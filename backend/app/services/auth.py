# 사용자 인증 서비스
import uuid
import hashlib
from datetime import datetime

# 임시 사용자 저장소 (나중에 PostgreSQL로 교체)
users_db = {}

def hash_password(password: str) -> str:
    """비밀번호 해시화"""
    return hashlib.sha256(password.encode()).hexdigest()

def register_user(name: str, email: str, password: str,
                  language: str = "bn", vertical: str = "k_edu") -> dict:
    """회원가입"""
    # 이미 가입된 이메일 확인
    if email in users_db:
        return {"success": False, "message": "이미 가입된 이메일입니다"}

    # 사용자 저장
    user_id = str(uuid.uuid4())
    users_db[email] = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": hash_password(password),
        "language": language,
        "vertical": vertical,
        "created_at": str(datetime.now()),
        "conversation_history": []
    }

    return {
        "success": True,
        "message": f"환영합니다, {name}님!",
        "user_id": user_id,
        "token": f"token_{user_id}"
    }

def login_user(email: str, password: str) -> dict:
    """로그인"""
    if email not in users_db:
        return {"success": False, "message": "가입되지 않은 이메일입니다"}

    user = users_db[email]
    if user["password"] != hash_password(password):
        return {"success": False, "message": "비밀번호가 틀렸습니다"}

    return {
        "success": True,
        "message": f"반갑습니다, {user['name']}님!",
        "user_id": user["id"],
        "name": user["name"],
        "language": user["language"],
        "vertical": user["vertical"],
        "token": f"token_{user['id']}"
    }

def save_conversation(email: str, message: str,
                      response: str, character: str):
    """대화 히스토리 저장"""
    if email in users_db:
        users_db[email]["conversation_history"].append({
            "user": message,
            "ai": response,
            "character": character,
            "timestamp": str(datetime.now())
        })

def get_conversation_history(email: str) -> list:
    """대화 히스토리 조회"""
    if email not in users_db:
        return []
    history = users_db[email]["conversation_history"]
    return [{"role": "user", "content": h["user"]} if i % 2 == 0
            else {"role": "assistant", "content": h["ai"]}
            for i, h in enumerate(history)]