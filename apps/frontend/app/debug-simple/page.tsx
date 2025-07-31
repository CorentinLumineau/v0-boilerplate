"use client";

export default function DebugSimplePage() {
  // Don't use any auth hooks, just raw inspection
  const checkEnvironment = () => {
    return {
      origin: typeof window !== 'undefined' ? window.location.origin : 'server',
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'server',
      cookies: typeof document !== 'undefined' ? document.cookie : 'server',
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      nodeEnv: process.env.NODE_ENV
    };
  };

  const env = checkEnvironment();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Simple Debug Page (No Auth Hooks)</h1>
      
      <h2>Environment:</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px' }}>
        {JSON.stringify(env, null, 2)}
      </pre>

      <h2>Better-Auth Cookies:</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px' }}>
        {typeof document !== 'undefined' ? 
          document.cookie.split(';')
            .filter(c => c.includes('better-auth'))
            .map(c => c.trim())
            .join('\\n') || 'No better-auth cookies found'
          : 'Server-side render'
        }
      </pre>

      <h2>Actions:</h2>
      <button 
        onClick={() => window.location.href = '/login'}
        style={{ padding: '10px', margin: '5px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
      >
        Go to Login
      </button>
      
      <button 
        onClick={() => window.location.reload()}
        style={{ padding: '10px', margin: '5px', backgroundColor: '#28a745', color: 'white', border: 'none' }}
      >
        Reload Page
      </button>

      <button 
        onClick={() => {
          console.log('Cookies:', document.cookie);
          console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
        }}
        style={{ padding: '10px', margin: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none' }}
      >
        Log to Console
      </button>
    </div>
  );
}