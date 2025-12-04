import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/**
 * Main App component with routing configuration
 * 
 * This is a placeholder that demonstrates the routing structure.
 * Component implementations will be added in subsequent migration steps.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header>
          <h1>Hacker News - React Migration</h1>
          <p>Data layer migration complete. UI components coming next.</p>
        </header>
        
        <main>
          <Routes>
            {/* Redirect root to news feed */}
            <Route path="/" element={<Navigate to="/news/1" replace />} />
            
            {/* Feed routes - placeholder */}
            <Route path="/news/:page" element={<FeedPlaceholder feedType="news" />} />
            <Route path="/newest/:page" element={<FeedPlaceholder feedType="newest" />} />
            <Route path="/show/:page" element={<FeedPlaceholder feedType="show" />} />
            <Route path="/ask/:page" element={<FeedPlaceholder feedType="ask" />} />
            <Route path="/jobs/:page" element={<FeedPlaceholder feedType="jobs" />} />
            
            {/* Item details route - placeholder */}
            <Route path="/item/:id" element={<ItemPlaceholder />} />
            
            {/* User profile route - placeholder */}
            <Route path="/user/:id" element={<UserPlaceholder />} />
          </Routes>
        </main>
        
        <footer>
          <p>React migration of Angular2-HN</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function FeedPlaceholder({ feedType }: { feedType: string }) {
  return (
    <div>
      <h2>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed</h2>
      <p>Feed component will be implemented in the next migration step.</p>
      <p>The useFeed hook is ready to fetch data from the API.</p>
    </div>
  );
}

function ItemPlaceholder() {
  return (
    <div>
      <h2>Item Details</h2>
      <p>Item details component will be implemented in the next migration step.</p>
      <p>The useItem hook is ready to fetch item data from the API.</p>
    </div>
  );
}

function UserPlaceholder() {
  return (
    <div>
      <h2>User Profile</h2>
      <p>User component will be implemented in the next migration step.</p>
      <p>The useUser hook is ready to fetch user data from the API.</p>
    </div>
  );
}

export default App;
