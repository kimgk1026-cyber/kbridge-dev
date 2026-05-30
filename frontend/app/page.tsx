'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Vertical  = 'k_edu' | 'k_work' | 'k_culture';
type Lang      = 'ko' | 'bn' | 'en';
type ChatEntry = { role: 'user' | 'ai'; text: string; ts: Date };
type ConvSummary = { id: number; title: string; vertical: string; character: string; updated_at: string };

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const VERTICALS: Record<Vertical, {
  name: string; emoji: string; char: string;
  color: string; tagBg: string;
  desc: Record<Lang, string>;
  greeting: Record<Lang, string>;
  hints: Record<Lang, string[]>;
}> = {
  k_edu: {
    name: 'K-EDU', emoji: '🎓', char: '지수',
    color: '#0891B2', tagBg: 'rgba(8,145,178,0.12)',
    desc: { ko: '한국 유학 · TOPIK 준비', bn: 'কোরিয়ায় পড়াশোনা · TOPIK', en: 'Study in Korea · TOPIK' },
    greeting: {
      ko: '안녕! 나는 지수야 😊\n한국 유학이나 TOPIK에 대해 뭐든 물어봐!',
      bn: 'হ্যালো! আমি জিসু 😊\nকোরিয়ায় পড়াশোনা বা TOPIK নিয়ে যেকোনো প্রশ্ন করো!',
      en: "Hi! I'm Jisu 😊\nAsk me anything about studying in Korea or TOPIK!",
    },
    hints: {
      ko: ['TOPIK 공부 어떻게 시작해?', '한국 대학 장학금은?', '유학 비자 어떻게 받아?'],
      bn: ['TOPIK কীভাবে শুরু করব?', 'কোরিয়ায় বৃত্তি আছে?', 'ভিসা কীভাবে পাব?'],
      en: ['How to start TOPIK?', 'Scholarships in Korea?', 'How to get student visa?'],
    },
  },
  k_work: {
    name: 'K-WORK', emoji: '💼', char: '라힘',
    color: '#F59E0B', tagBg: 'rgba(245,158,11,0.12)',
    desc: { ko: '한국 취업 · EPS-TOPIK', bn: 'কোরিয়ায় চাকরি · EPS-TOPIK', en: 'Work in Korea · EPS-TOPIK' },
    greeting: {
      ko: '안녕하세요! 라힘이에요 💪\n한국 취업이나 EPS-TOPIK 준비, 함께해요!',
      bn: 'হ্যালো! আমি রাহিম 💪\nকোরিয়ায় চাকরি বা EPS-TOPIK নিয়ে কথা বলি!',
      en: "Hi! I'm Rahim 💪\nLet's talk about working in Korea or EPS-TOPIK!",
    },
    hints: {
      ko: ['EPS-TOPIK 준비 방법?', '한국 공장 월급이 얼마야?', 'E-9 비자 조건?'],
      bn: ['EPS-TOPIK প্রস্তুতি কীভাবে নেব?', 'কোরিয়ায় বেতন কত?', 'E-9 ভিসার শর্ত?'],
      en: ['How to prepare EPS-TOPIK?', 'Salary in Korea?', 'E-9 visa conditions?'],
    },
  },
  k_culture: {
    name: 'K-CULTURE', emoji: '🎵', char: '민지',
    color: '#EF4444', tagBg: 'rgba(239,68,68,0.12)',
    desc: { ko: 'K-POP · 한국 문화', bn: 'K-POP · কোরিয়ান সংস্কৃতি', en: 'K-POP · Korean Culture' },
    greeting: {
      ko: '안녕~~! 민지야 🌟\nK-POP이든 한식이든 뭐든 같이 얘기해~!',
      bn: 'হ্যালো~~! আমি মিনজি 🌟\nK-POP, কোরিয়ান খাবার — যেকোনো বিষয়ে কথা বলো!',
      en: "Hey~~! I'm Minji 🌟\nLet's talk K-POP, Korean food, anything!",
    },
    hints: {
      ko: ['요즘 BTS 소식?', '한국 꼭 먹어야 할 음식?', '한국어 빨리 배우는 팁?'],
      bn: ['BTS-এর সর্বশেষ খবর?', 'কোরিয়ায় কী খাব?', 'কোরিয়ান শেখার টিপস?'],
      en: ["What's new with BTS?", 'Must-try Korean foods?', 'Tips to learn Korean fast?'],
    },
  },
};

