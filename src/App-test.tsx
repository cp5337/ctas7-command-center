import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 CTAS Command Center - Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Status Check</h2>
        <ul>
          <li>✅ React rendering</li>
          <li>✅ TypeScript compilation</li>
          <li>✅ Vite dev server</li>
        </ul>
      </div>
      <button
        onClick={() => alert('CTAS Command Center is responsive!')}
        style={{
          background: '#007acc',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Interaction
      </button>
    </div>
  );
}

export default App;