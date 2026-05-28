'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? '이메일 또는 비밀번호가 틀렸습니다.');
      } else {
        localStorage.setItem('token',      data.access_token);
        localStorage.setItem('user_name',  data.user_name ?? '친구');
        localStorage.setItem('user_email', email);
        router.push('/');
      }
    } catch {
      setError('서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0B1F4B',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* 로고 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#10B981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#000',
          margin: '0 auto 12px',
        }}>K</div>
        <div style={{ color: '#10B981', fontSize: 24, fontWeight: 700 }}>K-BRIDGE</div>
        <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>한국 유학·취업 AI 파트너</div>
      </div>

      {/* 카드 */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#071336',
        border: '1px solid #1E293B',
        borderRadius: 20,
        padding: '28px 24px',
      }}>
        <h2 style={{ color: 'white', fontSize: 20, marginBottom: 24, textAlign: 'center', margin: '0 0 24px 0' }}>
          로그인
        </h2>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px',
            color: '#EF4444', fontSize: 13, marginBottom: 16,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* 이메일 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>이메일</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="example@email.com"
            style={{
              width: '100%', background: '#0B1F4B',
              border: '1px solid #334155', borderRadius: 10,
              padding: '12px 16px', color: 'white',
              fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 비밀번호 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#BAE6FD', fontSize: 13, marginBottom: 6 }}>비밀번호</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호를 입력하세요"
            style={{
              width: '100%', background: '#0B1F4B',
              border: '1px solid #334155', borderRadius: 10,
              padding: '12px 16px', color: 'white',
              fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#334155' : '#10B981',
            border: 'none', borderRadius: 10,
            padding: '14px', color: loading ? '#64748B' : '#000',
            fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'block',
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        {/* 회원가입 링크 */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ color: '#64748B', fontSize: 13 }}>아직 계정이 없으신가요? </span>
          <button
            onClick={() => router.push('/register')}
            style={{
              background: 'none', border: 'none',
              color: '#10B981', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            회원가입
          </button>
        </div>
      </div>

      <div style={{ color: '#334155', fontSize: 12, marginTop: 24, textAlign: 'center' }}>
        Bangladesh · Korea
      </div>
    </div>
  );
}
