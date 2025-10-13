interface FeedPageProps {
  feedType: 'news' | 'newest' | 'show' | 'ask' | 'jobs';
}

export default function FeedPage({ feedType }: FeedPageProps) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed
      </h1>
      <p className="text-gray-600">
        This is a placeholder for the {feedType} feed component.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Component migration will happen in later phases.
      </p>
    </div>
  );
}
