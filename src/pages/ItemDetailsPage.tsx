import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Comment } from '../components/Comment/Comment';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import { useSettings } from '../context/SettingsContext';
import { useAsync } from '../hooks/useAsync';
import { fetchItemContent } from '../services/hackerNewsApi';
import { commentLabel } from '../utils/format';
import './ItemDetailsPage.scss';

export function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { data: item, loading, error } = useAsync((signal) => fetchItemContent(Number(id), signal), [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const hasUrl = item !== null && item.url.indexOf('http') === 0;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className="main-content">
      {loading && <Loader />}
      {!loading && error !== null && <ErrorMessage message="Could not load story." />}

      {item && (
        <div className="item">
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
          <div
            className={[
              'laptop',
              item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
              item.content ? 'head-margin' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {hasUrl ? (
              <p>
                <a className="title" href={item.url} target={target} rel={rel}>
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
                  {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    | <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{ width: `${(pollResult.points / (item.poll_votes_count ?? 1)) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
          <ul className="comment-list">
            {item.comments.map((comment) => (
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
