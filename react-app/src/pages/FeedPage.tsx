import { useParams } from 'react-router-dom';
import type { Feed } from '../feeds';

interface FeedPageProps {
  feedType: Feed;
}

export default function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();

  return (
    <section>
      <h1>{feedType}</h1>
      <p>Page {page}</p>
      <p>Feed component not migrated yet.</p>
    </section>
  );
}
