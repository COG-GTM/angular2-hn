import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/core/header/Header';
import { Footer } from './components/core/footer/Footer';
import { Feed } from './components/feeds/feed/Feed';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/news/1" replace />} />
              <Route path="/news/:page" element={<Feed />} />
              <Route path="/newest/:page" element={<Feed />} />
              <Route path="/show/:page" element={<Feed />} />
              <Route path="/ask/:page" element={<Feed />} />
              <Route path="/jobs/:page" element={<Feed />} />
              <Route path="*" element={<Navigate to="/news/1" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
