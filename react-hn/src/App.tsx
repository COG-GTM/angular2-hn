import React, { useState } from 'react'
import './App.css'
import { Story, User, Comment, Settings, PollResult, FeedType } from './types'

function App() {
  const [count, setCount] = useState(0)

  const testTypes = () => {
    const story: Story = {
      id: 1,
      title: 'Test Story',
      points: 100,
      user: 'testuser',
      time: Date.now(),
      time_ago: Date.now(),
      type: 'story' as FeedType,
      url: 'https://example.com',
      domain: 'example.com',
      comments: [],
      comments_count: 0,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    }
    
    console.log('TypeScript interfaces working:', { story })
  }

  return (
    <>
      <div>
        <h1>React HN - Phase 1 Migration</h1>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={testTypes}>
          Test Migrated Types
        </button>
        <p>
          Angular to React migration - Phase 1 complete!
        </p>
        <p>
          Data models migrated: Story, User, Comment, Settings, PollResult, FeedType
        </p>
      </div>
      <p className="read-the-docs">
        Phase 2: Migrate services and create components
      </p>
    </>
  )
}

export default App
