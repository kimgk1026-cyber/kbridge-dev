'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    title: '나의 커리큘럼', noDiagnosis: '수준 진단을 먼저 해주세요!',
    goDiagnosis: '수준 진단 하러 가기', today: '오늘 학습', week: '이번 주 계획',
    progress: '진도율', done: '완료', todo: '미완료', start: '학습 시작',
    vocabTitle: '오늘의 단어', topikTitle: 'TOPIK 문제', totalDays: '총 학습일',
    estimated: '예상 완료', recommend: '추천 급수', home: '홈으로',
    dayLabel: '일차', complete: '완료!', skip: '건너뛰기', restart: '처음부터',
  },
  bn: {
    title: 'আমার পাঠ্যক্রম', noDiagnosis: 'আগে স্তর নির্ণয় করুন!',
    goDiagnosis: 'স্তর নির্ণয় করতে যান', today: 'আজকের পাঠ', week: 'এই সপ্তাহের পরিকল্পনা',
    progress: 'অগ্রগতি', done: 'সম্পন্ন', todo: 'বাকি', start: 'পাঠ শুরু',
    vocabTitle: 'আজকের শব্দ', topikTitle: 'TOPIK প্রশ্ন', totalDays: 'মোট শেখার দিন',
    estimated: 'আনুমানিক সমাপ্তি', recommend: 'প্রস্তাবিত গ্রেড', home: 'হোম',
    dayLabel: 'দিন', complete: 'সম্পন্ন!', skip: 'এড়িয়ে যান', restart: 'আবার শুরু',
  },
  en: {
    title: 'My Curriculum', noDiagnosis: 'Please take the level test first!',
    goDiagnosis: 'Go to Level Test', today: 'Today\'s Study', week: 'This Week\'s Plan',
    progress: 'Progress', done: 'Done', todo: 'Todo', start: 'Start Studying',
    vocabTitle: 'Today\'s Words', topikTitle: 'TOPIK Questions', totalDays: 'Total Study Days',
    estimated: 'Est. Completion', recommend: 'Recommended Grade', home: 'Home',
    dayLabel: 'Day', complete: 'Complete!', skip: 'Skip', restart: 'Restart',
  },
};

