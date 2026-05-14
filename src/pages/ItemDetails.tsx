import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchItem } from '../api/hackerNewsApi';
import { useSettings } from '../hooks/useSettings';
import { formatCommentCount } from '../utils/formatCommentCount';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { Comment } from '../components/Comment';
import type { Story } from '../types/Story';
import type { PollResult } from '../types/PollResult';
import './ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [pollOptions, setPollOptions] = useState<PollResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const itemId = Number(id);

    setItem(null);
    setError('');
    setPollOptions([]);

    fetchItem(itemId)
      .then(data => {
        setItem(data);
        if (data.type === 'poll' && data.poll && data.poll.length > 0) {
          setPollOptions(data.poll);
        }
      })
      .catch(() => setError('Could not load item comments.'));

    window.scrollTo(0, 0);
  }, [id]);

  if (!item && !error) {
    return <Loader />;
  }

  if (!item && error) {
    return <ErrorMessage message={error} />;
  }

  if (!item) return null;

  const hasUrl = item.url?.indexOf('http') === 0;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className="main-content">
      <div className="item">
        {/* Mobile header */}
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => window.history.back()} />
            {hasUrl ? (
              <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                {item.title}
              </a>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>

        {/* Desktop header */}
        <div
          className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
        >
          <p>
            {hasUrl ? (
              <>
                <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
                  {item.title}
                </a>
                {item.domain && <span className="domain">({item.domain})</span>}
              </>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
          <div className="subtext">
            {item.type !== 'job' && (
              <span>
                {item.points} points by{' '}
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            )}
            <span className={item.type !== 'job' ? 'item-details' : ''}>
              {item.time_ago}
              {item.type !== 'job' && (
                <>
                  {' | '}
                  <Link to={`/item/${item.id}`}>
                    {formatCommentCount(item.comments_count)}
                  </Link>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Poll results */}
        {item.type === 'poll' && pollOptions.length > 0 && (
          <div className="pollResults">
            {pollOptions.map((pollResult, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Item content */}
        {item.content && (
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {/* Comments */}
        {item.comments && item.comments.length > 0 && (
          <ul className="comment-list">
            {item.comments.map(comment => (
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
