'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Vertical  = 'k_edu' | 'k_work' | 'k_culture';
type Lang      = 'ko' | 'bn' | 'en';
type ChatEntry = { role: 'user' | 'ai'; text: string; ts: Date };
type ConvSummary = { id: number; title: string; vertical: string; character: string; updated_at: string };

const API = 'http://localhost:8000';

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
    desc: {
      ko: '한국 유학 · TOPIK 준비',
      bn: 'কোরিয়ায় পড়াশোনা · TOPIK',
      en: 'Study in Korea · TOPIK',
    },
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
    desc: {
      ko: '한국 취업 · EPS-TOPIK',
      bn: 'কোরিয়ায় চাকরি · EPS-TOPIK',
      en: 'Work in Korea · EPS-TOPIK',
    },
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
    desc: {
      ko: 'K-POP · 한국 문화',
      bn: 'K-POP · কোরিয়ান সংস্কৃতি',
      en: 'K-POP · Korean Culture',
    },
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

const UI: Record<Lang, {
  subtitle: string; placeholder: string; send: string;
  change: string; online: string; logout: string;
  history: string; newChat: string; noHistory: string;
  topik: string; vocab: string;
}> = {
  ko: { subtitle: '어떤 도움이 필요하세요?', placeholder: '메시지를 입력하세요…', send: '전송', change: '변경', online: '온라인', logout: '로그아웃', history: '대화 기록', newChat: '새 대화', noHistory: '대화 기록이 없습니다', topik: 'TOPIK', vocab: '단어장' },
  bn: { subtitle: 'আপনার কী সাহায্য দরকার?', placeholder: 'বার্তা লিখুন…', send: 'পাঠান', change: 'পরিবর্তন', online: 'অনলাইন', logout: 'লগআউট', history: 'কথোপকথন', newChat: 'নতুন চ্যাট', noHistory: 'কোনো ইতিহাস নেই', topik: 'TOPIK', vocab: 'শব্দভান্ডার' },
  en: { subtitle: 'How can we help you?', placeholder: 'Type a message…', send: 'Send', change: 'Change', online: 'Online', logout: 'Logout', history: 'History', newChat: 'New Chat', noHistory: 'No history yet', topik: 'TOPIK', vocab: 'Vocabulary' },
};

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: color,
          animation: 'dot-bounce 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.16}s`,
        }} />
      ))}
    </div>
  );
}

