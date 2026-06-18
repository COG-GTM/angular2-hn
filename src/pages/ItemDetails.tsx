import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchItemContent } from '../services/hackerNewsApi';
import { Story } from '../models/Story';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount } from '../utils/formatCommentCount';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import CommentItem from '../components/CommentItem';
import '../styles/ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setItem(null);
    setErrorMessage('');
    if (id) {
      fetchItemContent(parseInt(id, 10))
        .then(setItem)
        .catch(() => setErrorMessage('Could not load item comments.'));
    }
    window.scrollTo(0, 0);
  }, [id]);

  const hasUrl = item ? item.url && item.url.indexOf('http') === 0 : false;

  const linkProps = settings.openLinkInNewTab
    ? { target: '_blank' as const, rel: 'noopener' }
    : {};

  return (
    <div className="item-details-content">
      <div className="main-content">
        {!item && !errorMessage && <Loader />}
        {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

        {item && (
          <div className="item">
            <div className="mobile item-header">
              <p className="title-block">
                <span className="back-button" onClick={() => navigate(-1)}></span>
                {hasUrl ? (
                  <a className="title" href={item.url} {...linkProps}>{item.title}</a>
                ) : (
                  <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
                )}
              </p>
            </div>
            <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}>
              {hasUrl ? (
                <p>
                  <a className="title" href={item.url} {...linkProps}>{item.title}</a>
                  {item.domain && <span className="domain"> ({item.domain})</span>}
                </p>
              ) : (
                <p>
                  <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
                </p>
              )}
              <div className="subtext">
                {item.type !== 'job' && (
                  <span>
                    {item.points} points by{' '}
                    <Link to={`/user/${item.user}`}>{item.user}</Link>
                  </span>
                )}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                  {item.time_ago}
                  {item.type !== 'job' && (
                    <span> |{' '}
                      <Link to={`/item/${item.id}`}>
                        {formatCommentCount(item.comments_count)}
                      </Link>
                    </span>
                  )}
                </span>
              </div>
            </div>
            {item.type === 'poll' && item.poll && (
              <div className="pollResults">
                {item.poll.map((pollResult, idx) => (
                  <div key={idx} className="pollContent">
                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                    <div className="subtext">{pollResult.points} points</div>
                    <div
                      className="pollBar"
                      style={{ width: (pollResult.points / item.poll_votes_count * 100) + '%' }}
                    />
                  </div>
                ))}
              </div>
            )}
            {item.content && (
              <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
            )}
            {item.comments && item.comments.length > 0 && (
              <ul className="comment-list">
                {item.comments.map((comment) => (
                  <li key={comment.id}>
                    <CommentItem comment={comment} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
