import os
import anthropic

client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def orchestrate(
    message: str,
    vertical: str = "education",
    user_name: str = "사용자",
    conversation_history: list = []
) -> dict:
    intent = await classify_intent(message)
    if intent == "learning":
        response = await learning_agent(message, vertical, user_name)
    else:
        response = await conversation_agent(message, vertical, user_name, conversation_history)
    return {"response": response, "intent": intent}


async def classify_intent(message: str) -> str:
    response = await client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=10,
        messages=[{"role": "user", "content": f'다음 메시지 의도를 한 단어로: "{message}"\n(emotional/learning/info 중 하나)'}]
    )
    intent = response.content[0].text.strip().lower()
    if "learning" in intent:
        return "learning"
    return "emotional"


async def conversation_agent(message, vertical, user_name, history):
    characters = {
        "education": ("지수", "한국 유학을 돕는 따뜻한 언니"),
        "work": ("라힘", "한국 취업을 돕는 든든한 친구"),
        "culture": ("민지", "K-문화를 함께 즐기는 친구"),
    }
    name, persona = characters.get(vertical, characters["education"])
    messages = [{"role": h["role"], "content": h["content"]} for h in history[-6:]]
    messages.append({"role": "user", "content": message})
    response = await client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=300,
        system=f"당신은 {name}입니다. {persona}. {user_name}님을 이름으로 부르고 2~3문장으로 답하세요.",
        messages=messages
    )
    return response.content[0].text


async def learning_agent(message, vertical, user_name):
    response = await client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=400,
        system=f"한국어 학습 전문 AI입니다. {user_name}님의 학습을 돕습니다. 정확하고 친절하게 2~4문장으로 답하세요.",
        messages=[{"role": "user", "content": message}]
    )
    return response.content[0].text