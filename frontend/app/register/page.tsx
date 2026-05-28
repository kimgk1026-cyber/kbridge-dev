'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const COUNTRIES = [
  { value: 'BD', label: '🇧🇩 방글라데시 (Bangladesh)' },
  { value: 'VN', label: '🇻🇳 베트남 (Vietnam)' },
  { value: 'PH', label: '🇵🇭 필리핀 (Philippines)' },
  { value: 'ID', label: '🇮🇩 인도네시아 (Indonesia)' },
  { value: 'KH', label: '🇰🇭 캄보디아 (Cambodia)' },
  { value: 'UZ', label: '🇺🇿 우즈베키스탄 (Uzbekistan)' },
  { value: 'OTHER', label: '🌏 기타 (Other)' },
];

const PURPOSES = [
  { value: 'k_edu',     label: '🎓 한국 유학 · TOPIK' },
  { value: 'k_work',    label: '💼 한국 취업 · EPS-TOPIK' },
  { value: 'k_culture', label: '🎵 K-POP · 한국 문화' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [country,   setCountry]   = useState('');
  const [purpose,   setPurpose]   = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !password2 || !country || !purpose) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== password2) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, country, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? '회원가입에 실패했습니다.');
      } else {
        localStorage.setItem('token',      data.access_token);
        localStorage.setItem('user_name',  name);
        localStorage.setItem('user_email', email);
        router.push('/');
      }
    } catch {
      setError('서버에 연결할 수 없습니다.');
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#0B1F4B',
    border: '1px solid #334155', borderRadius: 10,
    padding: '12px 16px', color: 'white',
    fontSize: 14, outline: 'none',
    boxSizing: 'border-box', marginBottom: 14,
    fontFamily: 'Arial, sans-serif',
  };

  return (
    <div style={{
      minHeight: '100dvh', background: '#0B1F4B',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: 'Arial, sans-serif',
    }}>
      {/* 로고 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#10B981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: '#000',
          margin: '0 auto 10px',
        }}>K</div>
        <div style={{ color: '#10B981', fontSize: 20, fontWeight: 700 }}>K-BRIDGE</div>
        <div style={{ color: '#64748B', fontSize: 12, marginTop: 3 }}>회원가입</div>
      </div>

      {/* 카드 */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#071336',
        border: '1px solid #1E293B',
        borderRadius: 20, padding: '24px 20px',
      }}>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px',
            color: '#EF4444', fontSize: 13, marginBottom: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>이름</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="이름" style={inputStyle} />

        <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>이메일</div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" style={inputStyle} />

        <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>비밀번호 (6자 이상)</div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" style={inputStyle} />

        <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>비밀번호 확인</div>
        <input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="비밀번호 확인" style={inputStyle} />

        <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>국가 선택</div>
        <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">국가를 선택하세요</option>
          {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {/* 목적 선택 — button 태그 사용 */}
        <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 10 }}>한국에 오는 목적</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {PURPOSES.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPurpose(p.value)}
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: 10,
                border: `2px solid ${purpose === p.value ? '#10B981' : '#334155'}`,
                background: purpose === p.value ? 'rgba(16,185,129,0.15)' : '#0B1F4B',
                color: purpose === p.value ? '#10B981' : '#BAE6FD',
                fontSize: 14, textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontWeight: purpose === p.value ? 700 : 400,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 회원가입 버튼 */}
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#334155' : '#10B981',
            border: 'none', borderRadius: 10,
            padding: '14px', color: loading ? '#64748B' : '#000',
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'block', fontFamily: 'Arial, sans-serif',
          }}
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#64748B', fontSize: 13 }}>이미 계정이 있으신가요? </span>
          <button
            type="button"
            onClick={() => router.push('/login')}
            style={{
              background: 'none', border: 'none',
              color: '#10B981', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              textDecoration: 'underline', padding: 0,
            }}
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}
