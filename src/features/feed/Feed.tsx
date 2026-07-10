import { useParams } from 'react-router-dom';

interface FeedProps {
  feedType: string;
}

// Placeholder wired into routing in Phase 5; the full feed list arrives in
// Phase 6.
export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams();
  return (
    <div className="main-content">
      <p>
        Feed: {feedType} (page {page})
      </p>
    </div>
  );
}
