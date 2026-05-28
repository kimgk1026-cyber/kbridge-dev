'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';
type Plan = 'free' | 'basic' | 'pro' | 'premium';

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    title: '내 플랜', current: '현재 구독 중', expire: '만료일',
    usage: '이번 달 사용량', chatUsed: 'AI 대화', chatLimit: '일 한도',
    upgrade: '업그레이드', change: '플랜 변경', cancel: '구독 취소',
    cancelConfirm: '정말 취소하실 건가요?', yes: '예, 취소합니다', no: '아니요',
    freePlan: '무료 플랜 사용 중', home: '홈으로',
    benefit: '현재 플랜 혜택', unlimited: '무제한', perDay: '회/일',
    cancelDone: '구독이 취소됐어요. Free 플랜으로 변경됩니다.',
  },
  bn: {
    title: 'আমার প্ল্যান', current: 'বর্তমান সাবস্ক্রিপশন', expire: 'মেয়াদ শেষ',
    usage: 'এই মাসের ব্যবহার', chatUsed: 'AI কথোপকথন', chatLimit: 'দৈনিক সীমা',
    upgrade: 'আপগ্রেড', change: 'প্ল্যান পরিবর্তন', cancel: 'সাবস্ক্রিপশন বাতিল',
    cancelConfirm: 'সত্যিই বাতিল করবেন?', yes: 'হ্যাঁ, বাতিল করুন', no: 'না',
    freePlan: 'ফ্রি প্ল্যান ব্যবহার হচ্ছে', home: 'হোম',
    benefit: 'বর্তমান প্ল্যানের সুবিধা', unlimited: 'সীমাহীন', perDay: 'বার/দিন',
    cancelDone: 'সাবস্ক্রিপশন বাতিল হয়েছে। ফ্রি প্ল্যানে ফিরে যাবেন।',
  },
  en: {
    title: 'My Plan', current: 'Current Subscription', expire: 'Expires',
    usage: 'This Month Usage', chatUsed: 'AI Chats', chatLimit: 'Daily Limit',
    upgrade: 'Upgrade', change: 'Change Plan', cancel: 'Cancel Subscription',
    cancelConfirm: 'Are you sure you want to cancel?', yes: 'Yes, Cancel', no: 'No',
    freePlan: 'Using Free Plan', home: 'Home',
    benefit: 'Current Plan Benefits', unlimited: 'Unlimited', perDay: '/day',
    cancelDone: 'Subscription cancelled. Switching to Free plan.',
  },
};

const PLAN_INFO: Record<Plan, {
  color: string; price: number;
  name: Record<Lang, string>;
  chatLimit: number | 'unlimited';
  benefits: Record<Lang, string[]>;
}> = {
  free: {
    color: '#64748B', price: 0,
    name: { ko: 'Free', bn: 'ফ্রি', en: 'Free' },
    chatLimit: 10,
    benefits: {
      ko: ['AI 대화 하루 10회', 'TOPIK 1급 샘플', '단어장 10개', '광고 포함'],
      bn: ['AI কথোপকথন দিনে ১০ বার', 'TOPIK ১ম গ্রেড নমুনা', '১০টি শব্দ', 'বিজ্ঞাপন সহ'],
      en: ['10 AI chats/day', 'TOPIK Grade 1 sample', '10 vocabulary', 'Ads included'],
    },
  },
  basic: {
    color: '#0891B2', price: 9,
    name: { ko: 'Basic', bn: 'বেসিক', en: 'Basic' },
    chatLimit: 30,
    benefits: {
      ko: ['AI 대화 하루 30회', 'TOPIK 1~3급 전체', '단어장 무제한', '광고 없음'],
      bn: ['AI কথোপকথন দিনে ৩০ বার', 'TOPIK ১-৩ম সম্পূর্ণ', 'শব্দ সীমাহীন', 'বিজ্ঞাপন নেই'],
      en: ['30 AI chats/day', 'TOPIK Grade 1-3 full', 'Unlimited vocabulary', 'No ads'],
    },
  },
  pro: {
    color: '#10B981', price: 19,
    name: { ko: 'Pro', bn: 'প্রো', en: 'Pro' },
    chatLimit: 'unlimited',
    benefits: {
      ko: ['AI 대화 무제한', 'TOPIK 1~6급 전체', '3개 AI 캐릭터', 'EPS-TOPIK 전체', '개인화 커리큘럼'],
      bn: ['AI কথোপকথন সীমাহীন', 'TOPIK ১-৬ম সম্পূর্ণ', '৩টি AI চরিত্র', 'EPS-TOPIK সম্পূর্ণ', 'ব্যক্তিগত পাঠ্যক্রম'],
      en: ['Unlimited AI chats', 'TOPIK Grade 1-6 full', '3 AI characters', 'EPS-TOPIK full', 'Personalized curriculum'],
    },
  },
  premium: {
    color: '#F59E0B', price: 29,
    name: { ko: 'Premium', bn: 'প্রিমিয়াম', en: 'Premium' },
    chatLimit: 'unlimited',
    benefits: {
      ko: ['Pro 모든 기능', '1:1 AI 코칭', '취업/유학 에이전트 연결', '실시간 문법 교정', '우선 고객 지원'],
      bn: ['প্রো-এর সব সুবিধা', '১:১ AI কোচিং', 'এজেন্ট সংযোগ', 'রিয়েল-টাইম সংশোধন', 'অগ্রাধিকার সহায়তা'],
      en: ['All Pro features', '1:1 AI coaching', 'Agent connection', 'Real-time correction', 'Priority support'],
    },
  },
};

