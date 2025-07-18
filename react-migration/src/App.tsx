import React, { useState } from 'react';
import LoaderComponent from './components/LoaderComponent';
import ErrorMessageComponent from './components/ErrorMessageComponent';
import { formatCommentCount } from './utils/commentUtils';

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [errorMessage, setErrorMessage] = useState('Something went wrong!');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
          Angular to React Migration - Tier 1 Components
        </h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* LoaderComponent Demo */}
          <section style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>LoaderComponent</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              A simple loading indicator with animated bars. Toggle to show/hide:
            </p>
            <button 
              onClick={() => setShowLoader(!showLoader)}
              style={{ 
                marginBottom: '1rem', 
                padding: '0.5rem 1rem', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              {showLoader ? 'Hide Loader' : 'Show Loader'}
            </button>
            {showLoader && <LoaderComponent />}
          </section>

          {/* ErrorMessageComponent Demo */}
          <section style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>ErrorMessageComponent</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Displays error messages with a skull graphic. Try different messages:
            </p>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setErrorMessage('Network connection failed!')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Network Error
              </button>
              <button 
                onClick={() => setErrorMessage('Page not found!')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                404 Error
              </button>
              <button 
                onClick={() => setErrorMessage('Something went wrong!')}
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Generic Error
              </button>
            </div>
            <ErrorMessageComponent message={errorMessage} />
          </section>

          {/* CommentPipe Demo */}
          <section style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>CommentPipe Utility</h2>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Formats comment counts. Test with different values:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[0, 1, 5, 42].map(count => (
                <div key={count} style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontFamily: 'monospace', color: '#2563eb' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                    → "{formatCommentCount(count)}"
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer style={{ marginTop: '3rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
          <p>Successfully migrated from Angular to React TypeScript</p>
          <p>Components: LoaderComponent, ErrorMessageComponent, CommentPipe utility</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
