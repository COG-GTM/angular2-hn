import { useParams, useNavigate, Link } from 'react-router-dom';
import { useItemDetails } from '../../hooks/useItemDetails';
import { useSettings } from '../../context/SettingsContext';
import Comment from './Comment';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { item, error, loading } = useItemDetails(Number(id));

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!item) return <ErrorMessage message="Item not found" />;

  const hasExternalUrl = item.url && !item.url.startsWith('item?');
  const target = settings.openLinkInNewTab ? '_blank' : '_self';

  return (
    <div className="item-details">
      <div className="item-details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      </div>

      <div className="item-details-title">
        {hasExternalUrl ? (
          <a href={item.url} target={target} rel="noopener noreferrer">{item.title}</a>
        ) : (
          <span>{item.title}</span>
        )}
        {item.domain && <span className="item-details-domain">({item.domain})</span>}
      </div>

      <div className="item-details-meta">
        {item.points !== null && item.points !== undefined && (
          <span>{item.points} points</span>
        )}
        {item.user && (
          <span> by <Link to={`/user/${item.user}`}>{item.user}</Link></span>
        )}
        {item.time_ago && <span> {item.time_ago}</span>}
      </div>

      {item.type === 'poll' && item.poll && Array.isArray(item.poll) && (
        <div className="item-details-poll">
          {item.poll.map((pollItem, idx) => (
            <div key={idx} className="poll-item">
              <span className="poll-points">{pollItem.points} points</span>
              <span className="poll-content" dangerouslySetInnerHTML={{ __html: pollItem.content }} />
            </div>
          ))}
          {item.poll_votes_count && (
            <div className="poll-total">{item.poll_votes_count} total votes</div>
          )}
        </div>
      )}

      {item.comments && item.comments.length > 0 && (
        <div className="item-details-comments">
          <h3>{item.comments_count} comments</h3>
          {item.comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
