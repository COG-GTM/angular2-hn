import { useParams } from 'react-router-dom';

// Placeholder until the feed feature is ported (PR 5).
export function FeedPage({ feedType }: { feedType: string }) {
  const { page } = useParams();
  return (
    <div data-testid="feed-page">
      Feed placeholder: {feedType} (page {page})
    </div>
  );
}
