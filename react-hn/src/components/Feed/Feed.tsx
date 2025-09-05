import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFetchFeed } from '../../hooks/useHackerNewsAPI';
import { Story } from '../../types';
import { StoryItem } from './StoryItem';

export function Feed() {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();
  const pageNum = page ? parseInt(page, 10) : 1;
  
  const feedType = location.pathname.split('/')[1];
  const { data: items, loading, error } = useFetchFeed(feedType, pageNum);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNum, feedType]);

  const listStart = ((pageNum - 1) * 30) + 1;

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading {feedType} stories...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-lg font-normal">{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Stories</h1>
      </div>
      <div className="bg-white border border-gray-300">
        {items.map((story: Story, index: number) => (
          <StoryItem 
            key={story.id} 
            story={story} 
            index={listStart + index}
          />
        ))}
      </div>
      <div className="mt-4 text-center">
        {pageNum > 1 && (
          <a href={`/${feedType}/${pageNum - 1}`} className="text-black no-underline mx-2 py-2 px-4 border border-gray-300 bg-white hover:bg-gray-100">
            Previous
          </a>
        )}
        {items.length === 30 && (
          <a href={`/${feedType}/${pageNum + 1}`} className="text-black no-underline mx-2 py-2 px-4 border border-gray-300 bg-white hover:bg-gray-100">
            Next
          </a>
        )}
      </div>
    </div>
  );
}
