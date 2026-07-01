import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Story } from '../models/story';
import { fetchItemContent } from '../api/hackerNews';
import { useSettings } from '../context/SettingsContext';
import { commentLabel } from '../utils/commentLabel';
import Comment from './Comment';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './ItemDetails.scss';

type StoryDetail = Story & { content?: string; text?: string };

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<StoryDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setErrorMessage('');
    window.scrollTo(0, 0);

    fetchItemContent(Number(id), controller.signal)
      .then((data) => setItem(data))
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }
        setErrorMessage('Could not load item comments.');
      });

    return () => controller.abort();
  }, [id]);

  const goBack = () => navigate(-1);

  const hasUrl = !!item && !!item.url && item.url.indexOf('http') === 0;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className="main-content">
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={goBack}></span>
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
            className={
              'laptop' +
              (item.comments_count > 0 || item.type === 'job'
                ? ' item-header'
                : '') +
              (item.text ? ' head-margin' : '')
            }
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
                      {commentLabel(item.comments_count)}
                    </Link>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && item.poll && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div
                    dangerouslySetInnerHTML={{ __html: pollResult.content }}
                  ></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width:
                        (item.poll_votes_count > 0
                          ? (pollResult.points / item.poll_votes_count) * 100
                          : 0) + '%',
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
