'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';
type Plan = 'free' | 'basic' | 'pro' | 'premium';

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    title: '요금제 선택', sub: '나에게 맞는 플랜을 선택하세요',
    current: '현재 플랜', popular: '인기', select: '선택하기',
    selected: '현재 사용 중', month: '/월', free: '무료',
    feature: '기능', goSubscribe: '구독하기', myPlan: '내 플랜',
    home: '홈으로', perDay: '일 회',
  },
  bn: {
    title: 'প্ল্যান নির্বাচন', sub: 'আপনার জন্য সঠিক প্ল্যান বেছে নিন',
    current: 'বর্তমান প্ল্যান', popular: 'জনপ্রিয়', select: 'নির্বাচন করুন',
    selected: 'বর্তমানে ব্যবহার হচ্ছে', month: '/মাস', free: 'বিনামূল্যে',
    feature: 'সুবিধা', goSubscribe: 'সাবস্ক্রাইব', myPlan: 'আমার প্ল্যান',
    home: 'হোম', perDay: 'বার/দিন',
  },
  en: {
    title: 'Choose Your Plan', sub: 'Select the plan that fits you best',
    current: 'Current Plan', popular: 'Popular', select: 'Select',
    selected: 'Currently Active', month: '/mo', free: 'Free',
    feature: 'Features', goSubscribe: 'Subscribe', myPlan: 'My Plan',
    home: 'Home', perDay: '/day',
  },
};

const PLANS: {
  id: Plan;
  price: number;
  color: string;
  popular: boolean;
  name: Record<Lang, string>;
  features: Record<Lang, string[]>;
}[] = [
  {
    id: 'free', price: 0, color: '#64748B', popular: false,
    name: { ko: 'Free', bn: 'ফ্রি', en: 'Free' },
    features: {
      ko: ['AI 대화 하루 10회', 'TOPIK 1급 샘플 5문제', '단어장 10개', '광고 포함'],
      bn: ['AI কথোপকথন দিনে ১০ বার', 'TOPIK ১ম গ্রেড ৫টি নমুনা', '১০টি শব্দ', 'বিজ্ঞাপন সহ'],
      en: ['10 AI chats/day', 'TOPIK Grade 1 (5 sample)', '10 vocabulary words', 'Ads included'],
    },
  },
  {
    id: 'basic', price: 9, color: '#0891B2', popular: false,
    name: { ko: 'Basic', bn: 'বেসিক', en: 'Basic' },
    features: {
      ko: ['AI 대화 하루 30회', 'TOPIK 1~3급 전체', '단어장 무제한', '광고 없음', '학습 진도 저장'],
      bn: ['AI কথোপকথন দিনে ৩০ বার', 'TOPIK ১-৩ম গ্রেড সম্পূর্ণ', 'শব্দ সীমাহীন', 'বিজ্ঞাপন নেই', 'শেখার অগ্রগতি সংরক্ষণ'],
      en: ['30 AI chats/day', 'TOPIK Grade 1-3 full', 'Unlimited vocabulary', 'No ads', 'Learning progress saved'],
    },
  },
  {
    id: 'pro', price: 19, color: '#10B981', popular: true,
    name: { ko: 'Pro', bn: 'প্রো', en: 'Pro' },
    features: {
      ko: ['AI 대화 무제한', 'TOPIK 1~6급 전체', '3개 AI 캐릭터', 'EPS-TOPIK 전체', '수준 진단 무제한', '개인화 커리큘럼', '광고 없음'],
      bn: ['AI কথোপকথন সীমাহীন', 'TOPIK ১-৬ম গ্রেড সম্পূর্ণ', '৩টি AI চরিত্র', 'EPS-TOPIK সম্পূর্ণ', 'স্তর নির্ণয় সীমাহীন', 'ব্যক্তিগত পাঠ্যক্রম', 'বিজ্ঞাপন নেই'],
      en: ['Unlimited AI chats', 'TOPIK Grade 1-6 full', '3 AI characters', 'EPS-TOPIK full', 'Unlimited level tests', 'Personalized curriculum', 'No ads'],
    },
  },
  {
    id: 'premium', price: 29, color: '#F59E0B', popular: false,
    name: { ko: 'Premium', bn: 'প্রিমিয়াম', en: 'Premium' },
    features: {
      ko: ['Pro 모든 기능 포함', '1:1 AI 코칭', '취업/유학 에이전트 연결', '실시간 문법 교정', '월 리포트 제공', '우선 고객 지원'],
      bn: ['প্রো-এর সব সুবিধা', '১:১ AI কোচিং', 'চাকরি/পড়াশোনা এজেন্ট সংযোগ', 'রিয়েল-টাইম ব্যাকরণ সংশোধন', 'মাসিক রিপোর্ট', 'অগ্রাধিকার সহায়তা'],
      en: ['All Pro features', '1:1 AI coaching', 'Job/study agent connection', 'Real-time grammar correction', 'Monthly report', 'Priority support'],
    },
  },
];

