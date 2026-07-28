import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../../context/useSettings';
import { fetchItemContent } from '../../services/hackerNewsApi';
import type { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import { Comment } from './Comment';
import './ItemDetails.scss';

export function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<Story | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    setItem(undefined);
    setErrorMessage('');

    fetchItemContent(Number(id))
      .then((result) => {
        if (!ignore) {
          setItem(result);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage('Could not load item comments.');
        }
      });

    window.scrollTo(0, 0);

    return () => {
      ignore = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  if (!item) {
    return (
      <div className="main-content">
        {errorMessage !== '' ? <ErrorMessage message={errorMessage} /> : <Loader />}
      </div>
    );
  }

  const hasUrl = (item.url ?? '').indexOf('http') === 0;
  const isJob = item.type === 'job';
  const externalLinkProps = settings.openLinkInNewTab
    ? { target: '_blank', rel: 'noopener' }
    : {};

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={goBack}></span>
            {hasUrl ? (
              <a className="title" href={item.url} {...externalLinkProps}>
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
            item.comments_count > 0 || isJob ? 'item-header' : '',
            item.text ? 'head-margin' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasUrl ? (
            <p>
              <a className="title" href={item.url} {...externalLinkProps}>
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
            {!isJob && (
              <span>
                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            )}
            <span className={!isJob ? 'item-details' : undefined}>
              {item.time_ago}
              {!isJob && (
                <span>
                  {' | '}
                  <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && (
          <div className="pollResults">
            {item.poll.map((pollResult, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
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
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
        <ul className="comment-list">
          {item.comments.map((comment) => (
            <li key={comment.id}>
              <Comment comment={comment} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
