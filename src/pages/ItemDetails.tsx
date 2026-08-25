import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchItemContent } from '../api/hackerNews';
import Comment from '../components/Comment';
import ErrorMessage from '../components/ErrorMessage';
import { hasUrl } from '../components/Item';
import Loader from '../components/Loader';
import { useSettings } from '../context/SettingsContext';
import type { Story } from '../models/story';
import { formatCommentCount } from '../utils/formatCommentCount';

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
            .catch((error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }
                console.error(error);
                setErrorMessage('Could not load item comments.');
            });

        return () => controller.abort();
    }, [id]);

    if (!item) {
        return <div className="main-content">{errorMessage ? <ErrorMessage message={errorMessage} /> : <Loader />}</div>;
    }

    const isJob = item.type === 'job';
    const external = hasUrl(item);
    const linkAttributes = {
        target: settings.openLinkInNewTab ? '_blank' : undefined,
        rel: settings.openLinkInNewTab ? 'noopener' : undefined,
    };
    const laptopClasses = ['laptop'];

    if (item.comments_count > 0 || isJob) {
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
                        <span className="back-button" onClick={() => navigate(-1)}></span>
                        {external ? (
                            <a className="title" href={item.url} {...linkAttributes}>
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
                    {external ? (
                        <p>
                            <a className="title" href={item.url} {...linkAttributes}>
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
                        {!isJob && (
                            <span>
                                {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                            </span>
                        )}
                        <span className={isJob ? undefined : 'item-details'}>
                            {item.time_ago}
                            {!isJob && (
                                <span>
                                    {' '}
                                    | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
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
