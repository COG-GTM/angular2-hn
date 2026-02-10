import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Item } from './components/Item/Item';
import type { Story } from './models/Story';
import type { Settings } from './models/Settings';
import './App.css';

const DEFAULT_SETTINGS: Settings = {
  showSettings: false,
  openLinkInNewTab: false,
  theme: 'default',
  titleFontSize: '16',
  listSpacing: '10',
};

function Feed() {
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://api.hnpwa.com/v0/news/1.json')
      .then((res) => res.json())
      .then((data: Story[]) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="feed">
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <Item item={item} settings={DEFAULT_SETTINGS} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="default">
        <div className="wrapper">
          <header id="header">
            <div className="header-content">
              <div className="logo">
                <span className="logo-inner">HN</span>
              </div>
              <nav className="nav">
                <a href="/news/1">new</a> | <a href="/show/1">show</a> |{' '}
                <a href="/ask/1">ask</a> | <a href="/jobs/1">jobs</a>
              </nav>
            </div>
          </header>
          <main className="main-content">
            <Routes>
              <Route path="*" element={<Feed />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
