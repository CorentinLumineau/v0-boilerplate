"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function SessionTestPage() {
  const session = useSession();
  const [cookieInfo, setCookieInfo] = useState('');
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const updateInfo = () => {
      const cookies = document.cookie;
      const betterAuthCookies = cookies.split(';')
        .filter(c => c.includes('better-auth'))
        .map(c => c.trim())
        .join('\\n');
      
      setCookieInfo(betterAuthCookies || 'No better-auth cookies found');
      setTimestamp(new Date().toISOString());
    };

    updateInfo();
    // Update every 2 seconds
    const interval = setInterval(updateInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>Session Test Page</h1>
      <p><strong>Last Updated:</strong> {timestamp}</p>
      
      <h2>Session Data:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ddd' }}>
        isPending: {session.isPending.toString()}
        hasSession: {(!!session.data).toString()}
        userId: {session.data?.user?.id || 'none'}
        email: {session.data?.user?.email || 'none'}
        error: {session.error?.message || 'none'}
      </pre>

      <h2>Cookies:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ddd', wordBreak: 'break-all' }}>
        {cookieInfo}
      </pre>

      <h2>Environment:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ddd' }}>
        origin: {typeof window !== 'undefined' ? window.location.origin : 'server'}
        pathname: {typeof window !== 'undefined' ? window.location.pathname : 'server'}
        api_url: {process.env.NEXT_PUBLIC_API_URL || 'not set'}
      </pre>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Force Reload
        </button>
        
        <button 
          onClick={() => window.location.href = '/login'}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}