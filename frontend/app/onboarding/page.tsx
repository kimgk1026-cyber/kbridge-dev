'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Lang = 'ko' | 'bn' | 'en';
type Step = 1 | 2 | 3;

const COUNTRIES = [
  { value: 'BD', flag: '🇧🇩', name: { ko: '방글라데시', bn: 'বাংলাদেশ', en: 'Bangladesh' } },
  { value: 'KH', flag: '🇰🇭', name: { ko: '캄보디아', bn: 'কম্বোডিয়া', en: 'Cambodia' } },
  { value: 'VN', flag: '🇻🇳', name: { ko: '베트남', bn: 'ভিয়েতনাম', en: 'Vietnam' } },
  { value: 'PH', flag: '🇵🇭', name: { ko: '필리핀', bn: 'ফিলিপাইন', en: 'Philippines' } },
  { value: 'ID', flag: '🇮🇩', name: { ko: '인도네시아', bn: 'ইন্দোনেশিয়া', en: 'Indonesia' } },
  { value: 'UZ', flag: '🇺🇿', name: { ko: '우즈베키스탄', bn: 'উজবেকিস্তান', en: 'Uzbekistan' } },
];

const PURPOSES = [
  {
    value: 'k_edu',
    emoji: '🎓',
    name: { ko: '한국 유학', bn: 'কোরিয়ায় পড়াশোনা', en: 'Study in Korea' },
    desc: { ko: 'TOPIK 준비 · 대학 입학', bn: 'TOPIK প্রস্তুতি · বিশ্ববিদ্যালয়', en: 'TOPIK Prep · University' },
    char: '지수', color: '#0891B2',
  },
  {
    value: 'k_work',
    emoji: '💼',
    name: { ko: '한국 취업', bn: 'কোরিয়ায় চাকরি', en: 'Work in Korea' },
    desc: { ko: 'EPS-TOPIK · 공장/농장', bn: 'EPS-TOPIK · কারখানা/খামার', en: 'EPS-TOPIK · Factory/Farm' },
    char: '라힘', color: '#F59E0B',
  },
  {
    value: 'k_culture',
    emoji: '🎵',
    name: { ko: 'K-POP · 한국 문화', bn: 'K-POP · কোরিয়ান সংস্কৃতি', en: 'K-POP · Korean Culture' },
    desc: { ko: '한식 · 음악 · 엔터테인먼트', bn: 'কোরিয়ান খাবার · সঙ্গীত', en: 'Food · Music · Entertainment' },
    char: '민지', color: '#EF4444',
  },
];

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    welcome: 'K-BRIDGE에 오신 것을 환영합니다!',
    sub: '한국으로 가는 여정을 함께해요',
    step1Title: '어느 나라에서 오셨나요?',
    step2Title: '한국에 오는 목적이 무엇인가요?',
    step3Title: '나의 AI 파트너',
    step3Sub: '이 친구가 여러분을 도와드릴 거예요!',
    next: '다음',
    start: '시작하기',
    back: '이전',
  },
  bn: {
    welcome: 'K-BRIDGE-এ স্বাগতম!',
    sub: 'কোরিয়ায় যাওয়ার যাত্রা একসাথে করি',
    step1Title: 'আপনি কোন দেশ থেকে এসেছেন?',
    step2Title: 'কোরিয়ায় আসার উদ্দেশ্য কী?',
    step3Title: 'আমার AI পার্টনার',
    step3Sub: 'এই বন্ধু আপনাকে সাহায্য করবে!',
    next: 'পরবর্তী',
    start: 'শুরু করুন',
    back: 'পূর্ববর্তী',
  },
  en: {
    welcome: 'Welcome to K-BRIDGE!',
    sub: "Let's journey to Korea together",
    step1Title: 'Which country are you from?',
    step2Title: 'What is your purpose in Korea?',
    step3Title: 'My AI Partner',
    step3Sub: 'This friend will help you!',
    next: 'Next',
    start: 'Get Started',
    back: 'Back',
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [lang,    setLang]    = useState<Lang>('bn');
  const [step,    setStep]    = useState<Step>(1);
  const [country, setCountry] = useState('');
  const [purpose, setPurpose] = useState('');

  const t = UI[lang];
  const selectedPurpose = PURPOSES.find(p => p.value === purpose);

  const handleNext = () => {
    if (step === 1 && !country) return;
    if (step === 2 && !purpose) return;
    if (step === 3) {
      // 온보딩 완료 저장
      localStorage.setItem('onboarding_done',    'true');
      localStorage.setItem('user_country',        country);
      localStorage.setItem('user_purpose',        purpose);
      router.push('/');
      return;
    }
    setStep(prev => (prev + 1) as Step);
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#0B1F4B',
      fontFamily: 'Arial, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1E293B',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: '#000',
          }}>K</div>
          <span style={{ color: '#10B981', fontWeight: 700, fontSize: 16 }}>K-BRIDGE</span>
        </div>
        {/* 언어 버튼 */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['ko', 'bn', 'en'] as Lang[]).map(l => (
            <button
              key={l} type="button"
              onClick={() => setLang(l)}
              style={{
                background: lang === l ? '#10B981' : 'transparent',
                border: '1px solid #10B981', borderRadius: 4,
                color: lang === l ? '#000' : '#10B981',
                padding: '2px 7px', fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l === 'ko' ? '한' : l === 'bn' ? 'বাং' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      {/* 진행 바 */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: s <= step ? '#10B981' : '#1E293B',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 16px', maxWidth: 480, margin: '0 auto', width: '100%' }}>

        {/* Step 1 — 국가 선택 */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌏</div>
              <h1 style={{ color: 'white', fontSize: 20, marginBottom: 6 }}>{t.welcome}</h1>
              <p style={{ color: '#BAE6FD', fontSize: 14 }}>{t.sub}</p>
            </div>
            <h2 style={{ color: 'white', fontSize: 16, marginBottom: 16 }}>{t.step1Title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {COUNTRIES.map(c => (
                <button
                  key={c.value} type="button"
                  onClick={() => setCountry(c.value)}
                  style={{
                    background: country === c.value ? 'rgba(16,185,129,0.15)' : '#071336',
                    border: `2px solid ${country === c.value ? '#10B981' : '#1E293B'}`,
                    borderRadius: 12, padding: '14px 16px',
                    color: 'white', fontSize: 16,
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{c.flag}</span>
                  <span style={{ fontWeight: country === c.value ? 700 : 400, color: country === c.value ? '#10B981' : 'white' }}>
                    {c.name[lang]}
                  </span>
                  {country === c.value && <span style={{ marginLeft: 'auto', color: '#10B981' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — 목적 선택 */}
        {step === 2 && (
          <div>
            <h2 style={{ color: 'white', fontSize: 16, marginBottom: 20 }}>{t.step2Title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PURPOSES.map(p => (
                <button
                  key={p.value} type="button"
                  onClick={() => setPurpose(p.value)}
                  style={{
                    background: purpose === p.value ? `${p.color}20` : '#071336',
                    border: `2px solid ${purpose === p.value ? p.color : '#1E293B'}`,
                    borderRadius: 16, padding: '18px 16px',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14,
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 36 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: purpose === p.value ? p.color : 'white', fontWeight: 700, fontSize: 15 }}>
                      {p.name[lang]}
                    </div>
                    <div style={{ color: '#BAE6FD', fontSize: 12, marginTop: 3 }}>
                      {p.desc[lang]}
                    </div>
                  </div>
                  {purpose === p.value && (
                    <span style={{ color: p.color, fontSize: 18 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — AI 파트너 소개 */}
        {step === 3 && selectedPurpose && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>{t.step3Title}</h2>
            <p style={{ color: '#BAE6FD', fontSize: 14, marginBottom: 28 }}>{t.step3Sub}</p>
            <div style={{
              background: '#071336',
              border: `2px solid ${selectedPurpose.color}`,
              borderRadius: 20, padding: 28,
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>{selectedPurpose.emoji}</div>
              <div style={{ color: selectedPurpose.color, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {selectedPurpose.char}
              </div>
              <div style={{ color: 'white', fontSize: 16, marginBottom: 6 }}>
                {selectedPurpose.name[lang]}
              </div>
              <div style={{ color: '#BAE6FD', fontSize: 13 }}>
                {selectedPurpose.desc[lang]}
              </div>
            </div>
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid #10B981',
              borderRadius: 12, padding: 16,
              color: '#BAE6FD', fontSize: 13, lineHeight: 1.7,
            }}>
              {lang === 'ko' && `안녕하세요! 저는 ${selectedPurpose.char}이에요.\n여러분의 한국 생활을 도와드릴게요! 😊`}
              {lang === 'bn' && `হ্যালো! আমি ${selectedPurpose.char}।\nআপনার কোরিয়া জীবনে সাহায্য করব! 😊`}
              {lang === 'en' && `Hello! I'm ${selectedPurpose.char}.\nI'll help you with your Korean journey! 😊`}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(prev => (prev - 1) as Step)}
              style={{
                flex: 1, background: 'transparent',
                border: '1px solid #334155', borderRadius: 12,
                padding: 14, color: '#BAE6FD',
                fontSize: 15, cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              ← {t.back}
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === 1 && !country) ||
              (step === 2 && !purpose)
            }
            style={{
              flex: 2,
              background: (step === 1 && !country) || (step === 2 && !purpose)
                ? '#1E293B' : '#10B981',
              border: 'none', borderRadius: 12,
              padding: 14,
              color: (step === 1 && !country) || (step === 2 && !purpose)
                ? '#64748B' : '#000',
              fontSize: 15, fontWeight: 700,
              cursor: (step === 1 && !country) || (step === 2 && !purpose)
                ? 'not-allowed' : 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {step === 3 ? t.start : t.next + ' →'}
          </button>
        </div>
      </div>
    </div>
  );
}
