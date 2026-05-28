"""
models/conversation.py — 대화 기록 DB 모델
파일 위치: backend/app/models/conversation.py
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Conversation(Base):
    """대화 세션 (한 번의 대화 묶음)"""
    __tablename__ = "conversations"

    id         = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)           # 사용자 이메일
    vertical   = Column(String)                        # k_edu / k_work / k_culture
    character  = Column(String)                        # 지수 / 라힘 / 민지
    title      = Column(String, default="새 대화")     # 대화 제목 (첫 메시지로 자동 설정)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 이 대화에 속한 메시지들
    messages = relationship("Message", back_populates="conversation",
                            cascade="all, delete-orphan",
                            order_by="Message.id")


class Message(Base):
    """개별 메시지"""
    __tablename__ = "messages"

    id              = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role            = Column(String)    # "user" 또는 "assistant"
    content         = Column(Text)      # 메시지 내용
    created_at      = Column(DateTime, default=datetime.now)

    conversation = relationship("Conversation", back_populates="messages")