function HintChips({ hints, color, onSelect }: { hints: string[]; color: string; onSelect: (h: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '4px 0 12px' }}>
      {hints.map(h => (
        <button key={h} onClick={() => onSelect(h)} style={{
          background: 'transparent', border: `1px solid ${color}55`,
          borderRadius: 99, color, fontSize: '12px',
          padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit',
        }}>{h}</button>
      ))}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [vertical,    setVertical]    = useState<Vertical | ''>('');
  const [lang,        setLang]        = useState<Lang>('bn'); // 기본값: 벵골어
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
    const savedName  = localStorage.getItem('user_name');
    const savedEmail = localStorage.getItem('user_email');
    if (savedName)  setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!userEmail) return;
    setHistLoading(true);
    try {
      const res  = await fetch(`${API}/conversations/user/${userEmail}`);
      const data = await res.json();
      setConvList(Array.isArray(data) ? data : []);
    } catch { setConvList([]); }
    setHistLoading(false);
  }, [userEmail]);

  useEffect(() => {
    if (showHistory && userEmail) loadHistory();
  }, [showHistory, userEmail]);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const loadConversation = async (id: number, vert: string) => {
    try {
      const res  = await fetch(`${API}/conversations/${id}`);
      const data = await res.json();
      setVertical(vert as Vertical);
      setConvId(id);
      setChat(data.messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'ai',
        text: m.content,
        ts:   new Date(m.created_at),
      })));
      setHistory(data.messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      })));
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, vertical, user_name: userName || '친구', conversation_history: history }),
      });
      if (!res.ok) throw new Error();
      const data  = await res.json();
      const reply = data.response ?? '응답을 받지 못했습니다.';
      setChat(prev => [...prev, { role: 'ai', text: reply, ts: new Date() }]);
      const finalHistory = [...newHistory, { role: 'assistant', content: reply }];
      setHistory(finalHistory);
      if (!convId) {
        const saveRes = await fetch(`${API}/conversations/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: userEmail || 'guest@kbridge.app',
            vertical, character: VERTICALS[vertical].char,
            messages: [
              { role: 'user', content: msg },
              { role: 'assistant', content: reply },
            ],
          }),
        });
        const saved = await saveRes.json();
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

  return (
    <div style={{ minHeight: '100dvh', maxWidth: 480, margin: '0 auto', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* 대화 기록 패널 */}
      {showHistory && (
        <>
          <div onClick={() => setShowHistory(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, height: '100dvh', background: '#071336', zIndex: 201, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700 }}>📋 {ui.history}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={startNewChat} style={{ background: '#10B981', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ {ui.newChat}</button>
                <button onClick={() => setShowHistory(false)} style={{ background: 'transparent', border: '1px solid #1E293B', borderRadius: 8, padding: '6px 10px', color: '#64748B', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {histLoading ? (
                <div style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>불러오는 중...</div>
              ) : convList.length === 0 ? (
                <div style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>{ui.noHistory}</div>
              ) : convList.map(c => (
                <button key={c.id} onClick={() => loadConversation(c.id, c.vertical)} style={{
                  width: '100%', textAlign: 'left',
                  background: convId === c.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                  border: `1px solid ${convId === c.id ? '#10B981' : '#1E293B'}`,
                  borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer',
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

      {/* 헤더 */}
      <header style={{ background: '#071336', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #1E293B' }}>
        <button onClick={startNewChat} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#000' }}>K</div>
          <span style={{ color: '#10B981', fontWeight: 700, fontSize: 15 }}>K-BRIDGE</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {/* 언어 3개만 */}
          <div style={{ display: 'flex', gap: 3 }}>
            {(Object.keys(LANG_LABEL) as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                background: lang === l ? '#10B981' : 'transparent',
                border: '1px solid #10B981', borderRadius: 4,
                color: lang === l ? '#000' : '#10B981',
                padding: '2px 6px', fontSize: '11px', fontWeight: 700,
              }}>{LANG_LABEL[l]}</button>
            ))}
          </div>
          <button onClick={() => router.push('/vocabulary')} style={{ background: 'transparent', border: '1px solid #1E293B', borderRadius: 6, color: '#BAE6FD', padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>📚</button>
          <button onClick={() => router.push('/topik')} style={{ background: 'transparent', border: '1px solid #1E293B', borderRadius: 6, color: '#BAE6FD', padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>📝</button>
          <button onClick={() => setShowHistory(true)} style={{ background: 'transparent', border: '1px solid #1E293B', borderRadius: 6, color: '#BAE6FD', padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>📋</button>
          <div style={{ background: '#0B1F4B', border: '1px solid #1E293B', borderRadius: 8, padding: '3px 8px', color: '#10B981', fontSize: 11, fontWeight: 600 }}>{userName}</div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #1E293B', borderRadius: 6, color: '#64748B', padding: '3px 7px', fontSize: 11, cursor: 'pointer' }}>↩</button>
        </div>
      </header>

      {/* 버티컬 선택 */}
      {!vertical && (
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🌏</div>
          <h1 style={{ color: 'white', fontSize: 20, marginBottom: 4, textAlign: 'center' }}>
            {lang === 'ko' ? `안녕하세요, ${userName}님! 👋` : lang === 'bn' ? `হ্যালো, ${userName}! 👋` : `Hello, ${userName}! 👋`}
          </h1>
          <p style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>{ui.subtitle}</p>

          {/* 학습 바로가기 */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, width: '100%' }}>
            <button onClick={() => router.push('/vocabulary')} style={{ flex: 1, background: '#071336', border: '1px solid #0891B2', borderRadius: 12, padding: '12px 8px', color: '#0891B2', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              📚 {ui.vocab}
            </button>
            <button onClick={() => router.push('/topik')} style={{ flex: 1, background: '#071336', border: '1px solid #F59E0B', borderRadius: 12, padding: '12px 8px', color: '#F59E0B', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              📝 {ui.topik}
            </button>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(Object.keys(VERTICALS) as Vertical[]).map(id => {
              const vd = VERTICALS[id];
              return (
                <button key={id} onClick={() => setVertical(id)} style={{
                  background: '#071336', border: `2px solid ${vd.color}`,
                  borderRadius: 16, padding: '16px 14px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  textAlign: 'left', cursor: 'pointer', width: '100%',
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

      {/* 채팅 */}
      {vertical && v && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: '#071336', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `2px solid ${v.color}` }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: v.tagBg, border: `2px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{v.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: v.color, fontWeight: 700, fontSize: 14 }}>{v.char}</span>
                <span style={{ color: '#64748B', fontSize: 11 }}>{v.name}</span>
                {convId && <span style={{ color: '#10B981', fontSize: 10, background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 10 }}>💾</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ color: '#10B981', fontSize: 11 }}>{ui.online}</span>
              </div>
            </div>
            <button onClick={startNewChat} style={{ background: 'transparent', border: '1px solid #1E293B', borderRadius: 8, color: '#64748B', padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>{ui.change}</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.length <= 1 && <HintChips hints={v.hints[lang]} color={v.color} onSelect={h => sendMessage(h)} />}
            {chat.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: c.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {c.role === 'ai' && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: v.tagBg, border: `1px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginRight: 6, alignSelf: 'flex-end' }}>{v.emoji}</div>
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
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: v.tagBg, border: `1px solid ${v.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{v.emoji}</div>
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
              style={{ flex: 1, background: '#0B1F4B', border: `1px solid ${v.color}55`, borderRadius: 99, padding: '10px 14px', color: 'white', fontSize: 14, outline: 'none' }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !message.trim()} style={{
              background: loading || !message.trim() ? '#1E293B' : v.color,
              border: 'none', borderRadius: 99, padding: '10px 16px',
              color: loading || !message.trim() ? '#64748B' : '#000',
              fontWeight: 700, fontSize: 14, cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
            }}>
              {loading ? '…' : ui.send}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
