import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useItem } from '../../api/hooks';
import { useSettings } from '../../context/SettingsContext';
import { commentPipe } from '../../utils/commentPipe';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Comment } from './Comment';
import { sanitizeHtml } from '../../utils/sanitize';

export function ItemDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const itemID = +(params.id ?? 0);
  const { data: item, errorMessage } = useItem(itemID);

  const goBack = () => navigate(-1);

  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  const hasUrl = item ? item.url.indexOf('http') === 0 : false;

  const laptopClass = ['laptop'];
  if (item && (item.comments_count > 0 || item.type === 'job')) laptopClass.push('item-header');
  if (item && item.text) laptopClass.push('head-margin');

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
                <NavLink className="title" to={`/item/${item.id}`}>
                  {item.title}
                </NavLink>
              )}
            </p>
          </div>
          <div className={laptopClass.join(' ')}>
            {hasUrl ? (
              <p>
                <a className="title" href={item.url} target={target} rel={rel}>
                  {item.title}
                </a>
                {item.domain && (
                  <>
                    {' '}
                    <span className="domain">({item.domain})</span>
                  </>
                )}
              </p>
            ) : (
              <p>
                <NavLink className="title" to={`/item/${item.id}`}>
                  {item.title}
                </NavLink>
              </p>
            )}
            <div className="subtext">
              {item.type !== 'job' && (
                <span>
                  {item.points} points by{' '}
                  <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                </span>
              )}
              {item.type !== 'job' && ' '}
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <span>
                    {' '}
                    | <NavLink to={`/item/${item.id}`}>{commentPipe(item.comments_count)}</NavLink>
                  </span>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll?.map((pollResult, i) => (
                <div key={i} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: (pollResult.points / item.poll_votes_count) * 100 + '%',
                    }}
                  ></div>
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content ?? '') }}></p>
          <ul className="comment-list">
            {item.comments?.map((comment) => (
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
