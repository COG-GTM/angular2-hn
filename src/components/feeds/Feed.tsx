import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Story } from '../../models';
import { useHackerNewsAPI } from '../../hooks/useHackerNewsAPI';
import { Loader, ErrorMessage } from '../shared';
import Item from './Item';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchFeed } = useHackerNewsAPI();

  const pageNum = parseInt(page || '1', 10);
  const listStart = (pageNum - 1) * 30 + 1;

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setItems([]);

    fetchFeed(feedType, pageNum)
      .then((data) => {
        setItems(data);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        setErrorMessage(`Could not load ${feedType} stories.`);
        setLoading(false);
      });
  }, [feedType, pageNum, fetchFeed]);

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="main-content">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  return (
    <div className="main-content">
      {feedType === 'jobs' && (
        <p className="job-header">
          These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through{' '}
          <a href="https://triplebyte.com/?ref=yc_jobs" target="_blank" rel="noopener noreferrer">
            Triplebyte
          </a>
          .
        </p>
      )}
      {feedType !== 'new' && (
        <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
          {items.map((item) => (
            <li key={item.id} className="post">
              <Item item={item} />
            </li>
          ))}
        </ol>
      )}
      <div className="nav">
        {listStart !== 1 && (
          <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
            ‹ Prev
          </Link>
        )}
        {items.length === 30 && (
          <Link to={`/${feedType}/${pageNum + 1}`} className="more">
            More ›
          </Link>
        )}
      </div>
    </div>
  );
};

export default Feed;
