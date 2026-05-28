from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models.conversation import Conversation, Message

router = APIRouter(prefix="/conversations", tags=["conversations"])

class MessageSchema(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    user_email: str
    vertical: str
    character: str
    title: Optional[str] = None
    messages: List[MessageSchema] = []

class ConversationResponse(BaseModel):
    id: int
    user_email: str
    vertical: str
    character: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageSchema] = []
    class Config:
        from_attributes = True

class AddMessageRequest(BaseModel):
    role: str
    content: str

@router.post("/", response_model=ConversationResponse)
def create_conversation(data: ConversationCreate, db: Session = Depends(get_db)):
    title = data.title
    if not title:
        first_user = next((m.content for m in data.messages if m.role == "user"), None)
        title = first_user[:20] + "..." if first_user and len(first_user) > 20 else (first_user or "new chat")
    conv = Conversation(
        user_email=data.user_email,
        vertical=data.vertical,
        character=data.character,
        title=title,
    )
    db.add(conv)
    db.flush()
    for msg in data.messages:
        db.add(Message(
            conversation_id=conv.id,
            role=msg.role,
            content=msg.content,
        ))
    db.commit()
    db.refresh(conv)
    return conv

@router.get("/user/{email}", response_model=List[ConversationResponse])
def get_user_conversations(email: str, db: Session = Depends(get_db)):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_email == email)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
        .all()
    )
    return convs

@router.get("/{conv_id}", response_model=ConversationResponse)
def get_conversation(conv_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="not found")
    return conv

@router.post("/{conv_id}/messages", response_model=ConversationResponse)
def add_message(conv_id: int, req: AddMessageRequest, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="not found")
    db.add(Message(
        conversation_id=conv_id,
        role=req.role,
        content=req.content,
    ))
    conv.updated_at = datetime.now()
    db.commit()
    db.refresh(conv)
    return conv

@router.delete("/{conv_id}")
def delete_conversation(conv_id: int, db: Session = Depends(get_db)):
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="not found")
    db.delete(conv)
    db.commit()
    return {"message": "deleted"}