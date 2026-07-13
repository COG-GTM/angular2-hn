import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Loader } from '../components/loader/Loader';
import { ErrorMessage } from '../components/error-message/ErrorMessage';
import { Comment } from './Comment';
import { fetchItemContent } from '../services/hackernews-api';
import { useSettings } from '../services/settings-context';
import { commentLabel } from '../utils/comment';
import { Story } from '../models/story';
import './ItemDetails.scss';

export const ItemDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();

    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const itemID = Number(id);

        fetchItemContent(itemID, controller.signal)
            .then((result) => setItem(result))
            .catch(() => setErrorMessage('Could not load item comments.'));

        window.scrollTo(0, 0);

        return () => controller.abort();
    }, [id]);

    const goBack = () => navigate(-1);

    if (!item && !errorMessage) {
        return (
            <div className="item-details-view">
                <div className="main-content">
                    <Loader />
                </div>
            </div>
        );
    }

    if (!item && errorMessage !== '') {
        return (
            <div className="item-details-view">
                <div className="main-content">
                    <ErrorMessage message={errorMessage} />
                </div>
            </div>
        );
    }

    if (!item) {
        return null;
    }

    const hasUrl = item.url.indexOf('http') === 0;

    const laptopClasses = ['laptop'];
    if (item.comments_count > 0 || item.type === 'job') {
        laptopClasses.push('item-header');
    }
    if (item.text) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="item-details-view">
            <div className="main-content">
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
                            {hasUrl ? (
                                <a
                                    className="title"
                                    href={item.url}
                                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                                >
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
                                <a
                                    className="title"
                                    href={item.url}
                                    target={settings.openLinkInNewTab ? '_blank' : undefined}
                                    rel={settings.openLinkInNewTab ? 'noopener' : undefined}
                                >
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
                                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }}></div>
                                    <div className="subtext">{pollResult.points} points</div>
                                    <div
                                        className="pollBar"
                                        style={{
                                            width: (pollResult.points / item.poll_votes_count) * 100 + '%',
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="subject" dangerouslySetInnerHTML={{ __html: item.content }}></p>
                    <ul className="comment-list">
                        {item.comments.map((comment) => (
                            <li key={comment.id}>
                                <Comment comment={comment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
