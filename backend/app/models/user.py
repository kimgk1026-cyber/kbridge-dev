# 사용자 데이터 모델
from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    """회원가입 요청 모델"""
    name: str
    email: str
    password: str
    language: str = "bn"        # 기본 언어: 벵골어
    vertical: str = "k_edu"     # 기본 버티컬: K-EDU

class UserLogin(BaseModel):
    """로그인 요청 모델"""
    email: str
    password: str

class UserResponse(BaseModel):
    """사용자 응답 모델"""
    id: str
    name: str
    email: str
    language: str
    vertical: str
    token: str