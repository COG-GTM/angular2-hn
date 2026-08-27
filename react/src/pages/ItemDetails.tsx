import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItem } from '../api/hackerNewsApi';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../types/models';
import { Comment } from '../components/Comment';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { formatCommentCount } from '../utils/formatCommentCount';

export function ItemDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [item, setItem] = useState<Story | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setErrorMessage('');
    fetchItem(Number.parseInt(id, 10), controller.signal).then((nextItem) => {
      setItem(nextItem);
      window.scrollTo(0, 0);
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorMessage('Could not load item comments.');
    });
    return () => controller.abort();
  }, [id]);

  if (!item) return <div className="main-content">{errorMessage ? <ErrorMessage message={errorMessage} /> : <Loader />}</div>;
  const hasUrl = item.url.startsWith('http');
  const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
  const titleLink = hasUrl ? <a className="title" href={item.url} {...externalProps}>{item.title}</a> : <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>;
  return (
    <div className="main-content"><div className="item">
      <div className="mobile item-header"><p className="title-block"><button className="back-button" onClick={() => navigate(-1)} aria-label="Go back" />{titleLink}</p></div>
      <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.text ? ' head-margin' : ''}`}>
        <p>{titleLink}{hasUrl && item.domain && <span className="domain">({item.domain})</span>}</p>
        <div className="subtext">{item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}<span className={item.type !== 'job' ? 'item-details' : undefined}>{item.time_ago}{item.type !== 'job' && <> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></>}</span></div>
      </div>
      {item.type === 'poll' && <div className="pollResults">{item.poll.map((pollResult, index) => <div className="pollContent" key={`${item.id}-${index}`}><div dangerouslySetInnerHTML={{ __html: pollResult.content }} /><div className="subtext">{pollResult.points} points</div><div className="pollBar" style={{ width: `${item.poll_votes_count ? pollResult.points / item.poll_votes_count * 100 : 0}%` }} /></div>)}</div>}
      {item.content && <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }} />}
      <ul className="comment-list">{item.comments.map((comment) => <li key={comment.id}><Comment comment={comment} /></li>)}</ul>
    </div></div>
  );
}