const LANG_LABEL: Record<Lang, string> = { ko: '한', bn: 'বাং', en: 'EN' };

const UI: Record<Lang, Record<string, string>> = {
  ko: { subtitle: '어떤 도움이 필요하세요?', placeholder: '메시지를 입력하세요…', send: '전송', change: '← 변경', online: '온라인', logout: '로그아웃', history: '대화기록', newChat: '새 대화', noHistory: '대화 기록이 없습니다', dashboard: '대시보드', vocab: '단어장', topik: 'TOPIK', eps: 'EPS', chatHistory: '기록', pricing: '요금제' },
  bn: { subtitle: 'আপনার কী সাহায্য দরকার?', placeholder: 'বার্তা লিখুন…', send: 'পাঠান', change: '← পরিবর্তন', online: 'অনলাইন', logout: 'লগআউট', history: 'ইতিহাস', newChat: 'নতুন চ্যাট', noHistory: 'কোনো ইতিহাস নেই', dashboard: 'ড্যাশবোর্ড', vocab: 'শব্দভান্ডার', topik: 'TOPIK', eps: 'EPS', chatHistory: 'ইতিহাস', pricing: 'মূল্য' },
  en: { subtitle: 'How can we help you?', placeholder: 'Type a message…', send: 'Send', change: '← Change', online: 'Online', logout: 'Logout', history: 'History', newChat: 'New Chat', noHistory: 'No history yet', dashboard: 'Dashboard', vocab: 'Vocab', topik: 'TOPIK', eps: 'EPS', chatHistory: 'History', pricing: 'Pricing' },
};

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: color, animation: 'dot-bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  );
}

