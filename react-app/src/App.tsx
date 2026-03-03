import { Routes, Route } from 'react-router-dom'
import './App.scss'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<div className="placeholder">React HN - Migration in Progress</div>} />
      </Routes>
    </div>
  )
}

export default App
