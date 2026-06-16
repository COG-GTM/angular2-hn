import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Story } from '../../models/Story';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { useSettings } from '../../contexts/SettingsContext';
import { formatComments } from '../../utils/commentFormat';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Comment from '../../components/Comment/Comment';
import './ItemDetails.scss';

const ItemDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [item, setItem] = useState<Story | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    setItem(undefined);
    setErrorMessage('');
    window.scrollTo(0, 0);
    fetchItemContent(Number(id))
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => {
        if (active) setErrorMessage('Could not load item comments.');
      });
    return () => {
      active = false;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  if (!item) {
    return (
      <div className="main-content item-page">
        {!errorMessage && <Loader />}
        {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
      </div>
    );
  }

  const hasUrl = !!item.url && item.url.indexOf('http') === 0;
  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  const laptopClasses = [
    'laptop',
    item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
    item.text ? 'head-margin' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="main-content item-page">
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
        <div className={laptopClasses}>
          {hasUrl ? (
            <p>
              <a className="title" href={item.url} target={target} rel={rel}>
                {item.title}
              </a>{' '}
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
                  | <Link to={`/item/${item.id}`}>{formatComments(item.comments_count)}</Link>
                </span>
              )}
            </span>
          </div>
        </div>
        {item.type === 'poll' && (
          <div className="pollResults">
            {item.poll.map((pollResult, index) => (
              <div className="pollContent" key={index}>
                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                <div className="subtext">{pollResult.points} points</div>
                <div
                  className="pollBar"
                  style={{
                    width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}
        <p
          className="subject"
          dangerouslySetInnerHTML={{ __html: item.content || '' }}
        ></p>
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
};

export default ItemDetails;