// 급수별 커리큘럼 데이터
const CURRICULUM: Record<number, {
  totalDays: number;
  weeks: { week: number; theme: Record<Lang, string>; days: { day: number; vocab: string[]; topikCount: number; focus: Record<Lang, string> }[] }[];
}> = {
  1: {
    totalDays: 30,
    weeks: [
      {
        week: 1,
        theme: { ko: '기초 인사 & 숫자', bn: 'মৌলিক অভিবাদন ও সংখ্যা', en: 'Basic Greetings & Numbers' },
        days: [
          { day: 1, vocab: ['안녕하세요', '감사합니다', '죄송합니다'], topikCount: 3, focus: { ko: '인사말 익히기', bn: 'অভিবাদন শেখা', en: 'Learn Greetings' } },
          { day: 2, vocab: ['하나', '둘', '셋', '넷', '다섯'], topikCount: 3, focus: { ko: '숫자 1~10', bn: '১-১০ সংখ্যা', en: 'Numbers 1~10' } },
          { day: 3, vocab: ['학교', '병원', '식당', '집'], topikCount: 3, focus: { ko: '장소 표현', bn: 'স্থান প্রকাশ', en: 'Place Expressions' } },
          { day: 4, vocab: ['어머니', '아버지', '형', '동생'], topikCount: 3, focus: { ko: '가족 호칭', bn: 'পরিবারের নাম', en: 'Family Terms' } },
          { day: 5, vocab: ['오늘', '내일', '어제', '지금'], topikCount: 4, focus: { ko: '시간 표현', bn: 'সময় প্রকাশ', en: 'Time Expressions' } },
        ],
      },
      {
        week: 2,
        theme: { ko: '기초 문법 & 조사', bn: 'মৌলিক ব্যাকরণ ও বিভক্তি', en: 'Basic Grammar & Particles' },
        days: [
          { day: 6,  vocab: ['이/가', '은/는', '을/를', '에'], topikCount: 4, focus: { ko: '기본 조사', bn: 'মৌলিক বিভক্তি', en: 'Basic Particles' } },
          { day: 7,  vocab: ['먹다', '마시다', '가다', '오다'], topikCount: 4, focus: { ko: '기본 동사', bn: 'মৌলিক ক্রিয়া', en: 'Basic Verbs' } },
          { day: 8,  vocab: ['크다', '작다', '좋다', '나쁘다'], topikCount: 4, focus: { ko: '형용사 반의어', bn: 'বিপরীত বিশেষণ', en: 'Adjective Antonyms' } },
          { day: 9,  vocab: ['아요/어요', '있어요', '없어요'], topikCount: 4, focus: { ko: '현재형 표현', bn: 'বর্তমান কাল', en: 'Present Tense' } },
          { day: 10, vocab: ['밥', '물', '커피', '주스'], topikCount: 5, focus: { ko: '음식 & 음료', bn: 'খাবার ও পানীয়', en: 'Food & Drinks' } },
        ],
      },
    ],
  },
  2: {
    totalDays: 40,
    weeks: [
      {
        week: 1,
        theme: { ko: '과거/미래 시제', bn: 'অতীত/ভবিষ্যৎ কাল', en: 'Past/Future Tense' },
        days: [
          { day: 1, vocab: ['았어요/었어요', '했어요', '갔어요'], topikCount: 4, focus: { ko: '과거형 만들기', bn: 'অতীত কাল তৈরি', en: 'Making Past Tense' } },
          { day: 2, vocab: ['ㄹ 거예요', '할 거예요', '갈 거예요'], topikCount: 4, focus: { ko: '미래형 만들기', bn: 'ভবিষ্যৎ কাল তৈরি', en: 'Making Future Tense' } },
          { day: 3, vocab: ['그래서', '그런데', '하지만', '그리고'], topikCount: 4, focus: { ko: '접속사', bn: 'সংযোগকারী শব্দ', en: 'Conjunctions' } },
          { day: 4, vocab: ['아서/어서', '때문에', '기 위해서'], topikCount: 4, focus: { ko: '이유 표현', bn: 'কারণ প্রকাশ', en: 'Reason Expressions' } },
          { day: 5, vocab: ['정말', '너무', '아주', '매우'], topikCount: 5, focus: { ko: '강조 부사', bn: 'জোরদার বিশেষণ', en: 'Emphasis Adverbs' } },
        ],
      },
      {
        week: 2,
        theme: { ko: '불규칙 동사 & 형용사', bn: 'অনিয়মিত ক্রিয়া ও বিশেষণ', en: 'Irregular Verbs & Adjectives' },
        days: [
          { day: 6,  vocab: ['쉽다→쉬워요', '어렵다→어려워요', '돕다→도와요'], topikCount: 5, focus: { ko: 'ㅂ 불규칙', bn: 'ব অনিয়মিত', en: 'ㅂ Irregular' } },
          { day: 7,  vocab: ['듣다→들어요', '걷다→걸어요', '묻다→물어요'], topikCount: 5, focus: { ko: 'ㄷ 불규칙', bn: 'দ অনিয়মিত', en: 'ㄷ Irregular' } },
          { day: 8,  vocab: ['면서', '고', '거나', '든지'], topikCount: 5, focus: { ko: '연결 어미', bn: 'সংযোগ প্রত্যয়', en: 'Connective Endings' } },
          { day: 9,  vocab: ['기로 하다', '기 시작하다', '기 어렵다'], topikCount: 5, focus: { ko: '-기 표현', bn: '-기 প্রকাশ', en: '-gi Expressions' } },
          { day: 10, vocab: ['는 것', '는 편이다', '는 동안'], topikCount: 6, focus: { ko: '명사화 표현', bn: 'নামকরণ প্রকাশ', en: 'Nominalization' } },
        ],
      },
    ],
  },
  3: {
    totalDays: 45,
    weeks: [
      {
        week: 1,
        theme: { ko: '고급 문법 & 관용어', bn: 'উন্নত ব্যাকরণ ও প্রবাদ', en: 'Advanced Grammar & Idioms' },
        days: [
          { day: 1, vocab: ['-는 바람에', '-는 탓에', '-는 덕분에'], topikCount: 5, focus: { ko: '원인 결과 표현', bn: 'কারণ-ফলাফল প্রকাশ', en: 'Cause-Effect Expressions' } },
          { day: 2, vocab: ['발이 넓다', '눈이 높다', '귀가 얇다'], topikCount: 5, focus: { ko: '신체 관용어', bn: 'শরীর সংক্রান্ত প্রবাদ', en: 'Body Idioms' } },
          { day: 3, vocab: ['수록', '아무리', '설령'], topikCount: 5, focus: { ko: '조건/양보 표현', bn: 'শর্ত/ছাড় প্রকাশ', en: 'Condition/Concession' } },
          { day: 4, vocab: ['피동형', '사동형', '주동형'], topikCount: 5, focus: { ko: '능동/피동/사동', bn: 'সক্রিয়/নিষ্ক্রিয়/কারণ', en: 'Active/Passive/Causative' } },
          { day: 5, vocab: ['높임말', '낮춤말', '보통말'], topikCount: 6, focus: { ko: '경어법 체계', bn: 'সম্মানসূচক ভাষা', en: 'Honorific System' } },
        ],
      },
    ],
  },
  4: {
    totalDays: 50,
    weeks: [
      {
        week: 1,
        theme: { ko: '논리적 글쓰기 & 독해', bn: 'যুক্তিপূর্ণ লেখা ও পাঠ বোঝা', en: 'Logical Writing & Reading' },
        days: [
          { day: 1, vocab: ['주장', '근거', '논거', '결론'], topikCount: 5, focus: { ko: '논리적 글 구조', bn: 'যুক্তিপূর্ণ লেখার কাঠামো', en: 'Logical Writing Structure' } },
          { day: 2, vocab: ['접속사 체계', '그러나', '따라서', '한편'], topikCount: 5, focus: { ko: '고급 접속사', bn: 'উন্নত সংযোগকারী', en: 'Advanced Conjunctions' } },
          { day: 3, vocab: ['수동태 고급', '피동 표현', '간접 화법'], topikCount: 5, focus: { ko: '간접 화법', bn: 'পরোক্ষ বক্তৃতা', en: 'Indirect Speech' } },
          { day: 4, vocab: ['예상치 못한', '불가피한', '자명한'], topikCount: 5, focus: { ko: '고급 어휘', bn: 'উন্নত শব্দভান্ডার', en: 'Advanced Vocabulary' } },
          { day: 5, vocab: ['맥락 파악', '주제 추론', '필자 의도'], topikCount: 6, focus: { ko: '독해 전략', bn: 'পাঠ বোঝার কৌশল', en: 'Reading Strategy' } },
        ],
      },
    ],
  },
};

