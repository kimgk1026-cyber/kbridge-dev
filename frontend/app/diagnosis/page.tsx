'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';

// 1~4급 혼합 20문항 (난이도 순)
const DIAGNOSIS_QUESTIONS = [
  { id: 1, grade: 1, question: '다음 중 인사말은?', options: ['안녕하세요', '사과', '책상', '파란'], answer: 0 },
  { id: 2, grade: 1, question: '( )에 알맞은 것을 고르세요.\n저는 학생( ) 아닙니다.', options: ['이', '가', '은', '을'], answer: 0 },
  { id: 3, grade: 1, question: '색깔이 아닌 것은?', options: ['빨간', '파란', '노란', '빠른'], answer: 3 },
  { id: 4, grade: 1, question: '( )에 알맞은 것을 고르세요.\n저는 학교( ) 가요.', options: ['에', '이', '을', '의'], answer: 0 },
  { id: 5, grade: 1, question: '직업이 아닌 것은?', options: ['선생님', '의사', '학생', '아파트'], answer: 3 },
  { id: 6, grade: 2, question: '( )에 알맞은 것을 고르세요.\n오늘 날씨가 ( ) 좋네요.', options: ['정말', '그런데', '하지만', '왜냐하면'], answer: 0 },
  { id: 7, grade: 2, question: '다음 중 올바른 문장은?', options: ['저는 어제 영화를 봤어요.', '저는 어제 영화를 봐요.', '저는 어제 영화를 볼 거예요.', '저는 어제 영화를 보고 있어요.'], answer: 0 },
  { id: 8, grade: 2, question: '( )에 알맞은 것을 고르세요.\n한국어가 어렵지만 ( ) 재미있어요.', options: ['그래도', '그래서', '그리고', '그러면'], answer: 0 },
  { id: 9, grade: 2, question: '다음 중 맞는 문장은?', options: ['피곤해서 일찍 잤어요.', '피곤해서 일찍 자요.', '피곤해서 일찍 잘 거예요.', '피곤해서 일찍 자겠어요.'], answer: 0 },
  { id: 10, question: '( )에 알맞은 것을 고르세요.\n이 책은 읽기가 ( ).', grade: 2, options: ['쉬워요', '쉬우요', '쉽어요', '쉽요'], answer: 0 },
  { id: 11, grade: 3, question: '다음 관용표현의 의미는?\n"발이 넓다"', options: ['인맥이 넓다', '발 크기가 크다', '걷기를 잘한다', '빨리 달린다'], answer: 0 },
  { id: 12, grade: 3, question: '( )에 알맞은 것을 고르세요.\n아무리 ( ) 할 수 없는 일도 있어요.', options: ['노력해도', '노력하면', '노력해서', '노력하고'], answer: 0 },
  { id: 13, grade: 3, question: '다음 중 맞춤법이 올바른 것은?', options: ['돼요', '되요', '됬어요', '됬요'], answer: 0 },
  { id: 14, grade: 3, question: '( )에 알맞은 것을 고르세요.\n건강을 위해 운동을 ( ) 합니다.', options: ['꾸준히', '느긋하게', '급하게', '무겁게'], answer: 0 },
  { id: 15, grade: 3, question: '다음 중 피동 표현이 올바른 것은?', options: ['문이 열렸어요.', '문이 열었어요.', '문을 열렸어요.', '문이 열어졌어요.'], answer: 0 },
  { id: 16, grade: 4, question: '( )에 알맞은 것을 고르세요.\n그는 약속을 ( ) 않고 떠났다.', options: ['지키지', '지킨', '지키고', '지켜'], answer: 0 },
  { id: 17, grade: 4, question: '다음 중 접속사가 맞는 것은?\n그는 열심히 공부했다. ( ) 시험에 떨어졌다.', options: ['그러나', '그래서', '그리고', '그러면'], answer: 0 },
  { id: 18, grade: 4, question: '( )에 알맞은 것을 고르세요.\n사회가 발전할( ) 새로운 문제도 생긴다.', options: ['수록', '때문에', '지만', '면서'], answer: 0 },
  { id: 19, grade: 4, question: '다음 문장의 주제로 알맞은 것은?\n"현대 사회에서 사람들은 빠른 생활 속에서 자신을 돌보지 못하는 경우가 많다."', options: ['현대인의 자기 관리 부족', '기술 발전의 속도', '바쁜 일상의 즐거움', '현대 기술의 문제점'], answer: 0 },
  { id: 20, grade: 4, question: '( )에 알맞은 것을 고르세요.\n기후 변화는 ( ) 전 세계가 함께 해결해야 할 문제다.', options: ['한 국가만이 아니라', '우리나라만의', '선진국만의', '아시아만의'], answer: 0 },
];

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    title: '수준 진단 테스트', sub: '20문항으로 나의 TOPIK 급수를 알아봐요!',
    start: '진단 시작', question: '문제', next: '다음', finish: '결과 보기',
    result: '나의 추천 급수', retry: '다시 진단', goTopik: 'TOPIK 풀기',
    goCurriculum: '커리큘럼 보기', home: '홈으로',
    grade1: '1급 (입문)', grade2: '2급 (초급)', grade3: '3급 (중급)', grade4: '4급 (중급+)',
    desc1: '기초 한국어부터 시작해요!', desc2: '초급 문법을 공부해요!',
    desc3: '중급 표현을 배워요!', desc4: '고급 문장을 도전해요!',
    saving: '결과를 저장했어요',
  },
  bn: {
    title: 'স্তর নির্ণয় পরীক্ষা', sub: '২০টি প্রশ্নে আপনার TOPIK গ্রেড জানুন!',
    start: 'পরীক্ষা শুরু', question: 'প্রশ্ন', next: 'পরবর্তী', finish: 'ফলাফল দেখুন',
    result: 'আপনার প্রস্তাবিত গ্রেড', retry: 'আবার চেষ্টা', goTopik: 'TOPIK অনুশীলন',
    goCurriculum: 'পাঠ্যক্রম দেখুন', home: 'হোম',
    grade1: '১ম গ্রেড (প্রাথমিক)', grade2: '২য় গ্রেড (প্রাথমিক+)',
    grade3: '৩য় গ্রেড (মধ্যবর্তী)', grade4: '৪র্থ গ্রেড (মধ্যবর্তী+)',
    desc1: 'মৌলিক কোরিয়ান থেকে শুরু করুন!', desc2: 'প্রাথমিক ব্যাকরণ শিখুন!',
    desc3: 'মধ্যবর্তী প্রকাশ শিখুন!', desc4: 'উন্নত বাক্য চেষ্টা করুন!',
    saving: 'ফলাফল সংরক্ষণ করা হয়েছে',
  },
  en: {
    title: 'Level Diagnosis Test', sub: 'Find your TOPIK grade with 20 questions!',
    start: 'Start Test', question: 'Question', next: 'Next', finish: 'See Result',
    result: 'Your Recommended Grade', retry: 'Retry', goTopik: 'TOPIK Practice',
    goCurriculum: 'View Curriculum', home: 'Home',
    grade1: 'Grade 1 (Beginner)', grade2: 'Grade 2 (Elementary)',
    grade3: 'Grade 3 (Intermediate)', grade4: 'Grade 4 (Intermediate+)',
    desc1: 'Start with basic Korean!', desc2: 'Study elementary grammar!',
    desc3: 'Learn intermediate expressions!', desc4: 'Challenge advanced sentences!',
    saving: 'Result saved!',
  },
};

