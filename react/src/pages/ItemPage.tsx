import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { Item } from '../api/types';
import { CommentTree } from '../components/CommentTree';
import { ErrorMessage } from '../components/ErrorMessage';
import { HtmlContent } from '../components/HtmlContent';
import { Loader } from '../components/Loader';
import { useItem } from '../hooks/useItem';
import { useSettings } from '../hooks/useSettings';
import './ItemPage.css';

// Inlined port of the Angular `comment` pipe; deduplicate with utils/ once T6 lands.
function commentLabel(count: number): string {
  if (count > 0) {
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}

/** Bar width for a poll option, as a percentage of all votes. */
export function pollPercent(points: number, total: number | undefined): number {
  return total ? (points / total) * 100 : 0;
}

function ItemTitle({ item }: { item: Item }) {
  const { settings } = useSettings();
  if (item.url.indexOf('http') === 0) {
    const newTab = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    return (
      <a className="title" href={item.url} {...newTab}>
        {item.title}
      </a>
    );
  }
  return (
    <Link className="title" to={`/item/${item.id}`}>
      {item.title}
    </Link>
  );
}

function ItemDetails({ item }: { item: Item }) {
  const navigate = useNavigate();
  const isJob = item.type === 'job';
  const laptopClass = [
    'laptop',
    item.comments_count > 0 || isJob ? 'item-header' : '',
    item.content ? 'head-margin' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className="item-page">
      <div className="mobile item-header">
        <p className="title-block">
          <button type="button" className="back-button" aria-label="Back" onClick={() => navigate(-1)} />
          <ItemTitle item={item} />
        </p>
      </div>
      <div className={laptopClass}>
        <p>
          <ItemTitle item={item} />
          {item.url.indexOf('http') === 0 && item.domain && <span className="domain"> ({item.domain})</span>}
        </p>
        <div className="subtext">
          {!isJob && (
            <span>
              {item.points !== null && `${item.points} points `}by{' '}
              {item.user && <Link to={`/user/${item.user}`}>{item.user}</Link>}{' '}
            </span>
          )}
          <span className={isJob ? undefined : 'item-details'}>
            {item.time_ago}
            {!isJob && (
              <span>
                {' | '}
                <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
              </span>
            )}
          </span>
        </div>
      </div>
      {item.type === 'poll' && item.poll && (
        <ul className="poll-results comment-list" aria-label="Poll results">
          {item.poll.map((option, i) => (
            <li key={i} className="poll-option">
              <HtmlContent html={option.content ?? option.item} />
              <div className="subtext">{option.points} points</div>
              <div
                className="poll-bar"
                data-testid="poll-bar"
                style={{ width: `${pollPercent(option.points, item.poll_votes_count)}%` }}
              />
            </li>
          ))}
        </ul>
      )}
      {item.content && <HtmlContent as="div" className="subject" html={item.content} />}
      <ul className="comment-list" aria-label="Comments">
        {item.comments.map((comment) => (
          <li key={comment.id}>
            <CommentTree comment={comment} />
          </li>
        ))}
      </ul>
    </article>
  );
}

/** Port of item-details/item-details.component; lazy-loaded at `/item/:id`. */
export default function ItemPage() {
  const { id } = useParams();
  const itemId = Number(id);
  const valid = Number.isInteger(itemId) && itemId > 0;
  const state = useItem(valid ? itemId : null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [itemId]);

  if (!valid || state.status === 'error') {
    return (
      <div className="item-main">
        <ErrorMessage message="Could not load item comments." />
      </div>
    );
  }
  return <div className="item-main">{state.status === 'loading' ? <Loader /> : <ItemDetails item={state.item} />}</div>;
}
