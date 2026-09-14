import { useParams } from 'react-router-dom'
import type { FeedName } from '../services/hackerNewsApi'

interface FeedProps {
  feedType: FeedName
}

function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>()
  return (
    <main>
      <h2>
        Feed: {feedType} (page {page})
      </h2>
    </main>
  )
}

export default Feed