function calcGrade(answers: (number | null)[]): number {
  let correct1 = 0, correct2 = 0, correct3 = 0, correct4 = 0;
  DIAGNOSIS_QUESTIONS.forEach((q, i) => {
    if (answers[i] === q.answer) {
      if (q.grade === 1) correct1++;
      else if (q.grade === 2) correct2++;
      else if (q.grade === 3) correct3++;
      else correct4++;
    }
  });
  const total = correct1 + correct2 + correct3 + correct4;
  if (correct4 >= 3 && correct3 >= 3) return 4;
  if (correct3 >= 3 && correct2 >= 3) return 3;
  if (correct2 >= 3 && correct1 >= 3) return 2;
  return 1;
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [lang,    setLang]    = useState<Lang>('bn');
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(20).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [done,    setDone]    = useState(false);
  const [grade,   setGrade]   = useState(0);

  const t  = UI[lang];
  const q  = DIAGNOSIS_QUESTIONS[current];
  const pct = Math.round(((current) / DIAGNOSIS_QUESTIONS.length) * 100);

  const GRADE_COLORS = ['', '#10B981', '#0891B2', '#F59E0B', '#EF4444'];
  const GRADE_DESCS  = ['', t.desc1, t.desc2, t.desc3, t.desc4];
  const GRADE_LABELS = ['', t.grade1, t.grade2, t.grade3, t.grade4];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current + 1 >= DIAGNOSIS_QUESTIONS.length) {
      const g = calcGrade(answers);
      setGrade(g);
      setDone(true);
      try { localStorage.setItem('topik_grade', String(g)); } catch {}
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #10B981', position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/topik')} style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← TOPIK
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>🎯 {t.title}</span>
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

        {/* 시작 화면 */}
        {!started && !done && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
            <h1 style={{ color: 'white', fontSize: 22, marginBottom: 8 }}>{t.title}</h1>
            <p style={{ color: '#BAE6FD', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{t.sub}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {[1, 2, 3, 4].map(g => (
                <div key={g} style={{ background: '#071336', border: `1px solid ${GRADE_COLORS[g]}33`, borderRadius: 12, padding: '12px 10px' }}>
                  <div style={{ color: GRADE_COLORS[g], fontWeight: 700, fontSize: 13 }}>{GRADE_LABELS[g]}</div>
                  <div style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>{GRADE_DESCS[g]}</div>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setStarted(true)} style={{
              width: '100%', background: '#10B981', border: 'none',
              borderRadius: 14, padding: 16, color: '#000',
              fontWeight: 700, fontSize: 16, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              🚀 {t.start}
            </button>
          </div>
        )}

        {/* 진단 문제 */}
        {started && !done && (
          <>
            {/* 진행 바 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>{t.question} {current + 1} / {DIAGNOSIS_QUESTIONS.length}</span>
                <span style={{ color: '#10B981', fontSize: 12 }}>{GRADE_LABELS[q.grade]}</span>
              </div>
              <div style={{ background: '#1E293B', borderRadius: 99, height: 8 }}>
                <div style={{ background: 'linear-gradient(90deg, #10B981, #0891B2)', borderRadius: 99, height: 8, width: `${pct}%`, transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* 문제 */}
            <div style={{ background: '#071336', borderRadius: 14, padding: 18, marginBottom: 14, border: '1px solid #1E293B', whiteSpace: 'pre-line' }}>
              <div style={{ color: 'white', fontSize: 16, lineHeight: 1.8 }}>{q.question}</div>
            </div>

            {/* 보기 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {q.options.map((opt, idx) => {
                let bg = '#071336', border = '#334155', color = 'white';
                if (selected !== null) {
                  if (idx === q.answer) { bg = 'rgba(16,185,129,0.2)'; border = '#10B981'; color = '#10B981'; }
                  else if (idx === selected && idx !== q.answer) { bg = 'rgba(239,68,68,0.2)'; border = '#EF4444'; color = '#EF4444'; }
                }
                return (
                  <button key={idx} type="button" onClick={() => handleSelect(idx)} style={{
                    background: bg, border: `2px solid ${border}`,
                    borderRadius: 12, padding: '13px 16px',
                    color, fontSize: 14, textAlign: 'left',
                    cursor: selected !== null ? 'default' : 'pointer',
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

            {/* 다음 버튼 */}
            {selected !== null && (
              <button type="button" onClick={handleNext} style={{
                width: '100%', background: '#10B981', border: 'none',
                borderRadius: 12, padding: 14, color: '#000',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
              }}>
                {current + 1 >= DIAGNOSIS_QUESTIONS.length ? t.finish : `${t.next} →`}
              </button>
            )}
          </>
        )}

        {/* 결과 화면 */}
        {done && grade > 0 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <p style={{ color: '#BAE6FD', fontSize: 14, marginBottom: 8 }}>{t.result}</p>
            <div style={{
              background: `${GRADE_COLORS[grade]}18`,
              border: `3px solid ${GRADE_COLORS[grade]}`,
              borderRadius: 20, padding: '24px 20px', marginBottom: 20,
            }}>
              <div style={{ color: GRADE_COLORS[grade], fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                {GRADE_LABELS[grade]}
              </div>
              <div style={{ color: '#BAE6FD', fontSize: 14 }}>{GRADE_DESCS[grade]}</div>
              <div style={{ color: '#10B981', fontSize: 12, marginTop: 8 }}>✅ {t.saving}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={() => router.push('/topik')} style={{
                width: '100%', background: GRADE_COLORS[grade], border: 'none',
                borderRadius: 12, padding: 14, color: '#000', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                📝 {t.goTopik}
              </button>
              <button type="button" onClick={() => router.push('/curriculum')} style={{
                width: '100%', background: '#0891B2', border: 'none',
                borderRadius: 12, padding: 14, color: 'white', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                📚 {t.goCurriculum}
              </button>
              <button type="button" onClick={() => { setStarted(false); setDone(false); setCurrent(0); setAnswers(Array(20).fill(null)); setSelected(null); }} style={{
                width: '100%', background: 'transparent', border: '1px solid #334155',
                borderRadius: 12, padding: 12, color: '#BAE6FD', fontSize: 13,
                cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                🔄 {t.retry}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
