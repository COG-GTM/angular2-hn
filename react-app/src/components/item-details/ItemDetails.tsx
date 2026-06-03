import { useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { useSettings } from '../../context/useSettings';
import { useFetch } from '../../hooks/useFetch';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { CommentComponent } from './Comment';
import './ItemDetails.scss';

function formatCommentCount(count: number): string {
  if (count > 0) {
    return count === 1 ? '1 comment' : `${count} comments`;
  }
  return 'discuss';
}

function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const numericId = Number(id);

  const fetcher = useCallback(
    () => fetchItemContent(numericId),
    [numericId],
  );

  const { data: item, loading, error } = useFetch(
    fetcher,
    [numericId],
    'Could not load item comments.',
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!item) return null;

  const hasUrl = item.url?.startsWith('http') ?? false;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className="main-content">
      <div className="item">
        {/* Mobile layout */}
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={() => navigate(-1)}></span>
            {hasUrl ? (
              <a className="title" href={item.url} target={target} rel={rel}>
                {item.title}
              </a>
            ) : (
              <Link className="title" to={`/item/${item.id}`}>
                {item.title}
              </Link>
            )}
          </p>
        </div>

        {/* Laptop layout */}
        <div
          className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
        >
          <p>
            {hasUrl ? (
              <>
                <a className="title" href={item.url} target={target} rel={rel}>
                  {item.title}
                </a>
                {item.domain && <span className="domain"> ({item.domain})</span>}
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

        {/* Poll rendering */}
        {item.type === 'poll' && item.poll && (
          <div className="pollResults">
            {item.poll.map((pollOption, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollOption.content || '' }} />
                <div className="subtext">{pollOption.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: item.poll_votes_count
                      ? `${(pollOption.points / item.poll_votes_count) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Item content */}
        {item.content && (
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}

        {/* Comments */}
        {item.comments && item.comments.length > 0 && (
          <ul className="comment-list">
            {item.comments.map(comment => (
              <li key={comment.id}>
                <CommentComponent comment={comment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ItemDetails;
