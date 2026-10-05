import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

import { useItem } from '../../api/hooks';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useSettings } from '../../context/settings';
import type { Story } from '../../models';
import { externalLinkProps, formatCommentCount, hasExternalUrl } from '../../utils';
import { Comment } from './Comment';
import './ItemDetails.scss';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const itemId = Number(id);
  const { data: item, isError } = useItem(itemId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const errorMessage = isError || !Number.isFinite(itemId) ? 'Could not load item comments.' : '';

  return (
    <div className="main-content item-details-page" data-testid="item-details-page" data-item-id={id}>
      {!item && !errorMessage && <Loader />}
      {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
      {item && <ItemDetails item={item} />}
    </div>
  );
}

function ItemDetails({ item }: { item: Story }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const hasUrl = hasExternalUrl(item.url);
  const linkProps = externalLinkProps(settings.openLinkInNewTab);

  const titleLink = hasUrl ? (
    <a className="title" href={item.url} {...linkProps}>
      {item.title}
    </a>
  ) : (
    <NavLink className="title" to={`/item/${item.id}`}>
      {item.title}
    </NavLink>
  );

  return (
    <div className="item">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={() => navigate(-1)}></span>
          {titleLink}
        </p>
      </div>
      <div className={item.comments_count > 0 || item.type === 'job' ? 'laptop item-header' : 'laptop'}>
        <p>
          {titleLink}
          {hasUrl && item.domain && <span className="domain"> ({item.domain})</span>}
        </p>
        <div className="subtext">
          {item.type !== 'job' && (
            <span>
              {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
          )}
          <span className={item.type !== 'job' ? 'item-details' : undefined}>
            {item.time_ago}
            {item.type !== 'job' && (
              <span>
                {' | '}
                <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
              </span>
            )}
          </span>
        </div>
      </div>
      {item.type === 'poll' && (
        <div className="pollResults">
          {item.poll?.map((pollResult, i) => (
            <div key={i} className="pollContent">
              <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
              <div className="subtext">{pollResult.points} points</div>
              <div
                className="pollBar"
                style={{ width: `${(pollResult.points / (item.poll_votes_count ?? NaN)) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      )}
      <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
      <ul className="comment-list">
        {item.comments?.map((comment) => (
          <li key={comment.id}>
            <Comment comment={comment} />
          </li>
        ))}
      </ul>
    </div>
  );
}
