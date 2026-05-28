'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';

const API = 'http://localhost:8000';

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    title: '학습 대시보드', today: '오늘',
    greeting_morning: '좋은 아침이에요', greeting_afternoon: '안녕하세요', greeting_evening: '수고하셨어요',
    words: '외운 단어', streak: '연속 학습일', chats: 'AI 대화 수',
    progress: '나의 학습 진도', quickMenu: '빠른 메뉴',
    goVocab: '단어장', goTopik: 'TOPIK', goEps: 'EPS-TOPIK',
    goChat: 'AI 대화', goPricing: '요금제', goOnboard: '온보딩 다시하기',
    tip: '오늘의 한국어', home: '홈',
    level: '학습 레벨', beginner: '입문', intermediate: '초급', advanced: '중급',
    loading: '불러오는 중...', chatLimit: '일일 대화 한도',
    todayChat: '오늘 대화',
  },
  bn: {
    title: 'শেখার ড্যাশবোর্ড', today: 'আজ',
    greeting_morning: 'শুভ সকাল', greeting_afternoon: 'হ্যালো', greeting_evening: 'শুভ সন্ধ্যা',
    words: 'মনে রাখা শব্দ', streak: 'ধারাবাহিক দিন', chats: 'AI কথোপকথন',
    progress: 'আমার শেখার অগ্রগতি', quickMenu: 'দ্রুত মেনু',
    goVocab: 'শব্দভান্ডার', goTopik: 'TOPIK', goEps: 'EPS-TOPIK',
    goChat: 'AI কথা', goPricing: 'প্ল্যান', goOnboard: 'অনবোর্ডিং আবার',
    tip: 'আজকের কোরিয়ান', home: 'হোম',
    level: 'শেখার স্তর', beginner: 'শিক্ষানবিস', intermediate: 'প্রাথমিক', advanced: 'মধ্যবর্তী',
    loading: 'লোড হচ্ছে...', chatLimit: 'দৈনিক সীমা',
    todayChat: 'আজকের কথোপকথন',
  },
  en: {
    title: 'Learning Dashboard', today: 'Today',
    greeting_morning: 'Good Morning', greeting_afternoon: 'Hello', greeting_evening: 'Good Evening',
    words: 'Words Memorized', streak: 'Day Streak', chats: 'AI Chats',
    progress: 'My Learning Progress', quickMenu: 'Quick Menu',
    goVocab: 'Vocabulary', goTopik: 'TOPIK', goEps: 'EPS-TOPIK',
    goChat: 'AI Chat', goPricing: 'Pricing', goOnboard: 'Redo Onboarding',
    tip: "Today's Korean", home: 'Home',
    level: 'Learning Level', beginner: 'Beginner', intermediate: 'Elementary', advanced: 'Intermediate',
    loading: 'Loading...', chatLimit: 'Daily Limit',
    todayChat: "Today's Chats",
  },
};

const DAILY_TIPS = [
  { ko: '안녕하세요', bn: 'হ্যালো', en: 'Hello', romanized: 'An-nyeong-ha-se-yo' },
  { ko: '감사합니다', bn: 'ধন্যবাদ', en: 'Thank you', romanized: 'Gam-sa-ham-ni-da' },
  { ko: '괜찮아요', bn: 'ঠিক আছে', en: "It's okay", romanized: 'Gwaen-chan-a-yo' },
  { ko: '화이팅!', bn: 'এগিয়ে যাও!', en: 'Go for it!', romanized: 'Hwa-i-ting' },
  { ko: '잠깐만요', bn: 'একটু অপেক্ষা', en: 'Wait a moment', romanized: 'Jam-kkan-man-yo' },
  { ko: '모르겠어요', bn: 'জানি না', en: "I don't know", romanized: 'Mo-reu-ge-sseo-yo' },
  { ko: '얼마예요?', bn: 'দাম কত?', en: 'How much?', romanized: 'Eol-ma-ye-yo' },
];

