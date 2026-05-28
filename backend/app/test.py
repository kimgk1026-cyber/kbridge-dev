import urllib.request
import json

url = 'http://127.0.0.1:8000/chat'
data = {
    'message': '안녕! 나 TOPIK 시험 준비하고 싶어',
    'vertical': 'k_edu',
    'user_name': '라힘'
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

res = urllib.request.urlopen(req)
result = json.loads(res.read())
print("AI 캐릭터 지수의 대답:")
print(result['response'])