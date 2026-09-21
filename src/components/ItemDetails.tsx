import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hackerNewsApi';
import { useSettings } from '../context/useSettings';
import type { Story } from '../models';
import { commentLabel } from '../utils/comment';
import { sanitizeHtml } from '../utils/sanitize';
import { Comment } from './Comment';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';
import './ItemDetails.scss';

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItem(null);
        setErrorMessage('');

        fetchItemContent(Number(id))
            .then((story) => {
                if (!cancelled) {
                    setItem(story);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load item comments.');
                }
            });

        window.scrollTo(0, 0);

        return () => {
            cancelled = true;
        };
    }, [id]);

    const goBack = () => window.history.back();

    if (!item) {
        return (
            <div className="main-content">
                {errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = !!item.url && item.url.indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || item.type === 'job') {
        laptopClasses.push('item-header');
    }
    if (item.text) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content">
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
                <div className={laptopClasses.join(' ')}>
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
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? 'item-details' : undefined}>
                            {item.time_ago}
                            {item.type !== 'job' && (
                                <span>
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll.map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}></p>
                <ul className="comment-list">
                    {item.comments?.map((comment) => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
