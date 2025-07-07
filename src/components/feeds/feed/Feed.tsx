import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Story } from '../../shared/models/story';
import { hackerNewsAPI } from '../../shared/services/hackernews-api.service';

const Feed: React.FC = () => {
  const { page } = useParams<{ page?: string }>();
  const location = useLocation();
  const [items, setItems] = useState<Story[]>([]);
  const [feedType, setFeedType] = useState<string>('');
  const [pageNum, setPageNum] = useState<number>(1);
  const [listStart, setListStart] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentFeedType = pathSegments[1] || 'news';
    setFeedType(currentFeedType);
  }, [location.pathname]);

  useEffect(() => {
    const currentPage = page ? parseInt(page, 10) : 1;
    setPageNum(currentPage);
  }, [page]);

  useEffect(() => {
    if (feedType && pageNum) {
      fetchFeedData();
    }
  }, [feedType, pageNum]);

  const fetchFeedData = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const fetchedItems = await hackerNewsAPI.fetchFeed(feedType, pageNum);
      setItems(fetchedItems);
      setListStart(((pageNum - 1) * 30) + 1);
      window.scrollTo(0, 0);
    } catch (error) {
      setErrorMessage(`Could not load ${feedType} stories.`);
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-start space-x-3">
              <span className="text-gray-500 font-mono text-sm min-w-[2rem]">
                {listStart + index}.
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black hover:underline"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <span>{item.title}</span>
                  )}
                  {item.domain && (
                    <span className="text-gray-500 text-sm ml-2">
                      ({item.domain})
                    </span>
                  )}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                  {item.points} points by {item.user} | {item.time_ago} | {item.comments_count} comments
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-8">
        {pageNum > 1 && (
          <a 
            href={`/${feedType}/${pageNum - 1}`}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Previous
          </a>
        )}
        <span className="text-gray-600">Page {pageNum}</span>
        <a 
          href={`/${feedType}/${pageNum + 1}`}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Next
        </a>
      </div>
    </div>
  );
};

export default Feed;
