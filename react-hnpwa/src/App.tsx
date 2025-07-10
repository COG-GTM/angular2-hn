import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="App">
      <header>
        <h1>Hacker News PWA - React</h1>
        <nav>
          <a href="/news/1">News</a>
          <a href="/newest/1">Newest</a>
          <a href="/show/1">Show</a>
          <a href="/ask/1">Ask</a>
          <a href="/jobs/1">Jobs</a>
        </nav>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/news/1" replace />} />
          <Route path="/news/:page" element={<div>News Feed - Page</div>} />
          <Route path="/newest/:page" element={<div>Newest Feed - Page</div>} />
          <Route path="/show/:page" element={<div>Show Feed - Page</div>} />
          <Route path="/ask/:page" element={<div>Ask Feed - Page</div>} />
          <Route path="/jobs/:page" element={<div>Jobs Feed - Page</div>} />
          <Route path="/item/:id" element={<div>Item Details</div>} />
          <Route path="/user/:id" element={<div>User Profile</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
