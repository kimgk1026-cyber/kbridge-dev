'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lang  = 'ko' | 'bn' | 'en';
type Grade = 1 | 2 | 3 | 4;

// ─── 문제 데이터 (1~4급) ──────────────────────────────────────────
const QUESTIONS: Record<Grade, {
  id: number; question: string; options: string[];
  answer: number; explanation: string;
  translation: { bn: string; en: string };
}[]> = {
  1: [
    { id: 101, question: '( )에 알맞은 것을 고르세요.\n저는 학생( ) 아닙니다.', options: ['이', '가', '은', '을'], answer: 0, explanation: '받침 있는 명사 뒤에는 "이"를 써요. 학생+이 = "학생이"', translation: { bn: 'সঠিকটি বেছে নিন।\nআমি ছাত্র( ) নই।', en: 'Choose the correct answer.\nI am ( ) not a student.' } },
    { id: 102, question: '다음 중 인사말이 아닌 것은?', options: ['안녕하세요', '감사합니다', '사과', '반갑습니다'], answer: 2, explanation: '"사과"는 과일 이름이에요. 나머지는 모두 인사말이에요.', translation: { bn: 'কোনটি অভিবাদন নয়?', en: 'Which one is NOT a greeting?' } },
    { id: 103, question: '( )에 알맞은 것을 고르세요.\n오늘은 ( ) 날씨예요.', options: ['좋은', '좋으', '좋이', '좋'], answer: 0, explanation: '형용사 + 명사: "좋은 날씨" 형태가 맞아요.', translation: { bn: 'সঠিকটি বেছে নিন।\nআজ ( ) আবহাওয়া।', en: 'Choose: Today is ( ) weather.' } },
    { id: 104, question: '다음 중 숫자가 아닌 것은?', options: ['하나', '둘', '셋', '크다'], answer: 3, explanation: '"크다"는 "큰"이라는 형용사예요. 하나·둘·셋은 숫자예요.', translation: { bn: 'কোনটি সংখ্যা নয়?', en: 'Which is NOT a number?' } },
    { id: 105, question: '( )에 알맞은 것을 고르세요.\n저는 한국어를 ( ).', options: ['공부해요', '공부해', '공부합', '공부'], answer: 0, explanation: '정중한 말할 때는 "-아요/어요"를 써요.', translation: { bn: 'আমি কোরিয়ান ভাষা ( )।', en: 'I ( ) Korean language.' } },
    { id: 106, question: '다음 중 가족이 아닌 것은?', options: ['어머니', '아버지', '형', '친구'], answer: 3, explanation: '"친구"는 가족이 아니라 친구 관계예요.', translation: { bn: 'কোনটি পরিবার নয়?', en: 'Which is NOT family?' } },
    { id: 107, question: '시간을 나타내는 말이 아닌 것은?', options: ['오늘', '내일', '어제', '여기'], answer: 3, explanation: '"여기"는 장소를 나타내요. 오늘·내일·어제는 시간이에요.', translation: { bn: 'কোনটি সময় বোঝায় না?', en: 'Which does NOT represent time?' } },
    { id: 108, question: '( )에 알맞은 것을 고르세요.\n커피( ) 마시고 싶어요.', options: ['를', '이', '은', '의'], answer: 0, explanation: '목적어 뒤에 받침 없으면 "를"을 써요. 커피+를.', translation: { bn: 'কফি ( ) খেতে চাই।', en: 'I want to drink coffee ( ).' } },
    { id: 109, question: '반대 의미가 맞게 연결된 것은?', options: ['크다-작다', '좋다-좋다', '빠르다-빠르다', '많다-많다'], answer: 0, explanation: '"크다"의 반대는 "작다"예요.', translation: { bn: 'কোন বিপরীত শব্দ সঠিক?', en: 'Which antonym pair is correct?' } },
    { id: 110, question: '색깔이 아닌 것은?', options: ['빨간', '파란', '노란', '빠른'], answer: 3, explanation: '"빠른"은 속도를 나타내는 형용사예요. 나머지는 색깔이에요.', translation: { bn: 'কোনটি রঙ নয়?', en: 'Which is NOT a color?' } },
    { id: 111, question: '( )에 알맞은 것을 고르세요.\n저는 학교( ) 가요.', options: ['에', '이', '을', '의'], answer: 0, explanation: '장소 뒤에는 "에"를 써요. 학교+에 = "학교에".', translation: { bn: 'আমি স্কুল( ) যাই।', en: 'I go ( ) school.' } },
    { id: 112, question: '음식이 아닌 것은?', options: ['밥', '김치', '불고기', '책상'], answer: 3, explanation: '"책상"은 가구예요. 밥·김치·불고기는 음식이에요.', translation: { bn: 'কোনটি খাবার নয়?', en: 'Which is NOT food?' } },
    { id: 113, question: '다음 중 "안녕히 가세요"는 언제 써요?', options: ['상대가 떠날 때', '내가 떠날 때', '아침 인사', '밥 먹을 때'], answer: 0, explanation: '상대방이 떠날 때 "안녕히 가세요"라고 해요. 내가 떠날 때는 "안녕히 계세요".', translation: { bn: '"안녕히 가세요" কখন বলি?', en: 'When do you say "Annyeonghi gaseyo"?' } },
    { id: 114, question: '( )에 알맞은 것을 고르세요.\n이것은 제 ( )예요.', options: ['책', '책이', '책을', '책에'], answer: 0, explanation: '"이다" 앞에는 명사 원형을 써요. "제 책이에요"가 맞아요.', translation: { bn: 'এটা আমার ( )।', en: 'This is my ( ).' } },
    { id: 115, question: '날씨를 나타내는 말이 아닌 것은?', options: ['비가 와요', '눈이 와요', '맑아요', '배고파요'], answer: 3, explanation: '"배고파요"는 배고픔을 나타내요. 나머지는 날씨 표현이에요.', translation: { bn: 'কোনটি আবহাওয়া বোঝায় না?', en: 'Which does NOT describe weather?' } },
    { id: 116, question: '직업이 아닌 것은?', options: ['선생님', '의사', '학생', '아파트'], answer: 3, explanation: '"아파트"는 건물이에요. 선생님·의사·학생은 직업이에요.', translation: { bn: 'কোনটি পেশা নয়?', en: 'Which is NOT an occupation?' } },
    { id: 117, question: '( )에 알맞은 것을 고르세요.\n저는 밥을 ( ).', options: ['먹어요', '먹으', '먹이', '먹'], answer: 0, explanation: '현재 시제 정중형은 "먹어요"예요.', translation: { bn: 'আমি ভাত ( )।', en: 'I ( ) rice.' } },
    { id: 118, question: '장소가 아닌 것은?', options: ['학교', '병원', '식당', '예쁘다'], answer: 3, explanation: '"예쁘다"는 형용사예요. 학교·병원·식당은 장소예요.', translation: { bn: 'কোনটি স্থান নয়?', en: 'Which is NOT a place?' } },
    { id: 119, question: '다음 중 "몇 시예요?"의 대답으로 알맞은 것은?', options: ['세 시예요', '월요일이에요', '서울이에요', '학생이에요'], answer: 0, explanation: '"몇 시예요?"는 시간을 물어보는 말이에요.', translation: { bn: '"몇 시예요?" এর সঠিক উত্তর কোনটি?', en: 'What is the correct answer to "What time is it?"' } },
    { id: 120, question: '( )에 알맞은 것을 고르세요.\n내일 ( ) 만나요.', options: ['같이', '같으', '같이를', '같이가'], answer: 0, explanation: '"같이"는 "함께"의 뜻으로 부사예요.', translation: { bn: 'আগামীকাল ( ) দেখা করি।', en: 'Let\'s meet ( ) tomorrow.' } },
  ],
  2: [
    { id: 201, question: '밑줄 친 부분과 의미가 같은 것은?\n"저는 한국어를 공부해요."', options: ['배워요', '가르쳐요', '읽어요', '써요'], answer: 0, explanation: '"공부하다"와 "배우다"는 비슷한 의미예요.', translation: { bn: 'নিচে রেখা টানা অংশের সমার্থক কোনটি?\n"আমি কোরিয়ান পড়াশোনা করি।"', en: 'What has the same meaning as the underlined part?' } },
    { id: 202, question: '( )에 알맞은 것을 고르세요.\n오늘 날씨가 ( ) 좋네요.', options: ['정말', '그런데', '하지만', '왜냐하면'], answer: 0, explanation: '"정말"은 강조 부사예요. "정말 좋네요".', translation: { bn: 'আজ আবহাওয়া ( ) ভালো।', en: 'Today\'s weather is ( ) good.' } },
    { id: 203, question: '다음 중 올바른 문장은?', options: ['저는 어제 영화를 봤어요.', '저는 어제 영화를 봐요.', '저는 어제 영화를 볼 거예요.', '저는 어제 영화를 보고 있어요.'], answer: 0, explanation: '"어제"는 과거이므로 과거형 "-았/었-"을 써요.', translation: { bn: 'কোন বাক্যটি সঠিক?', en: 'Which sentence is correct?' } },
    { id: 204, question: '( )에 알맞은 것을 고르세요.\n피곤해서 일찍 ( ).', options: ['잤어요', '자요', '잘 거예요', '자고 있어요'], answer: 0, explanation: '"피곤해서"는 이유, 그 결과 과거에 잠든 것이에요.', translation: { bn: 'ক্লান্ত থাকায় তাড়াতাড়ি ( )।', en: 'I ( ) early because I was tired.' } },
    { id: 205, question: '틀린 문장을 고르세요.', options: ['저는 사과를 먹었어요.', '어제 비가 왔어요.', '내일 학교에 갈 거예요.', '저는 지금 어제 가요.'], answer: 3, explanation: '"지금"과 "어제"는 함께 쓸 수 없어요.', translation: { bn: 'কোন বাক্যটি ভুল?', en: 'Which sentence is WRONG?' } },
    { id: 206, question: '( )에 알맞은 것을 고르세요.\n한국어가 어렵지만 ( ) 재미있어요.', options: ['그래도', '그래서', '그리고', '그러면'], answer: 0, explanation: '앞 내용과 반대되는 내용을 연결할 때 "그래도"를 써요.', translation: { bn: 'কোরিয়ান কঠিন কিন্তু ( ) মজার।', en: 'Korean is hard but ( ) interesting.' } },
    { id: 207, question: '다음 중 "-(으)ㄹ 것 같다"의 쓰임이 맞는 것은?', options: ['내일 비가 올 것 같아요.', '어제 비가 올 것 같아요.', '지금 비가 올 것 같았어요.', '항상 비가 올 것 같았어요.'], answer: 0, explanation: '"-(으)ㄹ 것 같다"는 미래에 대한 추측이에요.', translation: { bn: 'কোনটিতে "-(으)ㄹ 것 같다" সঠিকভাবে ব্যবহার হয়েছে?', en: 'Which uses "-(eu)l geot gatda" correctly?' } },
    { id: 208, question: '( )에 알맞은 것을 고르세요.\n더 빨리 갈 수 있도록 ( ) 주세요.', options: ['도와', '도움', '도우', '도왔'], answer: 0, explanation: '"도와주세요" = "도와" + "주세요". 돕다의 활용형이에요.', translation: { bn: 'আরও দ্রুত যেতে পারব তাই ( ) দিন।', en: 'Please ( ) me so I can go faster.' } },
    { id: 209, question: '다음 중 의문문이 아닌 것은?', options: ['밥 먹었어요?', '어디 가요?', '정말 예쁘네요.', '이름이 뭐예요?'], answer: 2, explanation: '"정말 예쁘네요."는 감탄문이에요.', translation: { bn: 'কোনটি প্রশ্নবাক্য নয়?', en: 'Which is NOT a question?' } },
    { id: 210, question: '( )에 알맞은 것을 고르세요.\n오늘 시간이 없어서 내일 ( ).', options: ['할게요', '했어요', '하고 있어요', '했겠어요'], answer: 0, explanation: '미래 약속이므로 "-ㄹ게요"를 써요.', translation: { bn: 'আজ সময় নেই তাই কাল ( )।', en: 'I don\'t have time today so I\'ll do it tomorrow ( ).' } },
    { id: 211, question: '다음 중 "-(으)면서"의 쓰임이 맞는 것은?', options: ['음악을 들으면서 공부해요.', '어제 들으면서 갔어요.', '내일 들으면서 갈 것 같아요.', '들으면서 잘 것 같았어요.'], answer: 0, explanation: '"-(으)면서"는 두 동작이 동시에 일어날 때 써요.', translation: { bn: '"-（으）면서" সঠিকভাবে ব্যবহার হয়েছে কোথায়?', en: 'Which correctly uses "-(eu)myeonseo"?' } },
    { id: 212, question: '( )에 알맞은 것을 고르세요.\n한국에 ( ) 지 3년이 됐어요.', options: ['온', '오는', '올', '왔'], answer: 0, explanation: '"온 지 3년이 됐다" = 한국에 온 것이 3년이 되었다.', translation: { bn: 'কোরিয়ায় ( ) ৩ বছর হয়ে গেল।', en: 'It\'s been 3 years since I ( ) to Korea.' } },
    { id: 213, question: '다음 중 가장 자연스러운 문장은?', options: ['친구를 만나서 기분이 좋았어요.', '친구를 만나지만 기분이 좋았어요.', '친구를 만나도 기분이 좋았어요.', '친구를 만나거나 기분이 좋았어요.'], answer: 0, explanation: '이유를 나타낼 때 "-아서/어서"를 써요.', translation: { bn: 'সবচেয়ে স্বাভাবিক বাক্য কোনটি?', en: 'Which sentence is most natural?' } },
    { id: 214, question: '( )에 알맞은 것을 고르세요.\n배가 ( ) 밥을 더 먹고 싶어요.', options: ['고파서', '고프지만', '고프면', '고파도'], answer: 0, explanation: '배고픔이 원인이므로 "-아서/어서"를 써요.', translation: { bn: 'পেট ( ) আরও ভাত খেতে চাই।', en: 'I\'m ( ) hungry so I want to eat more.' } },
    { id: 215, question: '다음 중 "-는 것"의 쓰임이 맞는 것은?', options: ['한국어를 배우는 것이 즐거워요.', '어제 배우는 것을 했어요.', '지금 배우는 것을 했어요.', '내일 배우는 것이 했어요.'], answer: 0, explanation: '"-는 것"은 동사를 명사화할 때 써요.', translation: { bn: '"-는 것" সঠিকভাবে ব্যবহার হয়েছে কোথায়?', en: 'Which correctly uses "-neun geot"?' } },
    { id: 216, question: '( )에 알맞은 것을 고르세요.\n이 책은 읽기가 ( ).', options: ['쉬워요', '쉬우요', '쉽어요', '쉽요'], answer: 0, explanation: '"쉽다"의 활용: 쉽 + 어요 → 쉬워요 (ㅂ 불규칙).', translation: { bn: 'এই বইটি পড়তে ( )।', en: 'This book is ( ) to read.' } },
    { id: 217, question: '다음 중 조건을 나타내는 것은?', options: ['비가 오면 집에 있을게요.', '비가 와서 집에 있을게요.', '비가 오지만 집에 있을게요.', '비가 오고 집에 있을게요.'], answer: 0, explanation: '"-면"은 조건을 나타내요.', translation: { bn: 'কোনটি শর্ত বোঝায়?', en: 'Which expresses a condition?' } },
    { id: 218, question: '( )에 알맞은 것을 고르세요.\n길을 잘 몰라서 ( ) 봤어요.', options: ['물어', '물으', '물', '물었'], answer: 0, explanation: '"물어보다" = "물어" + "보다". 물다의 활용형이에요.', translation: { bn: 'রাস্তা না জানায় ( ) দেখলাম।', en: 'I didn\'t know the way so I ( ) asked.' } },
    { id: 219, question: '다음 중 "-기 위해서"의 쓰임이 맞는 것은?', options: ['한국어를 배우기 위해서 열심히 공부해요.', '어제 배우기 위해서 공부했어요.', '지금 배우기 위해서 공부하고 있었어요.', '내일 배웠기 위해서 공부할 거예요.'], answer: 0, explanation: '"-기 위해서"는 목적을 나타낼 때 써요.', translation: { bn: '"-기 위해서" সঠিকভাবে ব্যবহার হয়েছে কোথায়?', en: 'Which correctly uses "-gi wihaeseo"?' } },
    { id: 220, question: '( )에 알맞은 것을 고르세요.\n날씨가 추운데 ( ) 입으세요.', options: ['따뜻하게', '따뜻한', '따뜻하고', '따뜻하면'], answer: 0, explanation: '부사형 "-게"를 써서 "따뜻하게 입다"가 맞아요.', translation: { bn: 'ঠান্ডা আবহাওয়ায় ( ) পড়ুন।', en: 'It\'s cold so wear ( ) clothes.' } },
  ],
  3: [
    { id: 301, question: '( )에 알맞은 것을 고르세요.\n그 영화는 보는 ( ) 눈물이 났어요.', options: ['내내', '동안', '이후', '전에'], answer: 1, explanation: '"-는 동안"은 지속 시간을 나타내요.', translation: { bn: 'সেই সিনেমা দেখার ( ) চোখে জল এসে গেল।', en: 'Tears came ( ) watching that movie.' } },
    { id: 302, question: '밑줄 친 표현과 반대 의미는?\n"그 사람은 성격이 외향적이에요."', options: ['내향적', '적극적', '긍정적', '창의적'], answer: 0, explanation: '"외향적"의 반대는 "내향적"이에요.', translation: { bn: '밑줄 친 표현의বিপরীত অর্থ কী?\n"সেই ব্যক্তি বহির্মুখী স্বভাবের।"', en: 'What is the opposite of the underlined expression?' } },
    { id: 303, question: '다음 중 문법이 올바른 것은?', options: ['제가 도움이 됐으면 좋겠어요.', '제가 도움이 되었으면 좋겠어요.', '제가 도움이 됐으면 좋겠어요.', '위 모두 맞음'], answer: 3, explanation: '세 가지 모두 올바른 표현이에요. 됐어요 = 되었어요 (줄임말)', translation: { bn: 'কোন বাক্যটি ব্যাকরণিকভাবে সঠিক?', en: 'Which sentence is grammatically correct?' } },
    { id: 304, question: '( )에 알맞은 것을 고르세요.\n이 일은 혼자 하기에는 ( ) 어렵습니다.', options: ['너무', '매우', '아주', '위 모두 가능'], answer: 3, explanation: '"너무/매우/아주" 모두 "어렵다"를 강조할 때 쓸 수 있어요.', translation: { bn: 'এই কাজটি একা করা ( ) কঠিন।', en: 'This work is ( ) hard to do alone.' } },
    { id: 305, question: '다음 중 "-는 바람에"의 쓰임이 맞는 것은?', options: ['버스가 늦는 바람에 지각했어요.', '공부를 열심히 하는 바람에 합격했어요.', '비가 오는 바람에 소풍이 취소됐어요.', '①과 ③이 맞음'], answer: 3, explanation: '"-는 바람에"는 부정적인 결과를 일으키는 원인에 써요.', translation: { bn: '"-는 바람에" সঠিকভাবে ব্যবহার হয়েছে কোথায়?', en: 'Which correctly uses "-neun barame"?' } },
    { id: 306, question: '( )에 알맞은 것을 고르세요.\n건강을 위해 운동을 ( ) 합니다.', options: ['꾸준히', '느긋하게', '급하게', '무겁게'], answer: 0, explanation: '건강을 위해서는 "꾸준히" 운동하는 것이 좋아요.', translation: { bn: 'স্বাস্থ্যের জন্য ( ) ব্যায়াম করি।', en: 'I ( ) exercise for my health.' } },
    { id: 307, question: '다음 중 높임말이 올바른 것은?', options: ['선생님이 말씀하셨어요.', '선생님이 말했어요.', '선생님이 말하셨어요.', '①과 ③이 맞음'], answer: 3, explanation: '"말씀하시다"와 "말하시다" 모두 존댓말이에요.', translation: { bn: 'কোন সম্মানজনক ভাষা সঠিক?', en: 'Which honorific expression is correct?' } },
    { id: 308, question: '( )에 알맞은 것을 고르세요.\n그 소식을 들었을 때 얼마나 놀랐( )!', options: ['는지', '던지', '는가', '던가'], answer: 0, explanation: '감탄을 나타낼 때 "얼마나 ~는지!"를 써요.', translation: { bn: 'সেই খবর শুনে কতটা অবাক হয়েছিলাম ( )!', en: 'How surprised I was when I heard that news ( )!' } },
    { id: 309, question: '다음 중 관용 표현의 의미가 맞는 것은?', options: ['"발이 넓다" = 아는 사람이 많다', '"발이 넓다" = 발 크기가 크다', '"발이 넓다" = 걷기를 잘한다', '"발이 넓다" = 빨리 달린다'], answer: 0, explanation: '"발이 넓다"는 인맥이 넓다는 뜻의 관용 표현이에요.', translation: { bn: 'কোন প্রবাদের অর্থ সঠিক?', en: 'Which idiom meaning is correct?' } },
    { id: 310, question: '( )에 알맞은 것을 고르세요.\n아무리 ( ) 할 수 없는 일도 있어요.', options: ['노력해도', '노력하면', '노력해서', '노력하고'], answer: 0, explanation: '"아무리 ~아도/어도"는 조건과 무관함을 나타내요.', translation: { bn: 'যতই ( ) কিছু কাজ করা যায় না।', en: 'No matter how ( ) there are things you can\'t do.' } },
    { id: 311, question: '다음 중 맞춤법이 올바른 것은?', options: ['되요 / 돼요', '돼요 / 되요', '돼요만 맞음', '되요만 맞음'], answer: 2, explanation: '"되다"의 활용: "돼요" (O), "되요" (X). "되어요"의 줄임말이 "돼요"예요.', translation: { bn: 'কোন বানান সঠিক?', en: 'Which spelling is correct?' } },
    { id: 312, question: '( )에 알맞은 것을 고르세요.\n이 약은 식사 ( ) 복용하세요.', options: ['후에', '전에', '중에', '위의 모두 가능'], answer: 3, explanation: '약의 복용 시기는 약에 따라 식사 전/후/중에 다를 수 있어요.', translation: { bn: 'এই ওষুধ খাওয়ার ( ) খান।', en: 'Take this medicine ( ) meals.' } },
    { id: 313, question: '다음 관용표현 중 의미가 다른 하나는?', options: ['입이 무겁다', '말이 없다', '과묵하다', '말이 많다'], answer: 3, explanation: '"말이 많다"는 나머지와 반대 의미예요.', translation: { bn: 'কোন প্রবাদটির অর্থ আলাদা?', en: 'Which idiom has a different meaning?' } },
    { id: 314, question: '( )에 알맞은 것을 고르세요.\n제 꿈은 의사가 ( )예요.', options: ['되는 것', '된 것', '되는', '됐'], answer: 0, explanation: '"꿈은 ~가 되는 것이다" 형태가 자연스러워요.', translation: { bn: 'আমার স্বপ্ন ডাক্তার ( )।', en: 'My dream is ( ) become a doctor.' } },
    { id: 315, question: '다음 중 피동 표현이 올바른 것은?', options: ['문이 열렸어요.', '문이 열었어요.', '문을 열렸어요.', '문을 열었어요.'], answer: 0, explanation: '피동은 "문이 열리다" → "문이 열렸어요"가 맞아요.', translation: { bn: 'কোন passive expression সঠিক?', en: 'Which passive expression is correct?' } },
  ],
  4: [
    { id: 401, question: '( )에 알맞은 것을 고르세요.\n그는 약속을 ( ) 않고 떠났다.', options: ['지키지', '지킨', '지키고', '지켜'], answer: 0, explanation: '"지키지 않다" = 약속을 이행하지 않다.', translation: { bn: 'সে প্রতিশ্রুতি ( ) চলে গেল।', en: 'He left without ( ) his promise.' } },
    { id: 402, question: '다음 문장의 주제로 알맞은 것은?\n"현대 사회에서 사람들은 빠른 생활 속에서 자신을 돌보지 못하는 경우가 많다."', options: ['현대인의 자기 관리 부족', '기술 발전의 속도', '바쁜 일상의 즐거움', '현대 기술의 문제점'], answer: 0, explanation: '빠른 생활로 자신을 돌보지 못한다는 내용이에요.', translation: { bn: 'নিচের বাক্যের মূল বিষয় কী?', en: 'What is the main theme of the sentence?' } },
    { id: 403, question: '( )에 알맞은 접속사를 고르세요.\n그는 열심히 공부했다. ( ) 시험에 떨어졌다.', options: ['그러나', '그래서', '그리고', '그러면'], answer: 0, explanation: '앞과 반대되는 결과이므로 "그러나"가 맞아요.', translation: { bn: 'সঠিক সংযোগকারী শব্দ বেছে নিন।', en: 'Choose the correct conjunction.' } },
    { id: 404, question: '다음 중 문맥상 어색한 표현은?', options: ['그는 말을 조심스럽게 꺼냈다.', '그녀는 감사한 마음을 숨겼다.', '그 일은 생각보다 간단했다.', '그녀는 웃으면서 슬퍼했다.'], answer: 3, explanation: '"웃으면서 슬퍼했다"는 상황상 어색한 표현이에요.', translation: { bn: 'প্রসঙ্গে কোন প্রকাশটি অস্বাভাবিক?', en: 'Which expression is awkward in context?' } },
    { id: 405, question: '( )에 알맞은 것을 고르세요.\n그 결정은 모두에게 ( ) 결과를 가져왔다.', options: ['예상치 못한', '예상한', '예상해야 할', '예상하는'], answer: 0, explanation: '의외의 결과를 나타낼 때 "예상치 못한"을 써요.', translation: { bn: 'সেই সিদ্ধান্ত সবার জন্য ( ) ফলাফল এনেছিল।', en: 'That decision brought ( ) results for everyone.' } },
    { id: 406, question: '다음 문장에서 밑줄 친 부분의 역할은?\n"그가 성공한 것은 노력 덕분이다."', options: ['주어', '목적어', '서술어', '부사어'], answer: 0, explanation: '"그가 성공한 것은"이 주어 역할을 해요.', translation: { bn: 'নিচের বাক্যে밑줄 친 অংশের ভূমিকা কী?', en: 'What role does the underlined part play?' } },
    { id: 407, question: '( )에 알맞은 것을 고르세요.\n사회가 발전할( ) 새로운 문제도 생긴다.', options: ['수록', '때문에', '지만', '면서'], answer: 0, explanation: '"-ㄹ수록"은 정도가 더할수록의 뜻이에요.', translation: { bn: 'সমাজ যত উন্নত হয় ( ) নতুন সমস্যাও তৈরি হয়।', en: 'As society develops ( ) new problems arise.' } },
    { id: 408, question: '다음 글의 주된 내용으로 맞는 것은?\n"독서는 단순히 정보를 얻는 것 이상의 가치가 있다. 독서를 통해 우리는 다양한 관점을 이해하고 공감 능력을 키울 수 있다."', options: ['독서의 다양한 가치', '독서의 정보 제공 기능', '독서량을 늘리는 방법', '공감 능력의 중요성'], answer: 0, explanation: '독서가 정보 이상의 가치, 즉 다양한 관점과 공감 능력을 준다는 내용이에요.', translation: { bn: 'নিচের লেখার মূল বিষয় কী?', en: 'What is the main content of the passage?' } },
    { id: 409, question: '( )에 알맞은 것을 고르세요.\n아무리 바빠도 건강만큼은 ( ).', options: ['챙겨야 한다', '챙기면 된다', '챙길 수 없다', '챙기지 않아도 된다'], answer: 0, explanation: '건강을 반드시 챙겨야 한다는 의미가 문맥상 맞아요.', translation: { bn: 'যতই ব্যস্ত থাক স্বাস্থ্য ( )।', en: 'No matter how busy, health ( ).' } },
    { id: 410, question: '다음 중 글의 구조가 바른 것은?', options: ['주장-근거-결론', '결론-주장-근거', '근거-결론-주장', '주장-결론-근거'], answer: 0, explanation: '논리적 글쓰기의 기본 구조는 "주장-근거-결론"이에요.', translation: { bn: 'কোন লেখার কাঠামো সঠিক?', en: 'Which writing structure is correct?' } },
    { id: 411, question: '( )에 알맞은 것을 고르세요.\n그의 말은 ( ) 들을 필요가 없다.', options: ['귀 기울여', '귀 기울이고', '귀를 기울이고', '①과 ③ 모두'], answer: 3, explanation: '"귀 기울여 듣다"와 "귀를 기울이고 듣다" 모두 맞아요.', translation: { bn: 'তার কথায় ( ) শোনার দরকার নেই।', en: 'There\'s no need to ( ) to his words.' } },
    { id: 412, question: '다음 문장의 빈칸에 가장 알맞은 것은?\n"기후 변화는 ( ) 전 세계가 함께 해결해야 할 문제다."', options: ['한 국가만이 아니라', '우리나라만의', '선진국만의', '아시아만의'], answer: 0, explanation: '"전 세계가 함께"와 호응하는 표현은 "한 국가만이 아니라"예요.', translation: { bn: 'জলবায়ু পরিবর্তন ( ) সমগ্র বিশ্বকে একসাথে সমাধান করতে হবে।', en: 'Climate change is a problem that ( ) the whole world must solve together.' } },
    { id: 413, question: '( )에 알맞은 것을 고르세요.\n이 문제는 단순히 ( ) 것이 아니다.', options: ['보이는', '보이', '보인', '보이는데'], answer: 0, explanation: '"-는 것이 아니다"는 부정과 강조를 나타내는 구조예요.', translation: { bn: 'এই সমস্যা শুধু ( ) বিষয় নয়।', en: 'This problem is not simply ( ) thing.' } },
    { id: 414, question: '다음 중 글의 목적이 다른 하나는?', options: ['광고문', '설명문', '편지', '일기'], answer: 0, explanation: '"광고문"은 설득/홍보가 목적이고, 나머지는 정보 전달/기록이에요.', translation: { bn: 'কোন লেখার উদ্দেশ্য আলাদা?', en: 'Which has a different writing purpose?' } },
    { id: 415, question: '( )에 알맞은 것을 고르세요.\n그 정책은 시민들의 ( ) 만들어졌다.', options: ['의견을 반영하여', '의견을 반영하고', '의견이 반영하여', '의견을 반영'], answer: 0, explanation: '"-을/를 반영하여"가 문법적으로 자연스러운 표현이에요.', translation: { bn: 'সেই নীতি নাগরিকদের মতামত ( ) তৈরি হয়েছে।', en: 'That policy was made ( ) citizens\' opinions.' } },
  ],
};

