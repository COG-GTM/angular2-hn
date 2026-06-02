import { Link, useNavigate, useParams } from 'react-router-dom';
import { useItemContent } from '../hooks/useItemContent';
import { useSettings } from '../context/SettingsContext';
import { Comment } from '../components/Comment';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatComment } from '../utils/formatComment';
import './ItemDetailPage.scss';

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const itemId = Number(params.id);
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { item, error } = useItemContent(itemId);

  const goBack = () => navigate(-1);
  const hasUrl = item ? (item.url ?? '').indexOf('http') === 0 : false;
  const isJob = item?.type === 'job';

  const target = settings.openLinkInNewTab ? '_blank' : undefined;
  const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

  return (
    <div className="main-content">
      {!item && !error && <Loader />}
      {!item && error !== '' && <ErrorMessage message={error} />}

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
            className={[
              'laptop',
              item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
              item.text ? 'head-margin' : '',
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
                    <Link to={`/item/${item.id}`}>{formatComment(item.comments_count)}</Link>
                  </span>
                )}
              </span>
            </div>
          </div>

          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: `${
                        item.poll_votes_count > 0
                          ? (pollResult.points / item.poll_votes_count) * 100
                          : 0
                      }%`,
                    }}
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
