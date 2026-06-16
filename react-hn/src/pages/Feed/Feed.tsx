import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Story } from '../../models/Story';
import { fetchFeed } from '../../services/hackerNewsApi';
import FeedItem from '../../components/FeedItem/FeedItem';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const params = useParams();
  const pageNum = params.page ? +params.page : 1;

  const [items, setItems] = useState<Story[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    setItems(undefined);
    setErrorMessage('');
    fetchFeed(feedType, pageNum)
      .then((data) => {
        if (!active) return;
        setItems(data);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (!active) return;
        setErrorMessage('Could not load ' + feedType + ' stories.');
      });
    return () => {
      active = false;
    };
  }, [feedType, pageNum]);

  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="main-content feed">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can
              also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <div className="item-block">
                  <FeedItem item={item} />
                </div>
              </li>
            ))}
          </ol>
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
      )}
    </div>
  );
};

export default Feed;
