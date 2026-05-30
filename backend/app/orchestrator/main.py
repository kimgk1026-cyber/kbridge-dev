import os
import anthropic
from typing import Optional

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def orchestrate(
    message: str,
    vertical: str = "education",
    user_name: str = "사용자",
    conversation_history: list = []
) -> dict:
    """
    사용자 입력을 분석해서 적절한 에이전트로 라우팅
    """

    # 1단계: 의도 분류
    intent = await classify_intent(message)

    # 2단계: 에이전트 라우팅
    if intent == "emotional":
        response = await conversation_agent(
            message, vertical, user_name, conversation_history
        )
    elif intent == "learning":
        response = await learning_agent(
            message, vertical, user_name
        )
    else:
        # 기본: 대화 에이전트
        response = await conversation_agent(
            message, vertical, user_name, conversation_history
        )

    return {
        "response": response,
        "intent": intent,
        "agent_used": intent
    }


async def classify_intent(message: str) -> str:
    """
    메시지 의도 분류:
    - emotional: 감성/공감 요청
    - learning: 학습 관련 요청
    - matching: 매칭 요청
    - info: 정보 요청
    """
    prompt = f"""다음 메시지의 의도를 분류하세요.
메시지: "{message}"

반드시 아래 중 하나만 답하세요:
- emotional (감정적 지원, 격려, 고민 상담)
- learning (한국어 학습, TOPIK, 문제 풀기)
- matching (대학, 취업, 장학금 연결)
- info (정보 요청, 질문)

의도:"""

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=10,
        messages=[{"role": "user", "content": prompt}]
    )

    intent = response.content[0].text.strip().lower()

    if "emotional" in intent:
        return "emotional"
    elif "learning" in intent:
        return "learning"
    elif "matching" in intent:
        return "matching"
    else:
        return "info"


async def conversation_agent(
    message: str,
    vertical: str,
    user_name: str,
    history: list
) -> str:
    """대화 에이전트 — 감성 70% + 정보 30%"""

    characters = {
        "education": {
            "name": "지수",
            "persona": "한국 유학을 도와주는 따뜻한 언니. 공감 먼저, 정보는 자연스럽게."
        },
        "work": {
            "name": "라힘",
            "persona": "한국 취업을 함께 준비하는 든든한 친구. 현실적이고 실용적."
        },
        "culture": {
            "name": "민지",
            "persona": "K-문화를 함께 즐기는 활발한 친구. 신나고 긍정적."
        }
    }

    char = characters.get(vertical, characters["education"])

    system_prompt = f"""당신은 {char['name']}입니다.
{char['persona']}

규칙:
1. 항상 {user_name}님을 이름으로 부르세요
2. 감성 70%, 정보 30% 비율로 답하세요
3. 2~3문장으로 간결하게
4. 벵골어로 질문하면 벵골어로 답하세요"""

    messages = []
    for h in history[-6:]:  # 최근 6개만
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=300,
        system=system_prompt,
        messages=messages
    )

    return response.content[0].text


async def learning_agent(
    message: str,
    vertical: str,
    user_name: str
) -> str:
    """학습 에이전트 — TOPIK/EPS 학습 지원"""

    system_prompt = f"""당신은 한국어 학습 전문 AI입니다.
{user_name}님의 한국어 학습을 돕습니다.

규칙:
1. 질문에 정확한 답 제공
2. 오답이면 왜 틀렸는지 친절히 설명
3. 다음 학습 방향 제안
4. 2~4문장으로 간결하게"""

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=400,
        system=system_prompt,
        messages=[{"role": "user", "content": message}]
    )

    return response.content[0].text