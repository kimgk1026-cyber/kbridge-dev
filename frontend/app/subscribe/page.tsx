'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Lang   = 'ko' | 'bn' | 'en';
type Method = 'bkash' | 'stripe';
type Plan   = 'basic' | 'pro' | 'premium';

const PLAN_INFO: Record<Plan, { price: number; color: string; name: Record<Lang, string> }> = {
  basic:   { price: 9,  color: '#0891B2', name: { ko: 'Basic', bn: 'বেসিক', en: 'Basic' } },
  pro:     { price: 19, color: '#10B981', name: { ko: 'Pro',   bn: 'প্রো',  en: 'Pro'   } },
  premium: { price: 29, color: '#F59E0B', name: { ko: 'Premium', bn: 'প্রিমিয়াম', en: 'Premium' } },
};

const UI: Record<Lang, Record<string, string>> = {
  ko: {
    title: '결제하기', method: '결제 방법 선택', bkashDesc: '방글라데시 모바일 결제',
    stripeDesc: '글로벌 카드 결제', phone: '휴대폰 번호', pin: 'bKash PIN (4자리)',
    card: '카드 번호', expiry: '만료일 (MM/YY)', cvc: 'CVC',
    name: '카드 소유자 이름', pay: '결제하기', cancel: '취소',
    processing: '결제 처리 중...', success: '결제 완료!', successMsg: '구독이 활성화됐어요!',
    goHome: '홈으로', total: '결제 금액', month: '/월',
    agree: '개인정보 처리 및 자동 갱신에 동의합니다',
    demoNote: '⚠️ 데모 모드: 실제 결제가 이루어지지 않아요',
  },
  bn: {
    title: 'পেমেন্ট', method: 'পেমেন্ট পদ্ধতি নির্বাচন', bkashDesc: 'বাংলাদেশ মোবাইল পেমেন্ট',
    stripeDesc: 'গ্লোবাল কার্ড পেমেন্ট', phone: 'মোবাইল নম্বর', pin: 'bKash PIN (৪ সংখ্যা)',
    card: 'কার্ড নম্বর', expiry: 'মেয়াদ শেষ (MM/YY)', cvc: 'CVC',
    name: 'কার্ডধারীর নাম', pay: 'পেমেন্ট করুন', cancel: 'বাতিল',
    processing: 'পেমেন্ট প্রক্রিয়া হচ্ছে...', success: 'পেমেন্ট সম্পন্ন!', successMsg: 'সাবস্ক্রিপশন সক্রিয় হয়েছে!',
    goHome: 'হোম', total: 'মোট', month: '/মাস',
    agree: 'গোপনীয়তা নীতি ও স্বয়ংক্রিয় নবায়নে সম্মতি',
    demoNote: '⚠️ ডেমো মোড: বাস্তব পেমেন্ট হবে না',
  },
  en: {
    title: 'Payment', method: 'Select Payment Method', bkashDesc: 'Bangladesh Mobile Payment',
    stripeDesc: 'Global Card Payment', phone: 'Phone Number', pin: 'bKash PIN (4 digits)',
    card: 'Card Number', expiry: 'Expiry (MM/YY)', cvc: 'CVC',
    name: 'Cardholder Name', pay: 'Pay Now', cancel: 'Cancel',
    processing: 'Processing payment...', success: 'Payment Complete!', successMsg: 'Subscription activated!',
    goHome: 'Go Home', total: 'Total', month: '/mo',
    agree: 'I agree to privacy policy and auto-renewal',
    demoNote: '⚠️ Demo mode: No real payment will be made',
  },
};