// ─── UI 텍스트 ──────────────────────────────────────────────────────
const UI: Record<Lang, Record<string, string>> = {
  ko: { title: 'TOPIK 문제 풀기', selectGrade: '급수 선택', question: '문제', next: '다음', result: '결과 보기', retry: '다시 풀기', correct: '정답!', wrong: '오답', score: '점수', explanation: '해설', home: '홈으로', diagnosis: '수준 진단', curriculum: '내 커리큘럼', grade: '급', totalQ: '문제 수', translation: '번역 보기' },
  bn: { title: 'TOPIK অনুশীলন', selectGrade: 'স্তর নির্বাচন', question: 'প্রশ্ন', next: 'পরবর্তী', result: 'ফলাফল দেখুন', retry: 'আবার চেষ্টা', correct: 'সঠিক!', wrong: 'ভুল', score: 'স্কোর', explanation: 'ব্যাখ্যা', home: 'হোম', diagnosis: 'স্তর নির্ণয়', curriculum: 'আমার পাঠ্যক্রম', grade: 'গ্রেড', totalQ: 'প্রশ্ন সংখ্যা', translation: 'অনুবাদ দেখুন' },
  en: { title: 'TOPIK Practice', selectGrade: 'Select Grade', question: 'Question', next: 'Next', result: 'See Result', retry: 'Try Again', correct: 'Correct!', wrong: 'Wrong', score: 'Score', explanation: 'Explanation', home: 'Home', diagnosis: 'Level Test', curriculum: 'My Curriculum', grade: 'Grade', totalQ: 'Questions', translation: 'Show Translation' },
};

