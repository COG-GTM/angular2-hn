import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Comment } from './Comment/Comment';
import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/components/Loader/Loader';
import { Story } from '../shared/models';
import { fetchItemContent } from '../shared/services/hackernewsApi';
import { formatCommentCount } from '../shared/utils/comment';
import { useSettings } from '../shared/settings/useSettings';
import './ItemDetails.scss';

/** node-hnapi returns the item body as `content`, a field the shared `Story` model does not declare. */
type StoryWithContent = Story & { content?: string };

export function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<StoryWithContent | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let ignore = false;

        setItem(null);
        setErrorMessage('');

        fetchItemContent(Number(id)).then(
            (fetchedItem) => {
                if (!ignore) {
                    setItem(fetchedItem);
                }
            },
            () => {
                if (!ignore) {
                    setErrorMessage('Could not load item comments.');
                }
            }
        );

        return () => {
            ignore = true;
        };
    }, [id]);

    const hasUrl = item ? item.url?.indexOf('http') === 0 : false;
    const externalTarget = settings.openLinkInNewTab ? '_blank' : undefined;
    const externalRel = settings.openLinkInNewTab ? 'noopener' : undefined;

    return (
        <div className="main-content">
            {!item && !errorMessage && <Loader />}
            {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {item && (
                <div className="item">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {hasUrl ? (
                                <a className="title" href={item.url} target={externalTarget} rel={externalRel}>
                                    {item.title}
                                </a>
                            ) : (
                                <Link className="title" to={'/item/' + item.id}>
                                    {item.title}
                                </Link>
                            )}
                        </p>
                    </div>
                    {/* `head-margin` hangs off `item.text`, a field node-hnapi never returns, so it is never applied. */}
                    <div className={'laptop' + (item.comments_count > 0 || item.type === 'job' ? ' item-header' : '')}>
                        {hasUrl ? (
                            <p>
                                <a className="title" href={item.url} target={externalTarget} rel={externalRel}>
                                    {item.title}
                                </a>{' '}
                                {item.domain && <span className="domain">({item.domain})</span>}
                            </p>
                        ) : (
                            <p>
                                <Link className="title" to={'/item/' + item.id}>
                                    {item.title}
                                </Link>
                            </p>
                        )}
                        <div className="subtext">
                            {item.type !== 'job' && (
                                <span>
                                    {item.points} points by <Link to={'/user/' + item.user}>{item.user}</Link>
                                </span>
                            )}{' '}
                            <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                {item.time_ago}
                                {item.type !== 'job' && (
                                    <span>
                                        {' '}
                                        | <Link to={'/item/' + item.id}>{formatCommentCount(item.comments_count)}</Link>
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
                                        style={{ width: (pollResult.points / item.poll_votes_count) * 100 + '%' }}
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