export default function SubscribePage() {
  const router  = useRouter();
  const [lang,    setLang]    = useState<Lang>('bn');
  const [plan,    setPlan]    = useState<Plan>('pro');
  const [method,  setMethod]  = useState<Method>('bkash');
  const [phone,   setPhone]   = useState('');
  const [pin,     setPin]     = useState('');
  const [card,    setCard]    = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvc,     setCvc]     = useState('');
  const [holder,  setHolder]  = useState('');
  const [agreed,  setAgreed]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('plan') as Plan;
      if (p && PLAN_INFO[p]) setPlan(p);
    }
  }, []);

  const t    = UI[lang];
  const info = PLAN_INFO[plan];

  const handlePay = async () => {
    if (!agreed) return;
    if (method === 'bkash' && (!phone || !pin)) return;
    if (method === 'stripe' && (!card || !expiry || !cvc || !holder)) return;

    setLoading(true);
    // 데모: 2초 후 성공
    await new Promise(r => setTimeout(r, 2000));
    try {
      localStorage.setItem('user_plan', plan);
      localStorage.setItem('plan_start', new Date().toISOString());
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      localStorage.setItem('plan_expire', nextMonth.toISOString());
    } catch {}
    setLoading(false);
    setSuccess(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0B1F4B',
    border: '1px solid #334155', borderRadius: 10,
    padding: '12px 16px', color: 'white',
    fontSize: 14, outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h1 style={{ color: '#10B981', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{t.success}</h1>
        <p style={{ color: '#BAE6FD', fontSize: 15, marginBottom: 8 }}>{t.successMsg}</p>
        <div style={{ color: info.color, fontSize: 20, fontWeight: 700, marginBottom: 28 }}>
          {info.name[lang]} Plan ✅
        </div>
        <button type="button" onClick={() => router.push('/')} style={{
          background: '#10B981', border: 'none', borderRadius: 12,
          padding: '14px 40px', color: '#000', fontWeight: 700,
          fontSize: 16, cursor: 'pointer', fontFamily: 'Arial, sans-serif',
        }}>
          🚀 {t.goHome}
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>

      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${info.color}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: info.color, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          ← {t.cancel}
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>💳 {t.title}</span>
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

        {/* 데모 안내 */}
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid #F59E0B44', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#F59E0B', fontSize: 12 }}>
          {t.demoNote}
        </div>

        {/* 플랜 요약 */}
        <div style={{ background: `${info.color}15`, border: `2px solid ${info.color}`, borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: info.color, fontSize: 20, fontWeight: 800 }}>{info.name[lang]}</div>
              <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{t.total}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: info.color, fontSize: 28, fontWeight: 800 }}>${info.price}</span>
              <span style={{ color: '#64748B', fontSize: 13 }}>{t.month}</span>
            </div>
          </div>
        </div>

        {/* 결제 방법 선택 */}
        <div style={{ color: '#BAE6FD', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t.method}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'bkash' as Method,  label: 'bKash',  emoji: '📱', desc: t.bkashDesc,  color: '#E2136E' },
            { id: 'stripe' as Method, label: 'Stripe', emoji: '💳', desc: t.stripeDesc, color: '#635BFF' },
          ].map(m => (
            <button key={m.id} type="button" onClick={() => setMethod(m.id)} style={{
              flex: 1, background: method === m.id ? `${m.color}18` : '#071336',
              border: `2px solid ${method === m.id ? m.color : '#334155'}`,
              borderRadius: 12, padding: '14px 10px',
              cursor: 'pointer', fontFamily: 'Arial, sans-serif',
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</div>
              <div style={{ color: method === m.id ? m.color : 'white', fontWeight: 700, fontSize: 14 }}>{m.label}</div>
              <div style={{ color: '#64748B', fontSize: 11, marginTop: 2 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* bKash 입력 */}
        {method === 'bkash' && (
          <div>
            <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>📱 {t.phone}</div>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" style={{ ...inputStyle, marginBottom: 14 }} />
            <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>🔐 {t.pin}</div>
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="****" maxLength={4} style={{ ...inputStyle, marginBottom: 14 }} />
          </div>
        )}

        {/* Stripe 카드 입력 */}
        {method === 'stripe' && (
          <div>
            <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>💳 {t.card}</div>
            <input value={card} onChange={e => setCard(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())} placeholder="0000 0000 0000 0000" maxLength={19} style={{ ...inputStyle, marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>{t.expiry}</div>
                <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>{t.cvc}</div>
                <input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="000" maxLength={3} style={inputStyle} />
              </div>
            </div>
            <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>{t.name}</div>
            <input value={holder} onChange={e => setHolder(e.target.value)} placeholder="John Doe" style={{ ...inputStyle, marginBottom: 14 }} />
          </div>
        )}

        {/* 동의 체크박스 */}
        <button type="button" onClick={() => setAgreed(a => !a)} style={{
          background: 'transparent', border: 'none',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', marginBottom: 20, cursor: 'pointer',
          fontFamily: 'Arial, sans-serif', width: '100%', textAlign: 'left',
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            border: `2px solid ${agreed ? '#10B981' : '#334155'}`,
            background: agreed ? '#10B981' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {agreed && <span style={{ color: '#000', fontSize: 12 }}>✓</span>}
          </div>
          <span style={{ color: '#BAE6FD', fontSize: 12 }}>{t.agree}</span>
        </button>

        {/* 결제 버튼 */}
        <button type="button" onClick={handlePay} disabled={loading || !agreed} style={{
          width: '100%',
          background: loading || !agreed ? '#1E293B' : info.color,
          border: 'none', borderRadius: 14,
          padding: '16px', color: loading || !agreed ? '#64748B' : '#000',
          fontWeight: 700, fontSize: 16,
          cursor: loading || !agreed ? 'not-allowed' : 'pointer',
          fontFamily: 'Arial, sans-serif',
        }}>
          {loading ? `⏳ ${t.processing}` : `💳 ${t.pay} $${info.price}`}
        </button>
      </div>
    </div>
  );
}
