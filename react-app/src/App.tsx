import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

function FeedPlaceholder({ feedType }: { feedType: string }) {
  const { page } = useParams()

  return <div>Feed: {feedType} — page {page}</div>
}

function ItemPlaceholder() {
  const { id } = useParams()

  return <div>Item {id}</div>
}

function UserPlaceholder() {
  const { id } = useParams()

  return <div>User {id}</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/news/1" replace />} />
        <Route path="/news/:page" element={<FeedPlaceholder feedType="news" />} />
        <Route path="/newest/:page" element={<FeedPlaceholder feedType="newest" />} />
        <Route path="/show/:page" element={<FeedPlaceholder feedType="show" />} />
        <Route path="/ask/:page" element={<FeedPlaceholder feedType="ask" />} />
        <Route path="/jobs/:page" element={<FeedPlaceholder feedType="jobs" />} />
        <Route path="/item/:id" element={<ItemPlaceholder />} />
        <Route path="/user/:id" element={<UserPlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
