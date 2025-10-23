import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Story } from '../types/story';
import { hackerNewsAPIService } from '../services/hackernews-api.service';
import { useSettings } from '../contexts/SettingsContext';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Comment } from '../components/Comment';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    setItem(null);
    setErrorMessage('');

    hackerNewsAPIService
      .fetchItemContent(parseInt(id, 10))
      .then((fetchedItem) => {
        setItem(fetchedItem);
        window.scrollTo(0, 0);
      })
      .catch(() => {
        setErrorMessage('Could not load item comments.');
      });
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (!item && !errorMessage) {
    return <Loader />;
  }

  if (!item && errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!item) return null;

  const hasUrl = item.url && item.url.indexOf('http') === 0;

  return (
    <div className="main-content p-4 max-w-4xl mx-auto">
      <div className="item">
        <div className="mobile item-header block md:hidden mb-4">
          <div className="title-block">
            <button
              className="back-button inline-block mr-2 text-blue-600 hover:underline"
              onClick={goBack}
            >
              ← Back
            </button>
            {hasUrl ? (
              <a
                className="title text-lg font-semibold hover:underline"
                href={item.url}
                target={settings.openLinkInNewTab ? '_blank' : undefined}
                rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
              >
                {item.title}
              </a>
            ) : (
              <Link
                className="title text-lg font-semibold hover:underline"
                to={`/item/${item.id}`}
              >
                {item.title}
              </Link>
            )}
          </div>
        </div>

        <div
          className={`laptop hidden md:block ${
            item.comments_count > 0 || item.type === 'job' ? 'item-header mb-4' : ''
          } ${item.content ? 'head-margin' : ''}`}
        >
          {hasUrl ? (
            <p>
              <a
                className="title text-xl font-semibold hover:underline"
                href={item.url}
                target={settings.openLinkInNewTab ? '_blank' : undefined}
                rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
              >
                {item.title}
              </a>
              {item.domain && (
                <span className="domain text-gray-500 text-sm ml-2">
                  ({item.domain})
                </span>
              )}
            </p>
          ) : (
            <p>
              <Link
                className="title text-xl font-semibold hover:underline"
                to={`/item/${item.id}`}
              >
                {item.title}
              </Link>
            </p>
          )}

          <div className="subtext text-sm text-gray-600 dark:text-gray-400 mt-2">
            {item.type !== 'job' && (
              <span>
                {item.points} points by{' '}
                <Link to={`/user/${item.user}`} className="hover:underline">
                  {item.user}
                </Link>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details ml-2' : ''}>
              {item.time_ago}
              {item.type !== 'job' && (
                <span>
                  {' | '}
                  <Link to={`/item/${item.id}`} className="hover:underline">
                    {item.comments_count === 0
                      ? 'discuss'
                      : item.comments_count === 1
                      ? '1 comment'
                      : `${item.comments_count} comments`}
                  </Link>
                </span>
              )}
            </span>
          </div>
        </div>

        {item.type === 'poll' && item.poll && item.poll.length > 0 && (
          <div className="pollResults mb-4">
            {item.poll.map((pollResult, index) => (
              <div key={index} className="pollContent mb-2">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext text-sm text-gray-600">
                  {pollResult.points} points
                </div>
                <div
                  className="pollBar h-2 bg-blue-500 rounded"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {item.content && (
          <p
            className="subject my-4 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {item.comments && item.comments.length > 0 && (
          <ul className="comment-list mt-6">
            {item.comments.map((comment) => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
