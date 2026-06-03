import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { useSettings } from '../../context/useSettings';
import { useFetch } from '../../hooks/useFetch';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { CommentComponent } from './Comment';

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
    'Error fetching item content',
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!item) return null;

  const target = settings.openLinkInNewTab ? '_blank' : '_self';

  return (
    <div className="item-details">
      <div className="item-header">
        <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back"></button>

        {/* Mobile layout */}
        <div className="subtext-palm">
          <a href={item.url} target={target} rel="noopener noreferrer" className="title">
            {item.title}
          </a>
          {item.domain && <span className="domain"> ({item.domain})</span>}
          <div className="meta">
            {item.points !== undefined && <span>{item.points} points</span>}
            {item.user && <span> by {item.user}</span>}
            {' '}{item.time_ago}
          </div>
        </div>

        {/* Laptop layout */}
        <div className="subtext-laptop">
          <a href={item.url} target={target} rel="noopener noreferrer" className="title">
            {item.title}
          </a>
          {item.domain && <span className="domain"> ({item.domain})</span>}
          <div className="meta">
            {item.points !== undefined && <span>{item.points} points</span>}
            {item.user && <span> by {item.user}</span>}
            {' '}{item.time_ago}
          </div>
        </div>
      </div>

      {/* Poll rendering */}
      {item.type === 'poll' && item.poll && (
        <div className="poll-section">
          {item.poll.map((pollOption, index) => (
            <div key={index} className="pollContent">
              <div dangerouslySetInnerHTML={{ __html: pollOption.content || '' }} />
              <span className="pollPoints">{pollOption.points} points</span>
              <div
                className="pollBar"
                style={{
                  width: item.poll_votes_count
                    ? `${(pollOption.points / item.poll_votes_count) * 100}%`
                    : '0%',
                }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* Item content */}
      {item.content && (
        <div className="item-content" dangerouslySetInnerHTML={{ __html: item.content }} />
      )}

      {/* Comments */}
      {item.comments && item.comments.length > 0 && (
        <div className="comments-section">
          {item.comments.map(comment => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemDetails;
