import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <header className="App-header">
                    <h1>React HN</h1>
                    <p>Hacker News client built with React + TypeScript</p>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<Navigate to="/news/1" replace />} />
                        <Route path="/news/:page" element={<div>News Feed (TODO)</div>} />
                        <Route path="/newest/:page" element={<div>Newest Feed (TODO)</div>} />
                        <Route path="/show/:page" element={<div>Show Feed (TODO)</div>} />
                        <Route path="/ask/:page" element={<div>Ask Feed (TODO)</div>} />
                        <Route path="/jobs/:page" element={<div>Jobs Feed (TODO)</div>} />
                        <Route path="/item/:id" element={<div>Item Details (TODO)</div>} />
                        <Route path="/user/:id" element={<div>User Profile (TODO)</div>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
