import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { fetchItemContent } from '../../services/hackernews-api';
import type { Story } from '../../types/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import Comment from '../Comment/Comment';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Loader from '../Loader/Loader';
import './ItemDetails.scss';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setItem(null);
    setErrorMessage('');
    window.scrollTo(0, 0);

    fetchItemContent(Number(id))
      .then((data) => {
        if (cancelled) return;
        setItem(data);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage('Could not load item comments.');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  if (!item && !errorMessage) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (!item && errorMessage) {
    return (
      <div className="main-content">
        <ErrorMessage message={errorMessage} />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const hasUrl = item.url ? item.url.indexOf('http') === 0 : false;
  const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
  const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;

  const laptopClassName = ['laptop'];
  if (item.comments_count > 0 || item.type === 'job') {
    laptopClassName.push('item-header');
  }
  if ((item as Story & { text?: string }).text) {
    laptopClassName.push('head-margin');
  }

  return (
    <div className="main-content">
      <div className="item">
        <div className="mobile item-header">
          <p className="title-block">
            <span className="back-button" onClick={goBack} />
            {hasUrl ? (
              <a
                className="title"
                href={item.url}
                target={linkTarget}
                rel={linkRel}
              >
                {item.title}
              </a>
            ) : (
              <Link to={`/item/${item.id}`} className="title">
                {item.title}
              </Link>
            )}
          </p>
        </div>
        <div className={laptopClassName.join(' ')}>
          {hasUrl ? (
            <p>
              <a
                className="title"
                href={item.url}
                target={linkTarget}
                rel={linkRel}
              >
                {item.title}
              </a>
              {item.domain ? (
                <span className="domain"> ({item.domain})</span>
              ) : null}
            </p>
          ) : (
            <p>
              <Link to={`/item/${item.id}`} className="title">
                {item.title}
              </Link>
            </p>
          )}
          <div className="subtext">
            {item.type !== 'job' ? (
              <span>
                {item.points} points by{' '}
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
            ) : null}
            <span className={item.type !== 'job' ? 'item-details' : undefined}>
              {item.time_ago}
              {item.type !== 'job' ? (
                <span>
                  {' | '}
                  <Link to={`/item/${item.id}`}>
                    {formatCommentCount(item.comments_count)}
                  </Link>
                </span>
              ) : null}
            </span>
          </div>
        </div>
        {item.type === 'poll' && Array.isArray(item.poll) ? (
          <div className="pollResults">
            {item.poll.map((pollResult, index) => (
              <div key={index} className="pollContent">
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${
                      (pollResult.points / item.poll_votes_count) * 100
                    }%`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : null}
        <p
          className="subject"
          dangerouslySetInnerHTML={{
            __html: (item as Story & { content?: string }).content ?? '',
          }}
        />
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