const GRADE_INFO: Record<Grade, { color: string; label: Record<Lang, string> }> = {
  1: { color: '#10B981', label: { ko: '1급 (입문)', bn: '১ম গ্রেড (প্রাথমিক)', en: 'Grade 1 (Beginner)' } },
  2: { color: '#0891B2', label: { ko: '2급 (초급)', bn: '২য় গ্রেড (প্রাথমিক+)', en: 'Grade 2 (Elementary)' } },
  3: { color: '#F59E0B', label: { ko: '3급 (중급)', bn: '৩য় গ্রেড (মধ্যবর্তী)', en: 'Grade 3 (Intermediate)' } },
  4: { color: '#EF4444', label: { ko: '4급 (중급+)', bn: '৪র্থ গ্রেড (মধ্যবর্তী+)', en: 'Grade 4 (Intermediate+)' } },
};

export default function TopikPage() {
  const router = useRouter();
  const [lang,        setLang]        = useState<Lang>('bn');
  const [grade,       setGrade]       = useState<Grade | null>(null);
  const [current,     setCurrent]     = useState(0);
  const [selected,    setSelected]    = useState<number | null>(null);
  const [answered,    setAnswered]    = useState(false);
  const [score,       setScore]       = useState(0);
  const [done,        setDone]        = useState(false);
  const [wrongList,   setWrongList]   = useState<number[]>([]);
  const [showTrans,   setShowTrans]   = useState(false);
  const [savedGrade,  setSavedGrade]  = useState<number | null>(null);

  useEffect(() => {
    try {
      const g = localStorage.getItem('topik_grade');
      if (g) setSavedGrade(parseInt(g));
    } catch {}
  }, []);

  const t = UI[lang];
  const questions = grade ? QUESTIONS[grade] : [];
  const q = questions[current];
  const gc = grade ? GRADE_INFO[grade] : null;

  const handleSelect = (idx: number) => {
    if (answered || !q) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.answer) setScore(s => s + 1);
    else setWrongList(prev => [...prev, q.id]);
    setShowTrans(false);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
    setShowTrans(false);
  };

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setAnswered(false);
    setScore(0); setDone(false); setWrongList([]);
  };

  const handleGradeSelect = (g: Grade) => {
    setGrade(g); setCurrent(0); setSelected(null);
    setAnswered(false); setScore(0); setDone(false); setWrongList([]);
  };

  const pct = grade ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${gc?.color || '#10B981'}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => grade ? setGrade(null) : router.push('/')} style={{ background: 'none', border: 'none', color: gc?.color || '#10B981', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← {grade ? t.selectGrade : 'K-BRIDGE'}
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>📝 {t.title}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? '#10B981' : 'transparent',
              border: '1px solid #10B981', borderRadius: 4,
              color: lang === l ? '#000' : '#10B981',
              padding: '3px 7px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 급수 선택 화면 */}
        {!grade && (
          <>
            {/* 수준 진단 + 커리큘럼 바로가기 */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button type="button" onClick={() => router.push('/diagnosis')} style={{
                flex: 1, background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981',
                borderRadius: 12, padding: '14px 10px', color: '#10B981',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                🎯 {t.diagnosis}
                {savedGrade && <div style={{ color: '#BAE6FD', fontSize: 11, marginTop: 4 }}>현재 {savedGrade}급 추천</div>}
              </button>
              <button type="button" onClick={() => router.push('/curriculum')} style={{
                flex: 1, background: 'rgba(8,145,178,0.1)', border: '1px solid #0891B2',
                borderRadius: 12, padding: '14px 10px', color: '#0891B2',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                📚 {t.curriculum}
              </button>
            </div>

            <div style={{ color: '#BAE6FD', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
              {t.selectGrade}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {([1, 2, 3, 4] as Grade[]).map(g => {
                const gi = GRADE_INFO[g];
                const isRecommended = savedGrade === g;
                return (
                  <button key={g} type="button" onClick={() => handleGradeSelect(g)} style={{
                    background: isRecommended ? `${gi.color}18` : '#071336',
                    border: `2px solid ${isRecommended ? gi.color : gi.color + '44'}`,
                    borderRadius: 14, padding: '16px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: gi.color, fontWeight: 700, fontSize: 16 }}>
                        {gi.label[lang]}
                        {isRecommended && <span style={{ background: gi.color, color: '#000', fontSize: 10, padding: '1px 6px', borderRadius: 99, marginLeft: 8 }}>추천</span>}
                      </div>
                      <div style={{ color: '#64748B', fontSize: 12, marginTop: 3 }}>
                        {QUESTIONS[g].length}{t.totalQ}
                      </div>
                    </div>
                    <div style={{ color: gi.color, fontSize: 24 }}>→</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* 결과 화면 */}
        {grade && done && gc && (
          <div style={{ textAlign: 'center', paddingTop: 10 }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>
              {pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}
            </div>
            <div style={{ color: gc.color, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {gc.label[lang]}
            </div>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {t.score}: {score} / {questions.length}
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444', marginBottom: 24 }}>
              {pct}점
            </div>

            {wrongList.length > 0 && (
              <div style={{ background: '#071336', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                <div style={{ color: '#EF4444', fontWeight: 700, marginBottom: 12 }}>❌ 틀린 문제 해설</div>
                {questions.filter(q => wrongList.includes(q.id)).map(q => (
                  <div key={q.id} style={{ marginBottom: 14, borderBottom: '1px solid #1E293B', paddingBottom: 14 }}>
                    <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6, whiteSpace: 'pre-line' }}>{q.question}</div>
                    <div style={{ color: '#10B981', fontSize: 12 }}>✅ 정답: {q.options[q.answer]}</div>
                    <div style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>{q.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleRetry} style={{ flex: 1, background: gc.color, border: 'none', borderRadius: 12, padding: 14, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                🔄 {t.retry}
              </button>
              <button type="button" onClick={() => router.push('/')} style={{ flex: 1, background: '#1E293B', border: 'none', borderRadius: 12, padding: 14, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                🏠 {t.home}
              </button>
            </div>
            <button type="button" onClick={() => setGrade(null)} style={{ width: '100%', background: 'transparent', border: '1px solid #334155', borderRadius: 12, padding: 12, color: '#BAE6FD', fontSize: 13, cursor: 'pointer', marginTop: 10, fontFamily: 'Arial, sans-serif' }}>
              다른 급수 선택
            </button>
          </div>
        )}

        {/* 문제 풀기 화면 */}
        {grade && !done && q && gc && (
          <>
            {/* 진행 바 */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>{t.question} {current + 1} / {questions.length}</span>
                <span style={{ color: gc.color, fontSize: 12, background: `${gc.color}18`, padding: '2px 8px', borderRadius: 99 }}>{gc.label[lang]}</span>
              </div>
              <div style={{ background: '#1E293B', borderRadius: 99, height: 6 }}>
                <div style={{ background: gc.color, borderRadius: 99, height: 6, width: `${(current / questions.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* 번역 버튼 */}
            <button type="button" onClick={() => setShowTrans(t => !t)} style={{
              background: 'transparent', border: '1px solid #334155',
              borderRadius: 8, padding: '5px 12px', color: '#BAE6FD',
              fontSize: 12, cursor: 'pointer', marginBottom: 10,
              fontFamily: 'Arial, sans-serif',
            }}>
              🌐 {t.translation}
            </button>

            {/* 번역 표시 */}
            {showTrans && (
              <div style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid #0891B244', borderRadius: 10, padding: '10px 14px', marginBottom: 10, color: '#BAE6FD', fontSize: 13, whiteSpace: 'pre-line' }}>
                {lang === 'bn' ? q.translation.bn : q.translation.en}
              </div>
            )}

            {/* 문제 */}
            <div style={{ background: '#071336', borderRadius: 14, padding: 18, marginBottom: 14, border: `1px solid ${gc.color}33`, whiteSpace: 'pre-line' }}>
              <div style={{ color: 'white', fontSize: 16, lineHeight: 1.8 }}>{q.question}</div>
            </div>

            {/* 보기 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {q.options.map((opt, idx) => {
                let bg = '#071336', border = '#334155', color = 'white';
                if (answered) {
                  if (idx === q.answer) { bg = 'rgba(16,185,129,0.2)'; border = '#10B981'; color = '#10B981'; }
                  else if (idx === selected) { bg = 'rgba(239,68,68,0.2)'; border = '#EF4444'; color = '#EF4444'; }
                }
                return (
                  <button key={idx} type="button" onClick={() => handleSelect(idx)} style={{
                    background: bg, border: `2px solid ${border}`, borderRadius: 12,
                    padding: '13px 16px', color, fontSize: 14, textAlign: 'left',
                    cursor: answered ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, color: bg === '#071336' ? 'white' : color }}>
                      {idx + 1}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* 해설 + 다음 */}
            {answered && (
              <div>
                <div style={{
                  background: selected === q.answer ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${selected === q.answer ? '#10B981' : '#EF4444'}`,
                  borderRadius: 12, padding: 14, marginBottom: 12,
                }}>
                  <div style={{ color: selected === q.answer ? '#10B981' : '#EF4444', fontWeight: 700, marginBottom: 6 }}>
                    {selected === q.answer ? `✅ ${t.correct}` : `❌ ${t.wrong}`}
                  </div>
                  <div style={{ color: '#BAE6FD', fontSize: 13 }}>{q.explanation}</div>
                </div>
                <button type="button" onClick={handleNext} style={{
                  width: '100%', background: gc.color, border: 'none', borderRadius: 12,
                  padding: 14, color: '#000', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                }}>
                  {current + 1 >= questions.length ? t.result : `${t.next} →`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
