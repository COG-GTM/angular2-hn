import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useHackerNewsAPI } from '../hooks/useHackerNewsAPI';
import { useSettings } from '../context/SettingsContext';
import { formatCommentCount } from '../utils/formatters';
import Comment from './Comment';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './ItemDetails.scss';

export function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchItemContent } = useHackerNewsAPI();
  const { settings } = useSettings();

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setItem(null);

    fetchItemContent(parseInt(id))
      .then(data => {
        setItem(data);
      })
      .catch(() => setErrorMessage('Could not load item comments.'))
      .finally(() => setLoading(false));

    window.scrollTo(0, 0);
  }, [id, fetchItemContent]);

  const goBack = () => {
    navigate(-1);
  };

  const hasUrl = item && item.url && item.url.indexOf('http') === 0;

  return (
    <div className="main-content">
      {loading && !errorMessage && <Loader />}
      {!loading && errorMessage && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={goBack}></span>
              {hasUrl ? (
                <a 
                  className="title" 
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : null}
                  rel={settings.openLinkInNewTab ? 'noreferrer' : null}
                >
                  {item.title}
                </a>
              ) : (
                <Link className="title" to={`/item/${item.id}`}>
                  {item.title}
                </Link>
              )}
            </p>
          </div>
          <div className={`laptop ${(item.comments_count > 0 || item.type === 'job') ? 'item-header' : ''} ${item.content ? 'head-margin' : ''}`}>
            {hasUrl ? (
              <p>
                <a 
                  className="title" 
                  href={item.url}
                  target={settings.openLinkInNewTab ? '_blank' : null}
                  rel={settings.openLinkInNewTab ? 'noreferrer' : null}
                >
                  {item.title}
                </a>
                {item.domain && <span className="domain">({item.domain})</span>}
              </p>
            ) : (
              <p>
                <Link className="title" to={`/item/${item.id}`}>
                  {item.title}
                </Link>
              </p>
            )}
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
              {item.poll.map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div 
                    className="pollBar" 
                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          {item.content && (
            <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }}></p>
          )}
          <ul className="comment-list">
            {item.comments && item.comments.map(comment => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;
