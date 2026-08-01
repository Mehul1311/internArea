import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface SubStatus {
  plan_name: string;
  application_limit: number | null;
  applications_used: number;
  current_period_end?: string;
}

export default function DashboardPage() {
  const [status, setStatus] = useState<SubStatus | null>(null);
  const username = 'testuser'; // Hardcoded for demo

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
    fetch(`${API_BASE}/subscribe/status/${username}`)
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error(err));
  }, []);

  if (!status) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;

  const applicationsRemaining = status.application_limit === null 
    ? 'Unlimited' 
    : (status.application_limit - status.applications_used);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>My Dashboard</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginTop: '30px'
      }}>
        <div style={{ padding: '24px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce3fd' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#005bb5' }}>Current Plan</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{status.plan_name}</p>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce3fd' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#005bb5' }}>Applications Remaining</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{applicationsRemaining}</p>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0 0 0' }}>out of {status.application_limit === null ? '∞' : status.application_limit}</p>
        </div>

        {status.current_period_end && (
          <div style={{ padding: '24px', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #cce3fd' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#005bb5' }}>Renewal Date</h3>
            <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
              {new Date(status.current_period_end).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <Link href="/pricing" style={{ 
          display: 'inline-block', 
          padding: '12px 24px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