export default function MyPlanPage() {
  const router = useRouter();
  const [lang,      setLang]      = useState<Lang>('bn');
  const [plan,      setPlan]      = useState<Plan>('free');
  const [expire,    setExpire]    = useState('');
  const [chatToday, setChatToday] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelled,  setCancelled]  = useState(false);

  useEffect(() => {
    try {
      const p = localStorage.getItem('user_plan') as Plan || 'free';
      const e = localStorage.getItem('plan_expire') || '';
      const c = parseInt(localStorage.getItem('chat_count_today') || '0');
      setPlan(p);
      setExpire(e);
      setChatToday(c);
    } catch {}
  }, []);

  const t    = UI[lang];
  const info = PLAN_INFO[plan];
  const chatLimit = info.chatLimit;
  const chatPct = chatLimit === 'unlimited' ? 0 : Math.round((chatToday / (chatLimit as number)) * 100);

  const handleCancel = () => {
    try {
      localStorage.setItem('user_plan', 'free');
      localStorage.removeItem('plan_expire');
    } catch {}
    setPlan('free');
    setExpire('');
    setShowCancel(false);
    setCancelled(true);
    setTimeout(() => setCancelled(false), 3000);
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${info.color}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: info.color, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← {t.home}
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>👤 {t.title}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? info.color : 'transparent',
              border: `1px solid ${info.color}`, borderRadius: 4,
              color: lang === l ? '#000' : info.color,
              padding: '3px 7px', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Arial, sans-serif',
            }}>
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 취소 완료 메시지 */}
        {cancelled && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10B981', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#10B981', fontSize: 13 }}>
            ✅ {t.cancelDone}
          </div>
        )}

        {/* 현재 플랜 카드 */}
        <div style={{
          background: `linear-gradient(135deg, #071336, ${info.color}18)`,
          border: `2px solid ${info.color}`,
          borderRadius: 20, padding: '20px 18px', marginBottom: 16,
        }}>
          <div style={{ color: '#64748B', fontSize: 12, marginBottom: 4 }}>
            {plan === 'free' ? t.freePlan : t.current}
          </div>
          <div style={{ color: info.color, fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            {info.name[lang]}
          </div>
          {plan !== 'free' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ color: info.color, fontSize: 20, fontWeight: 700 }}>
                ${info.price}<span style={{ color: '#64748B', fontSize: 13 }}>/월</span>
              </div>
              {expire && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#64748B', fontSize: 11 }}>{t.expire}</div>
                  <div style={{ color: '#BAE6FD', fontSize: 13 }}>
                    {new Date(expire).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 사용량 */}
        <div style={{ background: '#071336', border: '1px solid #1E293B', borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ color: 'white', fontWeight: 700, marginBottom: 12 }}>📊 {t.usage}</div>
          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#BAE6FD', fontSize: 13 }}>💬 {t.chatUsed}</span>
            <span style={{ color: info.color, fontSize: 13, fontWeight: 700 }}>
              {chatToday} / {chatLimit === 'unlimited' ? t.unlimited : `${chatLimit}${t.perDay}`}
            </span>
          </div>
          {chatLimit !== 'unlimited' && (
            <div style={{ background: '#1E293B', borderRadius: 99, height: 8, overflow: 'hidden' }}>
              <div style={{ background: chatPct >= 80 ? '#EF4444' : info.color, borderRadius: 99, height: 8, width: `${Math.min(chatPct, 100)}%`, transition: 'width 0.5s' }} />
            </div>
          )}
          {chatLimit === 'unlimited' && (
            <div style={{ color: '#10B981', fontSize: 12, marginTop: 4 }}>♾️ {t.unlimited}</div>
          )}
        </div>

        {/* 현재 플랜 혜택 */}
        <div style={{ background: '#071336', border: '1px solid #1E293B', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ color: 'white', fontWeight: 700, marginBottom: 12 }}>⭐ {t.benefit}</div>
          {info.benefits[lang].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: info.color }}>✓</span>
              <span style={{ color: '#BAE6FD', fontSize: 13 }}>{b}</span>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => router.push('/pricing')} style={{
            width: '100%', background: info.color, border: 'none',
            borderRadius: 12, padding: '14px', color: plan === 'free' ? 'white' : '#000',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            fontFamily: 'Arial, sans-serif',
          }}>
            {plan === 'free' ? `🚀 ${t.upgrade}` : `💳 ${t.change}`}
          </button>

          {plan !== 'free' && (
            <button type="button" onClick={() => setShowCancel(true)} style={{
              width: '100%', background: 'transparent',
              border: '1px solid #EF4444', borderRadius: 12,
              padding: '12px', color: '#EF4444',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              ❌ {t.cancel}
            </button>
          )}
        </div>

        {/* 취소 확인 모달 */}
        {showCancel && (
          <>
            <div onClick={() => setShowCancel(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#071336', border: '1px solid #EF4444',
              borderRadius: 20, padding: '24px 20px',
              width: '90%', maxWidth: 360, zIndex: 201,
            }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>😢</div>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>{t.cancelConfirm}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowCancel(false)} style={{
                  flex: 1, background: '#10B981', border: 'none', borderRadius: 10,
                  padding: 12, color: '#000', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                }}>
                  {t.no}
                </button>
                <button type="button" onClick={handleCancel} style={{
                  flex: 1, background: 'transparent', border: '1px solid #EF4444',
                  borderRadius: 10, padding: 12, color: '#EF4444',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'Arial, sans-serif',
                }}>
                  {t.yes}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