interface Stats {
  chat_total: number;
  chat_today: number;
  chat_limit_today: number;
  topik_total: number;
  vocab_memorized: number;
  streak: number;
  last_login: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [lang,     setLang]     = useState<Lang>('bn');
  const [userName, setUserName] = useState('');
  const [purpose,  setPurpose]  = useState('');
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tipIdx,   setTipIdx]   = useState(0);
  const [memorized, setMemorized] = useState(0);

  useEffect(() => {
    const name  = localStorage.getItem('user_name')    || '';
    const purp  = localStorage.getItem('user_purpose') || '';
    const email = localStorage.getItem('user_email')   || '';
    setUserName(name);
    setPurpose(purp);
    setTipIdx(new Date().getDate() % DAILY_TIPS.length);

    // 로컬 단어장 진도
    try {
      const saved = localStorage.getItem('kbridge_memorized');
      if (saved) setMemorized(JSON.parse(saved).length);
    } catch {}

    // 서버에서 통계 불러오기
    if (email) {
      fetch(`${API}/stats/${email}`)
        .then(r => r.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => {
          // 서버 실패 시 로컬 데이터로 폴백
          setStats({
            chat_total: 0, chat_today: 0, chat_limit_today: 10,
            topik_total: 0, vocab_memorized: memorized,
            streak: 1, last_login: new Date().toISOString(),
          });
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const t   = UI[lang];
  const tip = DAILY_TIPS[tipIdx];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.greeting_morning : hour < 18 ? t.greeting_afternoon : t.greeting_evening;

  const vocabPct  = Math.round((memorized / 10) * 100);
  const topikPct  = stats ? Math.min(Math.round((stats.topik_total / 20) * 100), 100) : 0;
  const chatPct   = stats ? Math.min(Math.round((stats.chat_today / stats.chat_limit_today) * 100), 100) : 0;
  const totalPct  = Math.round((vocabPct + topikPct) / 2);

  const level = totalPct >= 60 ? t.advanced : totalPct >= 30 ? t.intermediate : t.beginner;
  const levelColor = totalPct >= 60 ? '#EF4444' : totalPct >= 30 ? '#F59E0B' : '#10B981';

  const QUICK_MENUS = [
    { icon: '📚', label: t.goVocab,   path: '/vocabulary', color: '#0891B2', bg: 'rgba(8,145,178,0.12)',   pct: vocabPct },
    { icon: '📝', label: t.goTopik,   path: '/topik',      color: '#10B981', bg: 'rgba(16,185,129,0.12)',  pct: topikPct },
    { icon: '💼', label: t.goEps,     path: '/eps-topik',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  pct: 0 },
    { icon: '🤖', label: t.goChat,    path: '/',           color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   pct: 0 },
    { icon: '💳', label: t.goPricing, path: '/pricing',    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', pct: 0 },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: 10, padding: '8px 14px', color: '#10B981', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← {t.home}
        </button>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>📊 {t.title}</span>
        <div style={{ display: 'flex', gap: 5 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? '#10B981' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${lang === l ? '#10B981' : '#334155'}`,
              borderRadius: 8, color: lang === l ? '#000' : '#10B981',
              padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 인사 배너 */}
        <div style={{ background: 'linear-gradient(135deg, #0c2a5e, #0891B2)', borderRadius: 20, padding: '20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ color: '#BAE6FD', fontSize: 12, marginBottom: 4 }}>
              {new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              {greeting}, {userName}! 👋
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 99, padding: '4px 12px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: levelColor }} />
              <span style={{ color: levelColor, fontSize: 12, fontWeight: 700 }}>{t.level}: {level}</span>
            </div>
          </div>
        </div>

        {/* 통계 카드 3개 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: t.words,  value: loading ? '…' : memorized,            icon: '📚', color: '#0891B2', sub: '/10' },
            { label: t.streak, value: loading ? '…' : (stats?.streak || 1), icon: '🔥', color: '#F59E0B', sub: lang === 'ko' ? '일' : lang === 'bn' ? 'দিন' : 'd' },
            { label: t.chats,  value: loading ? '…' : (stats?.chat_total || 0), icon: '💬', color: '#10B981', sub: lang === 'ko' ? '회' : lang === 'bn' ? 'বার' : 'x' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#071336', border: `1px solid ${s.color}33`, borderRadius: 16, padding: '16px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 4 }}>
                <span style={{ color: s.color, fontSize: 26, fontWeight: 800 }}>{s.value}</span>
                <span style={{ color: s.color, fontSize: 11, opacity: 0.7 }}>{s.sub}</span>
              </div>
              <div style={{ color: '#64748B', fontSize: 11, lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 오늘 대화 한도 */}
        {stats && (
          <div style={{ background: '#071336', border: '1px solid #1E293B', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#BAE6FD', fontSize: 13 }}>💬 {t.todayChat}</span>
              <span style={{ color: chatPct >= 80 ? '#EF4444' : '#10B981', fontSize: 13, fontWeight: 700 }}>
                {stats.chat_today} / {stats.chat_limit_today}
              </span>
            </div>
            <div style={{ background: '#1E293B', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ background: chatPct >= 80 ? '#EF4444' : '#10B981', borderRadius: 99, height: 8, width: `${Math.min(chatPct, 100)}%`, transition: 'width 0.5s' }} />
            </div>
            {chatPct >= 80 && (
              <div style={{ color: '#EF4444', fontSize: 11, marginTop: 6 }}>
                ⚠️ {lang === 'ko' ? '한도에 가까워요! 업그레이드하세요' : lang === 'bn' ? 'সীমার কাছাকাছি! আপগ্রেড করুন' : 'Near limit! Consider upgrading'}
              </div>
            )}
          </div>
        )}

        {/* 학습 진도 */}
        <div style={{ background: '#071336', border: '1px solid #1E293B', borderRadius: 20, padding: '18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>📈 {t.progress}</span>
            <span style={{ color: '#10B981', fontSize: 13, fontWeight: 700 }}>{totalPct}%</span>
          </div>
          <div style={{ background: '#1E293B', borderRadius: 99, height: 12, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #10B981, #0891B2)', borderRadius: 99, height: 12, width: `${totalPct}%`, transition: 'width 0.8s ease' }} />
          </div>
          {[
            { label: '📚 ' + t.goVocab, color: '#0891B2', pct: vocabPct, value: `${memorized}/10` },
            { label: '📝 ' + t.goTopik, color: '#10B981', pct: topikPct, value: `${stats?.topik_total || 0}문제` },
            ...(purpose === 'k_work' ? [{ label: '💼 ' + t.goEps, color: '#F59E0B', pct: 0, value: '0문제' }] : []),
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ color: '#BAE6FD', fontSize: 13 }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: 12, fontWeight: 700 }}>{item.value}</span>
              </div>
              <div style={{ background: '#1E293B', borderRadius: 99, height: 7, overflow: 'hidden' }}>
                <div style={{ background: item.color, borderRadius: 99, height: 7, width: `${item.pct}%`, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* 오늘의 한국어 */}
        <div style={{ background: 'linear-gradient(135deg, #071336, #0f2040)', border: '1px solid #F59E0B44', borderRadius: 20, padding: '18px', marginBottom: 16 }}>
          <div style={{ color: '#F59E0B', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>✨ {t.tip}</div>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{tip.ko}</div>
          <div style={{ color: '#BAE6FD', fontSize: 14, marginBottom: 4 }}>
            {lang === 'ko' ? tip.en : lang === 'bn' ? tip.bn : tip.en}
          </div>
          <div style={{ color: '#64748B', fontSize: 12, fontStyle: 'italic' }}>[{tip.romanized}]</div>
        </div>

        {/* 빠른 메뉴 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: '#BAE6FD', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🚀 {t.quickMenu}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {QUICK_MENUS.map((m, i) => (
              <button key={i} type="button" onClick={() => router.push(m.path)} style={{
                background: m.bg, border: `1px solid ${m.color}44`,
                borderRadius: 16, padding: '16px 14px',
                textAlign: 'left', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ color: m.color, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{m.label}</div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 99, height: 4 }}>
                  <div style={{ background: m.color, borderRadius: 99, height: 4, width: `${m.pct}%` }} />
                </div>
                <div style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>{m.pct}%</div>
              </button>
            ))}
          </div>
        </div>

        {/* 온보딩 다시하기 */}
        <button type="button" onClick={() => { localStorage.removeItem('onboarding_done'); router.push('/onboarding'); }} style={{ width: '100%', background: 'transparent', border: '1px solid #334155', borderRadius: 12, padding: '11px', color: '#64748B', fontSize: 13, cursor: 'pointer', marginTop: 8, fontFamily: 'Arial, sans-serif' }}>
          🔄 {t.goOnboard}
        </button>
      </div>
    </div>
  );
}
