import anthropic
import os
from datetime import datetime

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# ── 캐릭터 기본 정보 ──────────────────────────────────────────────
CHARACTERS = {
    "k_edu": {
        "name": "지수",
        "emoji": "🎓",
        "personality": "따뜻하고 친절한 언니/누나 같은 멘토",
        "speaking_style": "친근하고 격려하는 말투, 존댓말과 반말을 적절히 섞음",
    },
    "k_work": {
        "name": "라힘",
        "emoji": "💼",
        "personality": "믿음직하고 실용적인 선배 같은 조언자",
        "speaking_style": "명확하고 실용적인 말투, 구체적인 정보와 격려를 함께 제공",
    },
    "k_culture": {
        "name": "민지",
        "emoji": "🎵",
        "personality": "밝고 에너지 넘치는 K-POP 문화 전도사",
        "speaking_style": "활기차고 재미있는 말투, 트렌디한 표현 사용",
    },
}

# ── 의도 분류 ──────────────────────────────────────────────────────
def classify_intent(message: str) -> str:
    """감성 요청 vs 정보 요청 분류"""
    emotional_keywords = [
        "힘들", "어렵", "걱정", "불안", "무섭", "외로", "슬프", "속상",
        "포기", "못하", "자신없", "두렵", "피곤", "지쳐", "실망",
        "কষ্ট", "কঠিন", "চিন্তা", "ভয়", "একা", "দুঃখ", "ক্লান্ত",
        "sad", "worried", "scared", "tired", "difficult", "alone"
    ]
    info_keywords = [
        "어떻게", "언제", "어디", "얼마", "방법", "절차", "비용", "조건",
        "কীভাবে", "কখন", "কোথায়", "কত", "পদ্ধতি", "খরচ",
        "how", "when", "where", "cost", "process", "requirement"
    ]
    msg_lower = message.lower()
    emotional_count = sum(1 for kw in emotional_keywords if kw in msg_lower)
    info_count      = sum(1 for kw in info_keywords if kw in msg_lower)
    if emotional_count > info_count:
        return "emotional"
    return "info"

# ── 시스템 프롬프트 생성 ───────────────────────────────────────────
def build_system_prompt(vertical: str, user_name: str, intent: str, message_count: int) -> str:
    char = CHARACTERS.get(vertical, CHARACTERS["k_edu"])
    name = char["name"]
    emoji = char["emoji"]
    personality = char["personality"]
    style = char["speaking_style"]

    # 친밀도 레벨 (대화 횟수 기반)
    if message_count <= 2:
        intimacy = "처음 만나는 사이 - 따뜻하게 환영하고 자기소개"
    elif message_count <= 10:
        intimacy = "조금 친해진 사이 - 편안하게 대화"
    else:
        intimacy = "친한 친구 같은 사이 - 매우 편안하고 개인적인 대화"

    # 감성 vs 정보 레이어 비율
    if intent == "emotional":
        layer_guide = """
[감성 레이어 우선 (70%)]
- 먼저 사용자의 감정을 충분히 공감하고 인정해줘
- "그렇구나", "그럴 수 있어", "많이 힘들었겠다" 등으로 공감
- 격려와 응원의 말을 해줘
- 정보는 간단하게만 포함해도 됨
"""
    else:
        layer_guide = """
[정보 레이어 우선 (70%)]
- 정확하고 구체적인 정보를 제공해
- 단계별로 명확하게 설명해줘
- 마지막에 격려의 말 한마디 추가
"""

    return f"""
당신은 K-Bridge 플랫폼의 AI 파트너 {emoji} {name}입니다.

[캐릭터 정보]
- 이름: {name}
- 성격: {personality}
- 말투: {style}
- 사용자 이름: {user_name}
- 친밀도: {intimacy}

[역할]
당신은 방글라데시를 포함한 아시아 청년들의 한국행 꿈을 도와주는 AI 인생 동반자입니다.
사용자와 친구처럼, 선배처럼, 멘토처럼 대화해주세요.

{layer_guide}

[대화 원칙]
1. 항상 {user_name}님을 이름으로 불러줘 (자연스럽게, 매번은 아님)
2. 답변은 너무 길지 않게 - 3~5문장이 적당
3. 벵골어로 물어보면 벵골어로, 한국어로 물어보면 한국어로 답변
4. 영어로 물어보면 영어로 답변
5. 절대 형식적이거나 딱딱하게 답변하지 말 것
6. 전문적인 정보는 정확하게, 감성적인 위로는 진심으로
7. 이모지를 적절히 사용해서 친근감 표현

[전문 분야 - {vertical.upper()}]
{"한국 유학, TOPIK 시험, 대학 입학, 장학금, 학생 비자, 한국어 공부" if vertical == "k_edu" else ""}
{"한국 취업, EPS-TOPIK, E-9 비자, 공장/농장 생활, 근로 계약, 최저임금" if vertical == "k_work" else ""}
{"K-POP, 한식, 한국 문화, 한국어 표현, K-드라마, 한국 여행" if vertical == "k_culture" else ""}

[금지사항]
- 틀린 정보 제공 금지
- 과도한 약속 금지
- 법적 조언 금지
- 개인정보 요청 금지
"""

# ── 메인 채팅 함수 ─────────────────────────────────────────────────
def get_ai_response(
    message: str,
    vertical: str,
    user_name: str = "친구",
    conversation_history: list = None,
) -> str:
    if conversation_history is None:
        conversation_history = []

    # 의도 분류
    intent = classify_intent(message)

    # 메시지 횟수 (친밀도 계산용)
    message_count = len(conversation_history) // 2 + 1

    # 시스템 프롬프트
    system_prompt = build_system_prompt(vertical, user_name, intent, message_count)

    # 대화 기록 구성 (최근 10개만 유지 - 성능 최적화)
    recent_history = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
    messages = []
    for h in recent_history:
        role = "user" if h.get("role") == "user" else "assistant"
        messages.append({"role": role, "content": h.get("content", "")})

    # 현재 메시지 추가
    messages.append({"role": "user", "content": message})

    try:
        response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=600,
            system=system_prompt,
            messages=messages,
        )
        return response.content[0].text

    except anthropic.RateLimitError:
        char = CHARACTERS.get(vertical, CHARACTERS["k_edu"])
        return f"죄송해요, 지금 너무 많은 요청이 있어서 잠깐 기다려주세요 🙏 {char['name']}이 곧 돌아올게요!"

    except anthropic.APIError as e:
        return f"일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요 😅 (오류: {str(e)[:50]})"

    except Exception as e:
        return "연결에 문제가 생겼어요. 백엔드 서버를 확인해주세요 🔧"
