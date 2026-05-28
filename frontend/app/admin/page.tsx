'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'admin@kbridge.app'; // 관리자 이메일

export default function AdminPage() {
  const router = useRouter();
  const [users,    setUsers]    = useState<any[]>([]);
  const [convs,    setConvs]    = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<'users' | 'convs'>('users');
  const [allowed,  setAllowed]  = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('user_email') || '';
    // 관리자 체크 (임시: admin@ 이메일)
    if (!email.includes('admin')) {
      alert('관리자만 접근할 수 있습니다.');
      router.push('/');
      return;
    }
    setAllowed(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 대화 목록 불러오기
      const convRes = await fetch('http://localhost:8000/conversations/user/all');
      if (convRes.ok) {
        const data = await convRes.json();
        setConvs(Array.isArray(data) ? data : []);
      }
    } catch {}
    setLoading(false);
  };

  // 더미 사용자 데이터 (실제는 백엔드 API 연동)
  const dummyUsers = [
    { name: 'Farhan', email: 'farhan@kbridge.test', country: 'BD', purpose: 'k_edu',  joined: '2026-05-26' },
    { name: '김경균', email: 'kgk1026@nate.com',    country: 'KR', purpose: 'k_work', joined: '2026-05-26' },
  ];

  const purposeLabel: Record<string, string> = {
    k_edu: '🎓 유학', k_work: '💼 취업', k_culture: '🎵 문화',
  };

  if (!allowed) return null;

  return (
    <div style={{ minHeight: '100dvh', background: '#0B1F4B', fontFamily: 'Arial, sans-serif', paddingBottom: 40 }}>
      {/* 헤더 */}
      <div style={{ background: '#071336', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #EF4444', position: 'sticky', top: 0, zIndex: 100 }}>
        <button type="button" onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          ← K-BRIDGE
        </button>
        <span style={{ color: 'white', fontWeight: 700 }}>🔧 관리자 페이지</span>
        <span style={{ color: '#64748B', fontSize: 12 }}>Admin</span>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>

        {/* 통계 카드 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: '전체 사용자', value: dummyUsers.length, icon: '👥', color: '#0891B2' },
            { label: '대화 기록',   value: convs.length,      icon: '💬', color: '#10B981' },
            { label: '오늘 접속',   value: 1,                 icon: '📊', color: '#F59E0B' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: '#071336',
              border: `1px solid ${s.color}44`,
              borderRadius: 14, padding: '14px 10px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 24, fontWeight: 800, marginBottom: 2 }}>{s.value}</div>
              <div style={{ color: '#64748B', fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'users', label: '👥 사용자' },
            { key: 'convs', label: '💬 대화 기록' },
          ].map(t2 => (
            <button key={t2.key} type="button" onClick={() => setTab(t2.key as any)} style={{
              flex: 1, background: tab === t2.key ? '#EF4444' : 'transparent',
              border: `1px solid ${tab === t2.key ? '#EF4444' : '#334155'}`,
              borderRadius: 10, padding: '10px',
              color: tab === t2.key ? 'white' : '#BAE6FD',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
            }}>
              {t2.label}
            </button>
          ))}
        </div>

        {/* 사용자 목록 */}
        {tab === 'users' && (
          <div>
            {dummyUsers.map((u, i) => (
              <div key={i} style={{
                background: '#071336', border: '1px solid #1E293B',
                borderRadius: 12, padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>{u.name}</span>
                  <span style={{ color: '#10B981', fontSize: 12, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 99 }}>
                    {purposeLabel[u.purpose] || u.purpose}
                  </span>
                </div>
                <div style={{ color: '#64748B', fontSize: 12, marginBottom: 4 }}>{u.email}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: '#BAE6FD', fontSize: 12 }}>🌏 {u.country}</span>
                  <span style={{ color: '#64748B', fontSize: 12 }}>가입: {u.joined}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 대화 기록 */}
        {tab === 'convs' && (
          <div>
            {loading ? (
              <div style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>불러오는 중...</div>
            ) : convs.length === 0 ? (
              <div style={{ color: '#64748B', textAlign: 'center', marginTop: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                대화 기록이 없습니다
              </div>
            ) : convs.map((c: any, i: number) => (
              <div key={i} style={{
                background: '#071336', border: '1px solid #1E293B',
                borderRadius: 12, padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'white', fontSize: 14 }}>{c.title}</span>
                  <span style={{ color: '#64748B', fontSize: 11 }}>
                    {new Date(c.updated_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div style={{ color: '#BAE6FD', fontSize: 12 }}>{c.user_email} · {c.character}</div>
              </div>
            ))}
          </div>
        )}

        {/* 새로고침 */}
        <button type="button" onClick={fetchData} style={{
          width: '100%', background: 'transparent',
          border: '1px solid #334155', borderRadius: 12,
          padding: 12, color: '#BAE6FD',
          fontSize: 14, cursor: 'pointer', marginTop: 16,
          fontFamily: 'Arial, sans-serif',
        }}>
          🔄 새로고침
        </button>
      </div>
    </div>
  );
}
