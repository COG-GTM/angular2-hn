import { useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { fetchItemContent } from '../../api/hn';
import { useAsync } from '../../api/useAsync';
import type { Story } from '../../api/types';
import { useSettings } from '../../settings/useSettings';
import { Loader } from '../../shared/Loader/Loader';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { commentLabel } from '../../utils/commentLabel';
import { hasUrl } from '../../utils/hasUrl';
import { externalLinkProps } from '../../utils/linkProps';
import { Comment } from './Comment/Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const { openLinkInNewTab } = useSettings();
  const { data: item, error } = useAsync((signal) => fetchItemContent(id, signal), [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="hn-item-details">
      <div className="main-content">
        {!item && !error && <Loader />}
        {!item && error && <ErrorMessage message="Could not load item comments." />}
        {item && <Item item={item} openLinkInNewTab={openLinkInNewTab} goBack={() => navigate(-1)} />}
      </div>
    </div>
  );
}

function Item({ item, openLinkInNewTab, goBack }: { item: Story; openLinkInNewTab: boolean; goBack: () => void }) {
  const external = hasUrl(item.url);
  const linkProps = externalLinkProps(openLinkInNewTab);
  const title = external ? (
    <a className="title" href={item.url} {...linkProps}>
      {` ${item.title} `}
    </a>
  ) : (
    <NavLink className="title" to={`/item/${item.id}`}>
      {` ${item.title} `}
    </NavLink>
  );
  const laptopClass = ['laptop', (item.comments_count > 0 || item.type === 'job') && 'item-header']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="item">
      <div className="mobile item-header">
        <p className="title-block">
          <span
            className="back-button"
            role="button"
            tabIndex={0}
            aria-label="Back"
            onClick={goBack}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goBack();
              }
            }}
          ></span>
          {title}
        </p>
      </div>
      <div className={laptopClass}>
        <p>
          {title}
          {external && item.domain && <span className="domain">({item.domain})</span>}
        </p>
        <div className="subtext">
          {item.type !== 'job' && (
            <span>
              {` ${item.points} points by `}
              <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
          )}
          <span className={item.type !== 'job' ? 'item-details' : undefined}>
            {` ${item.time_ago} `}
            {item.type !== 'job' && (
              <span>
                {' | '}
                <NavLink to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</NavLink>
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
              <div className="pollBar" style={{ width: (pollResult.points / item.poll_votes_count!) * 100 + '%' }}></div>
            </div>
          ))}
        </div>
      )}
      <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
      <ul className="comment-list">
        {(item.comments ?? []).map((comment) => (
          <li key={comment.id}>
            <Comment comment={comment} />
          </li>
        ))}
      </ul>
    </div>
  );
}