function HintChips({ hints, color, onSelect }: { hints: string[]; color: string; onSelect: (h: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0 12px' }}>
      {hints.map(h => (
        <button key={h} type="button" onClick={() => onSelect(h)} style={{
          background: 'transparent', border: `1px solid ${color}55`,
          borderRadius: 99, color, fontSize: '12px',
          padding: '6px 12px', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
        }}>{h}</button>
      ))}
    </div>
  );
}

// ── 메인 화면 헤더 ─────────────────────────────────────────────────
function MenuHeader({ lang, setLang, userName, onHistory, onLogout, router, ui }: any) {
  const MENUS = [
    { icon: '📊', label: ui.dashboard,   path: '/dashboard', color: '#10B981' },
    { icon: '📚', label: ui.vocab,       path: '/vocabulary', color: '#0891B2' },
    { icon: '📝', label: ui.topik,       path: '/topik',      color: '#10B981' },
    { icon: '💼', label: ui.eps,         path: '/eps-topik',  color: '#F59E0B' },
    { icon: '💳', label: ui.pricing,     path: '/pricing',  color: '#F59E0B' },
    { icon: '📋', label: ui.chatHistory, path: null,          color: '#BAE6FD' },
  ];

  return (
    <header style={{ background: '#071336', borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, zIndex: 100 }}>

      {/* 1행: 로고 + 언어 + 사용자 */}
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#000' }}>K</div>
          <div>
            <div style={{ color: '#10B981', fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>K-BRIDGE</div>
            <div style={{ color: '#64748B', fontSize: 10 }}>AI Platform</div>
          </div>
        </div>

        {/* 오른쪽: 언어 + 이름 + 로그아웃 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* 언어 버튼 */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(Object.keys(LANG_LABEL) as Lang[]).map(l => (
              <button key={l} type="button" onClick={() => setLang(l)} style={{
                background: lang === l ? '#10B981' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${lang === l ? '#10B981' : '#334155'}`,
                borderRadius: 8, color: lang === l ? '#000' : '#10B981',
                padding: '5px 10px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Arial, sans-serif',
              }}>{LANG_LABEL[l]}</button>
            ))}
          </div>
          {/* 이름 */}
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B98133', borderRadius: 8, padding: '5px 10px', color: '#10B981', fontSize: 12, fontWeight: 600 }}>
            👤 {userName}
          </div>
          {/* 로그아웃 */}
          <button type="button" onClick={onLogout} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #EF444433',
            borderRadius: 8, padding: '5px 10px',
            color: '#EF4444', fontSize: 12, cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}>
            {ui.logout}
          </button>
        </div>
      </div>

      {/* 2행: 메뉴 아이콘 (크고 명확하게) */}
      <div style={{ padding: '0 12px 12px', display: 'flex', gap: 8 }}>
        {MENUS.map((m, i) => (
          <button
            key={i} type="button"
            onClick={() => m.path ? router.push(m.path) : onHistory()}
            style={{
              flex: 1,
              background: `${m.color}12`,
              border: `1.5px solid ${m.color}44`,
              borderRadius: 12,
              padding: '10px 4px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 24 }}>{m.icon}</span>
            <span style={{
              color: m.color, fontSize: 11, fontWeight: 700,
              textAlign: 'center', lineHeight: 1.2,
              wordBreak: 'keep-all',
            }}>{m.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

// ── 채팅 화면 헤더 (컴팩트) ────────────────────────────────────────
function ChatHeader({ lang, setLang, userName, onHistory, onLogout, onHome, ui }: any) {
  return (
    <header style={{ background: '#071336', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #1E293B' }}>
      <button type="button" onClick={onHome} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#000' }}>K</div>
        <span style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>K-BRIDGE</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {(Object.keys(LANG_LABEL) as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? '#10B981' : 'transparent',
              border: `1px solid ${lang === l ? '#10B981' : '#334155'}`,
              borderRadius: 6, color: lang === l ? '#000' : '#10B981',
              padding: '3px 7px', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Arial, sans-serif',
            }}>{LANG_LABEL[l]}</button>
          ))}
        </div>
        <button type="button" onClick={onHistory} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: 8, padding: '5px 9px', color: '#BAE6FD', fontSize: 14, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>📋</button>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B98133', borderRadius: 8, padding: '4px 9px', color: '#10B981', fontSize: 11, fontWeight: 600 }}>{userName}</div>
        <button type="button" onClick={onLogout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #EF444433', borderRadius: 8, padding: '4px 8px', color: '#EF4444', fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>↩</button>
      </div>
    </header>
  );
}

export default function Home() {
  const router = useRouter();
  const [vertical,    setVertical]    = useState<Vertical | ''>('');
  const [lang,        setLang]        = useState<Lang>('bn');
  const [userEmail,   setUserEmail]   = useState('');
  const [userName,    setUserName]    = useState('친구');
  const [chat,        setChat]        = useState<ChatEntry[]>([]);
  const [message,     setMessage]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [history,     setHistory]     = useState<{ role: string; content: string }[]>([]);
  const [convId,      setConvId]      = useState<number | null>(null);
  const [convList,    setConvList]    = useState<ConvSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [histLoading, setHistLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const v   = vertical ? VERTICALS[vertical] : null;
  const ui  = UI[lang];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setUserName(localStorage.getItem('user_name')   || '친구');
    setUserEmail(localStorage.getItem('user_email') || '');
    if (!localStorage.getItem('onboarding_done')) router.push('/onboarding');
  }, []);

  const loadHistoryData = useCallback(async () => {
    if (!userEmail) return;
    setHistLoading(true);
    try {
      const res  = await fetch(`${API}/conversations/user/${userEmail}`);
      const data = await res.json();
      setConvList(Array.isArray(data) ? data : []);
    } catch { setConvList([]); }
    setHistLoading(false);
  }, [userEmail]);

  useEffect(() => { if (showHistory && userEmail) loadHistoryData(); }, [showHistory, userEmail]);

  useEffect(() => {
    if (!vertical) return;
    setChat([{ role: 'ai', text: VERTICALS[vertical].greeting[lang], ts: new Date() }]);
    setHistory([]); setConvId(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [vertical]);

  useEffect(() => {
    if (vertical) {
      setChat([{ role: 'ai', text: VERTICALS[vertical].greeting[lang], ts: new Date() }]);
      setHistory([]); setConvId(null);
    }
  }, [lang]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, loading]);

  const loadConversation = async (id: number, vert: string) => {
    try {
      const res  = await fetch(`${API}/conversations/${id}`);
      const data = await res.json();
      setVertical(vert as Vertical);
      setConvId(id);
      setChat(data.messages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'ai', text: m.content, ts: new Date(m.created_at) })));
      setHistory(data.messages.map((m: any) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })));
      setShowHistory(false);
    } catch { alert('불러오지 못했습니다.'); }
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? message).trim();
    if (!msg || !vertical || loading) return;
    setMessage(''); setLoading(true);
    setChat(prev => [...prev, { role: 'user', text: msg, ts: new Date() }]);
    const newHistory = [...history, { role: 'user', content: msg }];
    try {
      const res  = await fetch(`${API}/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, vertical, user_name: userName, conversation_history: history }),
      });
      if (!res.ok) throw new Error();
      const data  = await res.json();
      const reply = data.response ?? '응답을 받지 못했습니다.';
      setChat(prev => [...prev, { role: 'ai', text: reply, ts: new Date() }]);
      const finalHistory = [...newHistory, { role: 'assistant', content: reply }];
      setHistory(finalHistory);
      if (!convId) {
        const sr = await fetch(`${API}/conversations/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: userEmail || 'guest@kbridge.app', vertical, character: VERTICALS[vertical].char, messages: [{ role: 'user', content: msg }, { role: 'assistant', content: reply }] }),
        });
        const saved = await sr.json();
        if (saved.id) setConvId(saved.id);
      } else {
        await fetch(`${API}/conversations/${convId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'user', content: msg }) });
        await fetch(`${API}/conversations/${convId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'assistant', content: reply }) });
      }
    } catch {
      setChat(prev => [...prev, { role: 'ai', text: '❌ সংযোগ সমস্যা। / 서버 연결 오류', ts: new Date() }]);
    }
    setLoading(false);
  }, [message, vertical, loading, userName, userEmail, lang, history, convId]);

  const handleKey    = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleLogout = () => { localStorage.clear(); router.push('/login'); };
  const startNewChat = () => { setVertical(''); setChat([]); setHistory([]); setConvId(null); setShowHistory(false); };
  const vertEmoji: Record<string, string> = { k_edu: '🎓', k_work: '💼', k_culture: '🎵' };

  const commonProps = { lang, setLang, userName, onHistory: () => setShowHistory(true), onLogout: handleLogout, ui };

  return (
    <div style={{ minHeight: '100dvh', maxWidth: 480, margin: '0 auto', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* 대화 기록 패널 */}
      {showHistory && (
        <>
          <div onClick={() => setShowHistory(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, height: '100dvh', background: '#071336', zIndex: 201, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>📋 {ui.history}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={startNewChat} style={{ background: '#10B981', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>+ {ui.newChat}</button>
                <button type="button" onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 8, padding: '7px 12px', color: '#64748B', cursor: 'pointer', fontSize: 14, fontFamily: 'Arial, sans-serif' }}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {histLoading ? (
                <div style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>불러오는 중...</div>
              ) : convList.length === 0 ? (
                <div style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>{ui.noHistory}</div>
              ) : convList.map(c => (
                <button key={c.id} type="button" onClick={() => loadConversation(c.id, c.vertical)} style={{
                  width: '100%', textAlign: 'left',
                  background: convId === c.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                  border: `1px solid ${convId === c.id ? '#10B981' : '#1E293B'}`,
                  borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>{vertEmoji[c.vertical] ?? '💬'}</span>
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{c.title}</span>
                  </div>
                  <div style={{ color: '#64748B', fontSize: 11 }}>{c.character} · {new Date(c.updated_at).toLocaleDateString('ko-KR')}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 화면별 헤더 */}
      {!vertical
        ? <MenuHeader {...commonProps} onHome={startNewChat} router={router} />
        : <ChatHeader {...commonProps} onHome={startNewChat} />
      }

      {/* 메인 화면 */}
      {!vertical && (
        <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🌏</div>
          <h1 style={{ color: 'white', fontSize: 18, marginBottom: 4, textAlign: 'center' }}>
            {lang === 'ko' ? `안녕하세요, ${userName}님! 👋` : lang === 'bn' ? `হ্যালো, ${userName}! 👋` : `Hello, ${userName}! 👋`}
          </h1>
          <p style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{ui.subtitle}</p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(Object.keys(VERTICALS) as Vertical[]).map(id => {
              const vd = VERTICALS[id];
              return (
                <button key={id} type="button" onClick={() => setVertical(id)} style={{
                  background: '#071336', border: `2px solid ${vd.color}`,
                  borderRadius: 16, padding: '16px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  textAlign: 'left', cursor: 'pointer', width: '100%',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  <span style={{ fontSize: 34 }}>{vd.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: vd.color, fontWeight: 700, fontSize: 14 }}>{vd.name}</div>
                    <div style={{ color: '#BAE6FD', fontSize: 12, marginTop: 2 }}>{vd.desc[lang]}</div>
                  </div>
                  <div style={{ background: vd.tagBg, border: `1px solid ${vd.color}44`, borderRadius: 10, padding: '4px 10px', textAlign: 'center' }}>
                    <div style={{ color: '#64748B', fontSize: 10 }}>AI</div>
                    <div style={{ color: vd.color, fontSize: 13, fontWeight: 600 }}>{vd.char}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 채팅 화면 */}
      {vertical && v && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#071336', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `2px solid ${v.color}` }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: v.tagBg, border: `2px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{v.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: v.color, fontWeight: 700, fontSize: 15 }}>{v.char}</span>
                <span style={{ color: '#64748B', fontSize: 12 }}>{v.name}</span>
                {convId && <span style={{ color: '#10B981', fontSize: 10, background: 'rgba(16,185,129,0.1)', padding: '2px 7px', borderRadius: 10 }}>💾 저장됨</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ color: '#10B981', fontSize: 11 }}>{ui.online}</span>
              </div>
            </div>
            <button type="button" onClick={startNewChat} style={{ background: 'transparent', border: `1px solid ${v.color}44`, borderRadius: 8, color: v.color, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
              {ui.change}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.length <= 1 && <HintChips hints={v.hints[lang]} color={v.color} onSelect={h => sendMessage(h)} />}
            {chat.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: c.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {c.role === 'ai' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: v.tagBg, border: `1px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 6, alignSelf: 'flex-end' }}>{v.emoji}</div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 13px',
                  borderRadius: c.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: c.role === 'user' ? v.color : '#071336',
                  color: 'white', fontSize: 14, lineHeight: 1.65,
                  border: c.role === 'ai' ? `1px solid ${v.color}33` : 'none',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {c.role === 'ai' && <div style={{ fontSize: 11, color: v.color, fontWeight: 700, marginBottom: 4 }}>{v.char}</div>}
                  {c.text}
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4, textAlign: 'right' }}>
                    {c.ts.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: v.tagBg, border: `1px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{v.emoji}</div>
                <div style={{ padding: '10px 14px', background: '#071336', border: `1px solid ${v.color}33`, borderRadius: '18px 18px 18px 4px' }}>
                  <TypingDots color={v.color} />
                </div>
              </div>
            )}
            <div ref={bottomRef} style={{ height: 8 }} />
          </div>

          <div style={{ padding: '10px 14px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', background: '#071336', borderTop: '1px solid #1E293B', display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef} value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey} placeholder={ui.placeholder} disabled={loading}
              style={{ flex: 1, background: '#0B1F4B', border: `1px solid ${v.color}55`, borderRadius: 99, padding: '11px 16px', color: 'white', fontSize: 14, outline: 'none' }}
            />
            <button type="button" onClick={() => sendMessage()} disabled={loading || !message.trim()} style={{
              background: loading || !message.trim() ? '#1E293B' : v.color,
              border: 'none', borderRadius: 99, padding: '11px 18px',
              color: loading || !message.trim() ? '#64748B' : '#000',
              fontWeight: 700, fontSize: 14, cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              {loading ? '…' : ui.send}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
