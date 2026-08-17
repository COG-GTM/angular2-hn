import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Comment } from '../components/Comment';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useSettings } from '../context/settingsContext';
import type { Story } from '../models';
import { fetchItemContent } from '../services/hackernewsApi';
import { commentCount } from '../utils/comment';
import { hasUrl } from '../utils/hasUrl';

export function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setItem(null);
        setErrorMessage('');
        fetchItemContent(Number(id), controller.signal)
            .then((story) => setItem(story))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load item comments.');
            });
        return () => controller.abort();
    }, [id]);

    const external = item ? hasUrl(item.url) : false;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    const rel = settings.openLinkInNewTab ? 'noopener' : undefined;

    const laptopClasses = ['laptop'];
    if (item && (item.comments_count > 0 || item.type === 'job')) {
        laptopClasses.push('item-header');
    }
    if (item?.content) {
        laptopClasses.push('head-margin');
    }

    return (
        <div className="main-content">
            {!item && errorMessage === '' && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {external ? (
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
                        {external ? (
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
                                            width: `${(pollResult.points / (item.poll_votes_count ?? 0)) * 100}%`,
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
            )}
        </div>
    );
}
