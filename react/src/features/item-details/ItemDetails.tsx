import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchItemContent } from '../../api/hackernews';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../models/story';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { Comment } from './Comment';

type StoryDetails = Story & { content?: string; text?: string };

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const [item, setItem] = useState<StoryDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setErrorMessage('');

    fetchItemContent(Number(id), controller.signal)
      .then(story => {
        if (!controller.signal.aborted) {
          setItem(story);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
          return;
        }
        setErrorMessage('Could not load item comments.');
      });

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasUrl = item ? item.url?.indexOf('http') === 0 : false;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  const laptopClasses = ['laptop'];
  if (item && (item.comments_count > 0 || item.type === 'job')) {
    laptopClasses.push('item-header');
  }
  if (item?.text) {
    laptopClasses.push('head-margin');
  }

  return (
    <div className="main-content">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => window.history.back()}></span>
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
          <div className={laptopClasses.join(' ')}>
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
                    {' '}|{' '}
                    <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll?.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: item.poll_votes_count
                        ? `${(pollResult.points / item.poll_votes_count) * 100}%`
                        : '0%',
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: item.content ?? '' }}
          ></p>
          <ul className="comment-list">
            {item.comments?.map(comment => (
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
