export default function BackendHomePage() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🚀 Boilerplate Backend API</h1>
      <p>Next.js 15 backend service for the boilerplate monorepo.</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><strong>GET /api</strong> - API information</li>
        <li><strong>GET /api/health</strong> - Health check</li>
      </ul>

      <h2>Quick Test:</h2>
      <p>
        <a href="/api" target="_blank" rel="noopener noreferrer">
          Test /api endpoint →
        </a>
      </p>
      <p>
        <a href="/api/health" target="_blank" rel="noopener noreferrer">
          Test /api/health endpoint →
        </a>
      </p>
    </div>
  )
}