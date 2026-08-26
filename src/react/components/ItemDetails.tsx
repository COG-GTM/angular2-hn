import { KeyboardEvent, useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Comment from './Comment';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import { fetchItemContent } from '../api/hackernews';
import { useSettings } from '../context/SettingsContext';
import { Story } from '../models/story';
import { formatComments } from '../utils/comments';
import './ItemDetails.scss';

function internalLinkClassName({ isActive }: { isActive: boolean }): string {
    return isActive ? 'active' : '';
}

function titleLinkClassName({ isActive }: { isActive: boolean }): string {
    return isActive ? 'title active' : 'title';
}

export default function ItemDetails() {
    const { id } = useParams<'id'>();
    const itemId = Number(id);
    const { settings } = useSettings();
    const navigate = useNavigate();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;

        setErrorMessage('');
        fetchItemContent(itemId)
            .then(nextItem => {
                if (ignore) {
                    return;
                }

                setItem(nextItem);
            })
            .catch(() => {
                if (ignore) {
                    return;
                }

                setErrorMessage('Could not load item comments.');
            });
        window.scrollTo(0, 0);

        return () => {
            ignore = true;
        };
    }, [itemId]);

    function goBack() {
        navigate(-1);
    }

    function handleBackKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    }

    if (!item) {
        return (
            <div className="main-content">
                {!errorMessage && <Loader />}
                {errorMessage && <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url?.indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const laptopClassName = [
        'laptop',
        item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
        item.text ? 'head-margin' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span
                            className="back-button"
                            role="button"
                            tabIndex={0}
                            onClick={goBack}
                            onKeyDown={handleBackKeyDown}
                        ></span>
                        {hasUrl ? (
                            <a className="title" href={item.url} target={target} rel={rel}>
                                {item.title}
                            </a>
                        ) : (
                            <NavLink
                                className={titleLinkClassName}
                                to={`/item/${item.id}`}
                            >
                                {item.title}
                            </NavLink>
                        )}
                    </p>
                </div>
                <div className={laptopClassName}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} target={target} rel={rel}>
                                {item.title}
                            </a>
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </p>
                    ) : (
                        <p>
                            <NavLink
                                className={titleLinkClassName}
                                to={`/item/${item.id}`}
                            >
                                {item.title}
                            </NavLink>
                        </p>
                    )}
                    <div className="subtext">
                        {item.type !== 'job' && (
                            <span>
                                {item.points} points by{' '}
                                <NavLink to={`/user/${item.user}`} className={internalLinkClassName}>
                                    {item.user}
                                </NavLink>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? 'item-details' : undefined}>
                            {item.time_ago}
                            {item.type !== 'job' && (
                                <span>
                                    {' | '}
                                    <NavLink
                                        to={`/item/${item.id}`}
                                        className={internalLinkClassName}
                                    >
                                        {formatComments(item.comments_count)}
                                    </NavLink>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll?.map((pollResult, index) => (
                            <div className="pollContent" key={pollResult.content || index}>
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: item.poll_votes_count
                                            ? (pollResult.points / item.poll_votes_count) * 100 + '%'
                                            : '0%',
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}
                <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }}></p>
                <ul className="comment-list">
                    {item.comments?.map(comment => (
                        <li key={comment.id}>
                            <Comment comment={comment} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
