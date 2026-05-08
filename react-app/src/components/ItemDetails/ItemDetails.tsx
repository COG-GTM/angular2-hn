import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackernews-api';
import { useSettings } from '../../hooks/useSettings';
import CommentComponent from '../Comment/Comment';
import Loader from '../Loader/Loader';
import './ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchItemContent(Number(id));
        if (active) {
          setItem(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="item-detail-wrapper"><Loader /></div>;
  if (error) return <div className="item-detail-wrapper"><div className="error-message">Error: {error}</div></div>;
  if (!item) return null;

  const linkTarget = settings.openLinkInNewTab ? '_blank' : '_self';

  return (
    <div className="item-detail-wrapper">
      <div className="item-header">
        <span className="back-button" onClick={goBack}></span>
        {item.url ? (
          <a href={item.url} target={linkTarget} rel="noopener noreferrer" className="item-title-link">
            <h2>{item.title}</h2>
          </a>
        ) : (
          <h2>{item.title}</h2>
        )}
        {item.domain && <span className="domain">({item.domain})</span>}
        <div className="subtext">
          {item.points} points by{' '}
          <Link to={`/user/${item.user}`}>{item.user}</Link> {item.time_ago}
          {' | '}
          {item.comments_count} comments
        </div>
      </div>
      {item.content && (
        <div
          className="item-text"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      )}
      {item.type === 'poll' && item.poll && (
        <div className="poll-section">
          {item.poll.map((pollOption, i) => (
            <div key={i} className="pollContent">
              <div
                className="pollText"
                dangerouslySetInnerHTML={{ __html: pollOption.content }}
              />
              <div className="pollBar" style={{ width: `${(pollOption.points / (item.poll_votes_count || 1)) * 100}%` }}>
                {pollOption.points} points
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="comments-section">
        {item.comments && item.comments.map((comment) => (
          <CommentComponent key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
