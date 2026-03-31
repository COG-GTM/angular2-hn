import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useItemDetails } from '../../hooks/useItemDetails';
import { useSettings } from '../../contexts/SettingsContext';
import { formatComment } from '../../utils/formatComment';
import Comment from '../../components/Comment/Comment';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './ItemDetailsPage.scss';

export default function ItemDetailsPage() {
  const { id = '0' } = useParams<{ id: string }>();
  const itemId = parseInt(id, 10);
  const { item, error } = useItemDetails(itemId);
  const { settings } = useSettings();
  const navigate = useNavigate();

  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const goBack = () => navigate(-1);

  const hasUrl = item?.url ? item.url.indexOf('http') === 0 : false;

  return (
    <div className="main-content">
      {!item && !error && <Loader />}
      {!item && error && <ErrorMessage message={error} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={goBack}></span>
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
          <div
            className={`laptop${
              item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''
            }${item.content ? ' head-margin' : ''}`}
          >
            {hasUrl ? (
              <p>
                <a className="title" href={item.url} target={linkTarget} rel={linkRel}>
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
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    |{' '}
                    <Link to={`/item/${item.id}`}>
                      {formatComment(item.comments_count)}
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

          {item.content && (
            <p
              className="subject"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}

          <ul className="comment-list">
            {item.comments &&
              item.comments.map((comment) => (
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
