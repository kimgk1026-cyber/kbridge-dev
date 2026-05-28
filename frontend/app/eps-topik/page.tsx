'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';

const QUESTIONS = [
  {
    id: 1, category: '안전',
    question: '작업장에서 안전모를 써야 하는 이유는?',
    options: ['머리를 보호하기 위해', '더워서', '규정이 없어도', '빠르게 일하려고'],
    answer: 0,
    explanation: '안전모는 낙하물로부터 머리를 보호해요.',
    translation: {
      bn: 'কর্মক্ষেত্রে হেলমেট পরার কারণ কী?',
      en: 'Why should you wear a helmet at work?',
    },
  },
  {
    id: 2, category: '근로계약',
    question: '근로계약서는 언제 작성해야 하나요?',
    options: ['일 시작 전에', '일 시작 후 1달 뒤', '월급 받은 후', '필요 없다'],
    answer: 0,
    explanation: '근로계약서는 반드시 일 시작 전에 작성해야 해요.',
    translation: {
      bn: 'কর্মসংস্থান চুক্তি কখন করতে হয়?',
      en: 'When should you sign an employment contract?',
    },
  },
  {
    id: 3, category: '임금',
    question: '2024년 한국 최저시급은 얼마인가요?',
    options: ['9,860원', '8,000원', '10,000원', '7,500원'],
    answer: 0,
    explanation: '2024년 최저시급은 9,860원이에요.',
    translation: {
      bn: '২০২৪ সালে কোরিয়ার ন্যূনতম ঘণ্টামজুরি কত?',
      en: "What is Korea's minimum hourly wage in 2024?",
    },
  },
  {
    id: 4, category: '비자',
    question: 'E-9 비자로 한국에서 일할 수 있는 최대 기간은?',
    options: ['3년 (연장 가능)', '1년', '6개월', '무제한'],
    answer: 0,
    explanation: 'E-9 비자는 기본 3년, 재고용 시 최대 4년 10개월까지 가능해요.',
    translation: {
      bn: 'E-9 ভিসায় কোরিয়ায় সর্বোচ্চ কতদিন কাজ করা যায়?',
      en: 'Maximum working period with E-9 visa in Korea?',
    },
  },
  {
    id: 5, category: '생활',
    question: '한국에서 119에 전화하는 상황은?',
    options: ['화재/응급환자', '길을 잃었을 때', '도둑이 들었을 때', '배가 고플 때'],
    answer: 0,
    explanation: '119는 화재나 응급환자 신고 번호예요. 경찰은 112예요.',
    translation: {
      bn: 'কোরিয়ায় ১১৯ নম্বরে কখন ফোন করবেন?',
      en: 'When do you call 119 in Korea?',
    },
  },
];

const CATEGORIES = ['전체', '안전', '근로계약', '임금', '비자', '생활'];

const UI: Record<Lang, Record<string, string>> = {
  ko: { title: 'EPS-TOPIK 연습', question: '문제', next: '다음', result: '결과 보기', retry: '다시 풀기', correct: '정답!', wrong: '오답', score: '점수', explanation: '해설', home: '홈으로', filter: '카테고리' },
  bn: { title: 'EPS-TOPIK অনুশীলন', question: 'প্রশ্ন', next: 'পরবর্তী', result: 'ফলাফল দেখুন', retry: 'আবার চেষ্টা', correct: 'সঠিক!', wrong: 'ভুল', score: 'স্কোর', explanation: 'ব্যাখ্যা', home: 'হোম', filter: 'বিভাগ' },
  en: { title: 'EPS-TOPIK Practice', question: 'Question', next: 'Next', result: 'See Result', retry: 'Try Again', correct: 'Correct!', wrong: 'Wrong', score: 'Score', explanation: 'Explanation', home: 'Home', filter: 'Category' },
};

