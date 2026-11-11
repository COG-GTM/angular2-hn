import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { fetchItemContent } from '../api/hackerNewsApi';
import { Loader } from '../components/Loader/Loader';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import type { Story } from '../models';
import { useSettings } from '../settings';
import { formatCommentCount } from '../utils/formatCommentCount';
import { Comment } from './item-details/Comment';
import { sanitizeHtml } from './item-details/sanitizeHtml';
import './item-details/ItemDetails.scss';

type Item = Story & { content?: string; text?: string };
export function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [result, setResult] = useState<{ id?: string; item?: Item; error?: string }>({ id });
  useEffect(() => {
    const controller = new AbortController();
    window.scrollTo(0, 0);
    fetchItemContent(Number(id), controller.signal).then(item => {
      if (!item || !Number.isSafeInteger(item.id) || item.id <= 0 || !Array.isArray(item.comments)) {
        throw new Error('Invalid item response');
      }
      if (!controller.signal.aborted) setResult({ id, item });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ id, error: 'Could not load item comments.' });
    });
    return () => controller.abort();
  }, [id]);
  const item = result.id === id ? result.item : undefined;
  const error = result.id === id ? result.error : undefined;
  const hasUrl = item?.url?.indexOf('http') === 0;
  const title = item && (hasUrl
    ? <a className="title" href={item.url} target={settings.openLinkInNewTab ? '_blank' : undefined} rel={settings.openLinkInNewTab ? 'noopener' : undefined}>{item.title}</a>
    : <Link className="title active" to={`/item/${item.id}`}>{item.title}</Link>);
  return <div className="item-details-page"><div className="main-content">
    {!item && (error ? <ErrorMessage message={error} /> : <Loader />)}
    {item && <div className="item">
      <div className="mobile item-header"><p className="title-block">
        <span className="back-button" role="button" tabIndex={0} aria-label="Go back" onClick={() => navigate(-1)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') navigate(-1); }} />{title}
      </p></div>
      <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}>
        <p>{title}{hasUrl && item.domain && <> <span className="domain">({item.domain})</span></>}</p>
        <div className="subtext">
          {item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}
          <span className={item.type !== 'job' ? 'item-details' : undefined}>{item.time_ago}{item.type !== 'job' && <> | <Link className="active" to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></>}</span>
        </div>
      </div>
      {item.type === 'poll' && <div className="pollResults">{item.poll.map((option, index) => <div className="pollContent" key={index}>
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(option.content) }} />
        <div className="subtext">{option.points} points</div>
        <div className="pollBar" style={{ width: `${item.poll_votes_count ? option.points / item.poll_votes_count * 100 : 0}%` }} />
      </div>)}</div>}
      <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content || '') }} />
      <ul className="comment-list">{item.comments.map(comment => <li key={comment.id}><Comment comment={comment} /></li>)}</ul>
    </div>}
  </div></div>;
}
