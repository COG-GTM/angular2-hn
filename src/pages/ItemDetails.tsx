import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItemContent } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import type { Story } from '../types';
import Comment from '../components/Comment';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/item-details.scss';

export default function ItemDetails() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story>();
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        setItem(undefined); setErrorMessage('');
        fetchItemContent(Number(id), { signal: controller.signal }).then(setItem).catch((error: Error) => {
            if (error.name !== 'AbortError') setErrorMessage('Could not load item comments.');
        });
        window.scrollTo(0, 0);
        return () => controller.abort();
    }, [id]);
    if (!item) return <div className="main-content">{errorMessage ? <ErrorMessage message={errorMessage} /> : <Loader />}</div>;
    const hasUrl = (item.url || '').indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const title = hasUrl ? <a className="title" href={item.url} target={target} rel={target ? 'noopener' : undefined}>{item.title}</a> : <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>;
    return <div className="main-content"><div className="item item-details-page">
        <div className="mobile item-header"><p className="title-block"><button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Go back" />{title}</p></div>
        <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}>
            <p>{title}{hasUrl && item.domain && <span className="domain">({item.domain})</span>}</p>
            <div className="subtext">{item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link> </span>}<span className={item.type !== 'job' ? 'item-details' : undefined}>{item.time_ago}{item.type !== 'job' && <> | <Link to={`/item/${item.id}`}>{item.comments_count === 1 ? '1 comment' : item.comments_count ? `${item.comments_count} comments` : 'discuss'}</Link></>}</span></div>
        </div>
        {item.type === 'poll' && <div className="pollResults">{item.poll?.map((result, index) => <div className="pollContent" key={index}><div dangerouslySetInnerHTML={{ __html: result.content }} /><div className="subtext">{result.points} points</div><div className="pollBar" style={{ width: `${item.poll_votes_count ? result.points / item.poll_votes_count * 100 : 0}%` }} /></div>)}</div>}
        <p className="subject" dangerouslySetInnerHTML={{ __html: item.content || '' }} />
        <ul className="comment-list">{item.comments?.map((comment) => <li key={comment.id}><Comment comment={comment} /></li>)}</ul>
    </div></div>;
}
