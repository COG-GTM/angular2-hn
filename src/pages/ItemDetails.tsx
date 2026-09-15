import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchItemContent } from '../api/hackernews';
import { Comment, ErrorMessage, Loader } from '../components';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../models';
import { formatComments } from '../utils/formatComments';
import './ItemDetails.scss';

type ItemContent = Story & { content?: string };

export function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<ItemContent | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setItem(null);
        setErrorMessage('');
        fetchItemContent(Number(id))
            .then((result) => {
                if (!cancelled) {
                    setItem(result);
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

    const goBack = () => navigate(-1);

    if (!item) {
        return (
            <div className="main-content">
                {!errorMessage && <Loader />}
                {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = (item.url ?? '').indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const laptopClasses = [
        'laptop',
        item.comments_count > 0 || item.type === 'job' ? 'item-header' : '',
        item.content ? 'head-margin' : '',
    ]
        .filter(Boolean)
        .join(' ');

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
                <div className={laptopClasses}>
                    {hasUrl ? (
                        <p>
                            <a className="title" href={item.url} target={target} rel={rel}>
                                {item.title}
                            </a>
                            {' '}
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
                                {item.points} points by{' '}
                                <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={item.type !== 'job' ? 'item-details' : undefined}>
                            {item.time_ago}
                            {item.type !== 'job' && (
                                <span>
                                    {' | '}
                                    <Link to={`/item/${item.id}`}>{formatComments(item.comments_count)}</Link>
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
                                    style={{ width: `${(pollResult.points / item.poll_votes_count) * 100}%` }}
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
        </div>
    );
}
