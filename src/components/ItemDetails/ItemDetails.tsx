import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../models';
import { fetchItemContent } from '../../services/hackerNewsApi';
import { classNames } from '../../utils/classNames';
import { formatCommentCount } from '../../utils/formatCommentCount';
import { hasExternalUrl } from '../../utils/hasExternalUrl';
import { sanitizeHtml } from '../../utils/sanitize';
import { Comment } from '../Comment/Comment';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Loader } from '../Loader/Loader';
import { RouterLink } from '../RouterLink';
import './ItemDetails.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const itemId = Number(id);
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [item, setItem] = useState<Story>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchItemContent(itemId).then(
            (story) => {
                if (!cancelled) setItem(story);
            },
            () => {
                if (!cancelled) setErrorMessage('Could not load item comments.');
            }
        );
        window.scrollTo(0, 0);
        return () => {
            cancelled = true;
        };
    }, [itemId]);

    const goBack = () => navigate(-1);

    const renderTitle = (story: Story) =>
        hasExternalUrl(story) ? (
            <a
                className="title"
                href={story.url}
                target={settings.openLinkInNewTab ? '_blank' : undefined}
                rel={settings.openLinkInNewTab ? 'noopener' : undefined}
            >
                {` ${story.title} `}
            </a>
        ) : (
            <RouterLink className="title" to={`/item/${story.id}`}>
                {` ${story.title} `}
            </RouterLink>
        );

    return (
        <app-item-details>
            <div className="main-content">
                {!item && !errorMessage && <Loader />}
                {!item && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

                {item && (
                    <div className="item">
                        <div className="mobile item-header">
                            <p className="title-block">
                                <span className="back-button" onClick={goBack}></span>
                                {renderTitle(item)}
                            </p>
                        </div>
                        <div
                            className={classNames(
                                'laptop',
                                (item.comments_count > 0 || item.type === 'job') && 'item-header'
                            )}
                        >
                            <p>
                                {renderTitle(item)}
                                {hasExternalUrl(item) && item.domain && <span className="domain">{`(${item.domain})`}</span>}
                            </p>
                            <div className="subtext">
                                {item.type !== 'job' && (
                                    <span>
                                        {` ${item.points} points by `}
                                        <RouterLink to={`/user/${item.user}`}>{item.user}</RouterLink>
                                    </span>
                                )}
                                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                                    {` ${item.time_ago} `}
                                    {item.type !== 'job' && (
                                        <span>
                                            {' | '}
                                            <RouterLink to={`/item/${item.id}`}>
                                                {` ${formatCommentCount(item.comments_count)} `}
                                            </RouterLink>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        {item.type === 'poll' && (
                            <div className="pollResults">
                                {item.poll.map((pollResult, index) => (
                                    <div key={index} className="pollContent">
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(pollResult.content) }} />
                                        <div className="subtext">{`${pollResult.points} points`}</div>
                                        <div
                                            className="pollBar"
                                            style={{ width: (pollResult.points / item.poll_votes_count) * 100 + '%' }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="subject" dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }} />
                        <ul className="comment-list">
                            {item.comments.map((comment) => (
                                <li key={comment.id}>
                                    <Comment comment={comment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </app-item-details>
    );
}