export default function PricingPage() {
  const router  = useRouter();
  const [lang,        setLang]        = useState<Lang>('bn');
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');

  useEffect(() => {
    try {
      const p = localStorage.getItem('user_plan') as Plan;
      if (p) setCurrentPlan(p);
    } catch {}
  }, []);

  const t = UI[lang];

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← {t.home}
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>💳 {t.title}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} style={{
              background: lang === l ? '#10B981' : 'transparent',
              border: '1px solid #10B981', borderRadius: 4,
              color: lang === l ? '#000' : '#10B981',
              padding: '3px 7px', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Arial, sans-serif',
            }}>
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 상단 안내 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
          <h1 style={{ color: 'white', fontSize: 18, marginBottom: 6 }}>{t.title}</h1>
          <p style={{ color: '#BAE6FD', fontSize: 13 }}>{t.sub}</p>
        </div>

        {/* 내 플랜 바로가기 */}
        <button type="button" onClick={() => router.push('/myplan')} style={{
          width: '100%', background: 'rgba(16,185,129,0.1)',
          border: '1px solid #10B981', borderRadius: 12,
          padding: '11px', color: '#10B981',
          fontWeight: 700, fontSize: 13, cursor: 'pointer',
          marginBottom: 20, fontFamily: 'Arial, sans-serif',
        }}>
          👤 {t.myPlan} →
        </button>

        {/* 플랜 카드 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PLANS.map(plan => {
            const isActive = currentPlan === plan.id;
            return (
              <div key={plan.id} style={{
                background: isActive ? `${plan.color}15` : '#071336',
                border: `2px solid ${isActive ? plan.color : plan.color + '44'}`,
                borderRadius: 18, padding: '18px 18px',
                position: 'relative',
              }}>
                {/* 인기 뱃지 */}
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -10, right: 16,
                    background: '#10B981', color: '#000',
                    fontSize: 11, fontWeight: 700, padding: '3px 12px',
                    borderRadius: 99,
                  }}>
                    ⭐ {t.popular}
                  </div>
                )}

                {/* 플랜 이름 + 가격 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ color: plan.color, fontSize: 20, fontWeight: 800 }}>{plan.name[lang]}</div>
                    {isActive && (
                      <div style={{ color: '#10B981', fontSize: 11, marginTop: 3 }}>✅ {t.current}</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {plan.price === 0 ? (
                      <div style={{ color: plan.color, fontSize: 24, fontWeight: 800 }}>{t.free}</div>
                    ) : (
                      <div>
                        <span style={{ color: plan.color, fontSize: 26, fontWeight: 800 }}>${plan.price}</span>
                        <span style={{ color: '#64748B', fontSize: 13 }}>{t.month}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 기능 목록 */}
                <div style={{ marginBottom: 16 }}>
                  {plan.features[lang].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: plan.color, fontSize: 14 }}>✓</span>
                      <span style={{ color: '#BAE6FD', fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* 버튼 */}
                {isActive ? (
                  <div style={{ background: `${plan.color}22`, border: `1px solid ${plan.color}`, borderRadius: 10, padding: '11px', textAlign: 'center', color: plan.color, fontWeight: 700, fontSize: 14 }}>
                    ✅ {t.selected}
                  </div>
                ) : (
                  <button type="button" onClick={() => {
                    if (plan.id === 'free') {
                      localStorage.setItem('user_plan', 'free');
                      setCurrentPlan('free');
                    } else {
                      router.push(`/subscribe?plan=${plan.id}`);
                    }
                  }} style={{
                    width: '100%', background: plan.color,
                    border: 'none', borderRadius: 10,
                    padding: '13px', color: plan.id === 'free' ? 'white' : '#000',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif',
                  }}>
                    {plan.id === 'free' ? t.select : `${t.goSubscribe} →`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <div style={{ background: '#071336', border: '1px solid #1E293B', borderRadius: 12, padding: 16, marginTop: 20, textAlign: 'center' }}>
          <div style={{ color: '#64748B', fontSize: 12, lineHeight: 1.6 }}>
            {lang === 'ko' && '언제든지 취소 가능 · 자동 갱신 · bKash & Stripe 결제 지원'}
            {lang === 'bn' && 'যেকোনো সময় বাতিল করুন · স্বয়ংক্রিয় নবায়ন · bKash ও Stripe সমর্থিত'}
            {lang === 'en' && 'Cancel anytime · Auto-renewal · bKash & Stripe supported'}
          </div>
        </div>
      </div>
    </div>
  );
}
