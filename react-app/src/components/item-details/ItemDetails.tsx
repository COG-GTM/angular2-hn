import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { Story } from '../../models';
import { fetchItemContent } from '../../services/hackernewsApi';
import { commentCount } from '../../utils/comment';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import Comment from './Comment';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');
        window.scrollTo(0, 0);

        fetchItemContent(Number(id), controller.signal)
            .then(setItem)
            .catch((error: Error) => {
                if (error.name !== 'AbortError') {
                    setErrorMessage('Could not load item comments.');
                }
            });

        return () => controller.abort();
    }, [id]);

    if (!item) {
        return (
            <div className="main-content">
                {!errorMessage && <Loader />}
                {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            </div>
        );
    }

    const hasUrl = item.url ? item.url.indexOf('http') === 0 : false;
    const isJob = item.type === 'job';
    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || isJob) {
        laptopClasses.push('item-header');
    }
    if (item.content) {
        laptopClasses.push('head-margin');
    }

    const titleLink = hasUrl ? (
        <a
            className="title"
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
        >
            {item.title}
        </a>
    ) : (
        <Link className="title" to={`/item/${item.id}`}>
            {item.title}
        </Link>
    );

    return (
        <div className="main-content">
            <div className="item">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={() => navigate(-1)}></span>
                        {titleLink}
                    </p>
                </div>
                <div className={laptopClasses.join(' ')}>
                    <p>
                        {titleLink}
                        {hasUrl && item.domain && <span className="domain">({item.domain})</span>}
                    </p>
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
                                    {' '}
                                    | <Link to={`/item/${item.id}`}>{commentCount(item.comments_count)}</Link>
                                </span>
                            )}
                        </span>
                    </div>
                </div>
                {item.type === 'poll' && (
                    <div className="pollResults">
                        {item.poll?.map((pollResult, index) => (
                            <div className="pollContent" key={index}>
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${(pollResult.points / item.poll_votes_count) * 100}%`,
                                    }}
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
        </div>
    );
}