export default function EpsTopikPage() {
  const router = useRouter();
  const [lang,     setLang]     = useState<Lang>('bn');
  const [category, setCategory] = useState('전체');
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score,    setScore]    = useState(0);
  const [done,     setDone]     = useState(false);
  const [wrongList,setWrongList]= useState<number[]>([]);

  const t = UI[lang];
  const filtered = category === '전체' ? QUESTIONS : QUESTIONS.filter(q => q.category === category);
  const q = filtered[current];

  if (!q && !done) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0B1F4B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
          <p>이 카테고리에 문제가 없어요</p>
          <button type="button" onClick={() => setCategory('전체')} style={{ marginTop: 16, background: '#10B981', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
            전체 보기
          </button>
        </div>
      </div>
    );
  }

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.answer) setScore(s => s + 1);
    else setWrongList(prev => [...prev, q.id]);
  };

  const handleNext = () => {
    if (current + 1 >= filtered.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
    setAnswered(false);
  };

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setAnswered(false);
    setScore(0); setDone(false); setWrongList([]);
  };

  const pct = Math.round((score / filtered.length) * 100);

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>
      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #F59E0B', position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#F59E0B', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          ← K-BRIDGE
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>💼 {t.title}</span>
        <div style={{ display: 'flex', gap: 3 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? '#F59E0B' : 'transparent',
              border: '1px solid #F59E0B', borderRadius: 4,
              color: lang === l ? '#000' : '#F59E0B',
              padding: '2px 6px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            }}>
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 카테고리 필터 */}
        {!done && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => { setCategory(cat); setCurrent(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); setWrongList([]); }} style={{
                background: category === cat ? '#F59E0B' : 'transparent',
                border: `1px solid ${category === cat ? '#F59E0B' : '#334155'}`,
                borderRadius: 99, padding: '5px 12px',
                color: category === cat ? '#000' : '#BAE6FD',
                fontSize: 12, cursor: 'pointer', fontWeight: category === cat ? 700 : 400,
                fontFamily: 'Arial, sans-serif',
              }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* 결과 화면 */}
        {done ? (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ fontSize: 60, marginBottom: 12 }}>
              {pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '📚'}
            </div>
            <div style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
              {t.score}: {score} / {filtered.length}
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, color: pct >= 80 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#EF4444', marginBottom: 24 }}>
              {pct}점
            </div>

            {wrongList.length > 0 && (
              <div style={{ background: '#071336', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                <div style={{ color: '#EF4444', fontWeight: 700, marginBottom: 12 }}>❌ 틀린 문제 해설</div>
                {QUESTIONS.filter(q => wrongList.includes(q.id)).map(q => (
                  <div key={q.id} style={{ marginBottom: 14, borderBottom: '1px solid #1E293B', paddingBottom: 14 }}>
                    <div style={{ color: '#F59E0B', fontSize: 11, marginBottom: 4 }}>📌 {q.category}</div>
                    <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>
                      {lang === 'ko' ? q.question : lang === 'bn' ? q.translation.bn : q.translation.en}
                    </div>
                    <div style={{ color: '#10B981', fontSize: 12 }}>✅ {q.options[q.answer]}</div>
                    <div style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>{q.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleRetry} style={{ flex: 1, background: '#F59E0B', border: 'none', borderRadius: 12, padding: 14, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                🔄 {t.retry}
              </button>
              <button type="button" onClick={() => router.push('/')} style={{ flex: 1, background: '#1E293B', border: 'none', borderRadius: 12, padding: 14, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                🏠 {t.home}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 진행 바 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>{t.question} {current + 1} / {filtered.length}</span>
                <span style={{ color: '#F59E0B', fontSize: 12, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 99 }}>{q.category}</span>
              </div>
              <div style={{ background: '#1E293B', borderRadius: 99, height: 6 }}>
                <div style={{ background: '#F59E0B', borderRadius: 99, height: 6, width: `${(current / filtered.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>
            </div>

            {/* 벵골어 번역 */}
            {lang !== 'ko' && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, color: '#BAE6FD', fontSize: 13 }}>
                {lang === 'bn' ? q.translation.bn : q.translation.en}
              </div>
            )}

            {/* 문제 */}
            <div style={{ background: '#071336', borderRadius: 14, padding: 18, marginBottom: 16, border: '1px solid #1E293B' }}>
              <div style={{ color: 'white', fontSize: 16, lineHeight: 1.7 }}>{q.question}</div>
            </div>

            {/* 보기 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {q.options.map((opt, idx) => {
                let bg = '#071336', border = '#334155', color = 'white';
                if (answered) {
                  if (idx === q.answer) { bg = 'rgba(16,185,129,0.2)'; border = '#10B981'; color = '#10B981'; }
                  else if (idx === selected) { bg = 'rgba(239,68,68,0.2)'; border = '#EF4444'; color = '#EF4444'; }
                }
                return (
                  <button key={idx} type="button" onClick={() => handleSelect(idx)} style={{
                    background: bg, border: `2px solid ${border}`,
                    borderRadius: 12, padding: '13px 16px',
                    color, fontSize: 14, textAlign: 'left',
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
                  width: '100%', background: '#F59E0B', border: 'none',
                  borderRadius: 12, padding: 14, color: '#000',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  {current + 1 >= filtered.length ? t.result : `${t.next} →`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