export default function CurriculumPage() {
  const router = useRouter();
  const [lang,       setLang]       = useState<Lang>('bn');
  const [grade,      setGrade]      = useState<number>(0);
  const [daysDone,   setDaysDone]   = useState<number[]>([]);
  const [activeWeek, setActiveWeek] = useState(0);

  const t = UI[lang];

  useEffect(() => {
    try {
      const g = localStorage.getItem('topik_grade');
      if (g) setGrade(parseInt(g));
      const d = localStorage.getItem('curriculum_done');
      if (d) setDaysDone(JSON.parse(d));
    } catch {}
  }, []);

  const curriculum = grade ? CURRICULUM[grade] : null;
  const GRADE_COLORS: Record<number, string> = { 1: '#10B981', 2: '#0891B2', 3: '#F59E0B', 4: '#EF4444' };
  const gc = GRADE_COLORS[grade] || '#10B981';

  const toggleDay = (day: number) => {
    const next = daysDone.includes(day) ? daysDone.filter(d => d !== day) : [...daysDone, day];
    setDaysDone(next);
    try { localStorage.setItem('curriculum_done', JSON.stringify(next)); } catch {}
  };

  const totalDays  = curriculum?.totalDays || 0;
  const donePct    = totalDays > 0 ? Math.round((daysDone.length / totalDays) * 100) : 0;
  const todayDay   = daysDone.length + 1;
  const currentWeek = curriculum?.weeks.find(w => w.days.some(d => d.day === todayDay)) || curriculum?.weeks[0];
  const todayData  = currentWeek?.days.find(d => d.day === todayDay);
  const weeks      = curriculum?.weeks || [];

  if (!grade) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
        <p style={{ color: '#BAE6FD', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>{t.noDiagnosis}</p>
        <button type="button" onClick={() => router.push('/diagnosis')} style={{
          background: '#10B981', border: 'none', borderRadius: 12,
          padding: '14px 28px', color: '#000', fontWeight: 700, fontSize: 15,
          cursor: 'pointer', fontFamily: 'Arial, sans-serif',
        }}>
          🎯 {t.goDiagnosis}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${gc}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: gc, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← {t.home}
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>📚 {t.title}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? gc : 'transparent',
              border: `1px solid ${gc}`, borderRadius: 4,
              color: lang === l ? '#000' : gc,
              padding: '3px 7px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 상단 진도 카드 */}
        <div style={{ background: `linear-gradient(135deg, #071336, ${gc}22)`, border: `1px solid ${gc}44`, borderRadius: 18, padding: '18px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ color: '#64748B', fontSize: 12, marginBottom: 4 }}>{t.recommend}</div>
              <div style={{ color: gc, fontSize: 20, fontWeight: 800 }}>TOPIK {grade}급</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: gc, fontSize: 28, fontWeight: 800 }}>{donePct}%</div>
              <div style={{ color: '#64748B', fontSize: 12 }}>{t.progress}</div>
            </div>
          </div>
          <div style={{ background: '#1E293B', borderRadius: 99, height: 10, overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(90deg, ${gc}, ${gc}88)`, borderRadius: 99, height: 10, width: `${donePct}%`, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ color: '#64748B', fontSize: 12 }}>{daysDone.length} {t.done}</span>
            <span style={{ color: '#64748B', fontSize: 12 }}>{totalDays - daysDone.length} {t.todo}</span>
          </div>
        </div>

        {/* 오늘의 학습 */}
        {todayData && (
          <div style={{ background: '#071336', border: `2px solid ${gc}`, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
            <div style={{ color: gc, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
              📅 {t.today} — {t.dayLabel} {todayDay}
            </div>

            {/* 주제 */}
            <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 8 }}>
              🎯 {todayData.focus[lang]}
            </div>

            {/* 단어 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#64748B', fontSize: 12, marginBottom: 6 }}>📚 {t.vocabTitle}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {todayData.vocab.map((v, i) => (
                  <span key={i} style={{ background: `${gc}18`, border: `1px solid ${gc}44`, borderRadius: 99, padding: '4px 10px', color: gc, fontSize: 13 }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* TOPIK 문제 수 */}
            <div style={{ color: '#64748B', fontSize: 12, marginBottom: 14 }}>
              📝 {t.topikTitle}: {todayData.topikCount}문제
            </div>

            {/* 학습 시작 버튼 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => router.push('/topik')} style={{
                flex: 2, background: gc, border: 'none', borderRadius: 10,
                padding: '12px', color: '#000', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                🚀 {t.start}
              </button>
              <button type="button" onClick={() => toggleDay(todayDay)} style={{
                flex: 1, background: daysDone.includes(todayDay) ? 'rgba(16,185,129,0.2)' : 'transparent',
                border: `1px solid ${daysDone.includes(todayDay) ? '#10B981' : '#334155'}`,
                borderRadius: 10, padding: '12px',
                color: daysDone.includes(todayDay) ? '#10B981' : '#64748B',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
              }}>
                {daysDone.includes(todayDay) ? '✅' : t.skip}
              </button>
            </div>
          </div>
        )}

        {/* 주차별 커리큘럼 */}
        <div style={{ color: '#BAE6FD', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          📋 {t.week}
        </div>

        {/* 주차 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
          {weeks.map((w, i) => (
            <button key={i} type="button" onClick={() => setActiveWeek(i)} style={{
              background: activeWeek === i ? gc : 'transparent',
              border: `1px solid ${activeWeek === i ? gc : '#334155'}`,
              borderRadius: 99, padding: '6px 14px',
              color: activeWeek === i ? '#000' : '#BAE6FD',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif',
            }}>
              Week {w.week}: {w.theme[lang]}
            </button>
          ))}
        </div>

        {/* 해당 주차 일별 목록 */}
        {weeks[activeWeek] && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weeks[activeWeek].days.map(d => {
              const isDone = daysDone.includes(d.day);
              const isToday = d.day === todayDay;
              return (
                <div key={d.day} style={{
                  background: isDone ? 'rgba(16,185,129,0.08)' : isToday ? `${gc}12` : '#071336',
                  border: `1px solid ${isDone ? '#10B981' : isToday ? gc : '#1E293B'}`,
                  borderRadius: 12, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: isDone ? '#10B981' : isToday ? gc : '#64748B', fontWeight: 700, fontSize: 13 }}>
                        {t.dayLabel} {d.day}
                      </span>
                      {isToday && <span style={{ background: gc, color: '#000', fontSize: 10, padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>TODAY</span>}
                      {isDone && <span style={{ color: '#10B981', fontSize: 12 }}>✅ {t.done}</span>}
                    </div>
                    <div style={{ color: '#BAE6FD', fontSize: 12 }}>{d.focus[lang]}</div>
                    <div style={{ color: '#64748B', fontSize: 11, marginTop: 3 }}>
                      📝 {d.topikCount}문제
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleDay(d.day)} style={{
                    background: isDone ? 'rgba(16,185,129,0.2)' : 'transparent',
                    border: `1px solid ${isDone ? '#10B981' : '#334155'}`,
                    borderRadius: 8, padding: '6px 10px',
                    color: isDone ? '#10B981' : '#64748B',
                    fontSize: 18, cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {isDone ? '✅' : '○'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 처음부터 버튼 */}
        <button type="button" onClick={() => { setDaysDone([]); try { localStorage.removeItem('curriculum_done'); } catch {} }} style={{
          width: '100%', background: 'transparent', border: '1px solid #334155',
          borderRadius: 12, padding: 12, color: '#64748B', fontSize: 13,
          cursor: 'pointer', marginTop: 16, fontFamily: 'Arial, sans-serif',
        }}>
          🔄 {t.restart}
        </button>
      </div>
    </div>
  );
}
