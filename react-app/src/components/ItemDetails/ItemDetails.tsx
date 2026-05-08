import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Story } from '../../models/story';
import { fetchItemContent } from '../../services/hackernews-api';
import { useSettings } from '../../contexts/SettingsContext';
import { CommentItem } from '../Comment/Comment';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './ItemDetails.scss';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const hasUrl = item?.url?.startsWith('http');

  useEffect(() => {
    setLoading(true);
    setError(false);
    window.scrollTo(0, 0);
    fetchItemContent(parseInt(id || '0', 10))
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="main-content">
        <ErrorMessage />
      </div>
    );
  }

  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener noreferrer' : undefined;

  return (
    <div className="main-content">
      <div className="item-header mobile">
        <span className="back-button" onClick={() => navigate(-1)}></span>
        <div className="title-block">{item.title}</div>
      </div>
      <div className="item">
        <div className="item-header laptop">
          <div className="head-margin">
            <p className="title">
              {hasUrl ? (
                <a href={item.url} target={target} rel={rel}>
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
              {item.domain && <span className="domain"> ({item.domain})</span>}
            </p>
            <div className="subtext">
              {item.points} points by{' '}
              <Link to={`/user/${item.user}`}>{item.user}</Link> {item.time_ago}
            </div>
          </div>
        </div>
        {item.type === 'poll' && item.poll && (
          <div className="pollResults">
            {item.poll.map((pollItem, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollItem.content }} />
                <div
                  className="pollBar"
                  style={{
                    width: `${(pollItem.points / item.poll_votes_count) * 100}%`,
                  }}
                ></div>
                <p>{pollItem.points} points</p>
              </div>
            ))}
          </div>
        )}
        {item.content && (
          <div className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
        {item.comments && item.comments.length > 0 && (
          <ul>
            {item.comments.map((comment) => (
              <li key={comment.id}>
                <CommentItem comment={comment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
