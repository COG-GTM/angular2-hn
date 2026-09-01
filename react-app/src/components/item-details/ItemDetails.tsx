import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useSettings } from '../../context/SettingsContext';
import { useItem } from '../../hooks/useHackerNews';
import { commentLabel } from '../../utils/comment';
import { hasExternalUrl } from '../../utils/url';
import Comment from './Comment';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';

import styles from './ItemDetails.module.scss';

export default function ItemDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { data: item, isPending, isError } = useItem(Number(id));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isPending) {
        return (
            <div className={styles.mainContent}>
                <Loader />
            </div>
        );
    }

    if (isError || !item) {
        return (
            <div className={styles.mainContent}>
                <ErrorMessage message="Could not load item comments." />
            </div>
        );
    }

    const external = hasExternalUrl(item.url);
    const linkTarget = settings.openLinkInNewTab ? '_blank' : undefined;
    const linkRel = settings.openLinkInNewTab ? 'noopener' : undefined;
    const laptopClasses = [styles.laptop];
    if (item.comments_count > 0 || item.type === 'job') {
        laptopClasses.push('item-header');
    }
    if (item.content) {
        laptopClasses.push(styles.headMargin);
    }

    return (
        <div className={styles.mainContent}>
            <div className={styles.item}>
                <div className={`${styles.mobile} item-header`}>
                    <p className={styles.titleBlock}>
                        <span className="back-button" onClick={() => navigate(-1)} />
                        {external ? (
                            <a className={styles.title} href={item.url} target={linkTarget} rel={linkRel}>
                                {item.title}
                            </a>
                        ) : (
                            <Link className={styles.title} to={`/item/${item.id}`}>
                                {item.title}
                            </Link>
                        )}
                    </p>
                </div>
                <div className={laptopClasses.join(' ')}>
                    {external ? (
                        <p>
                            <a className={styles.title} href={item.url} target={linkTarget} rel={linkRel}>
                                {item.title}
                            </a>
                            {item.domain && <span className="domain">({item.domain})</span>}
                        </p>
                    ) : (
                        <p>
                            <Link className={styles.title} to={`/item/${item.id}`}>
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
                        <span className={item.type !== 'job' ? styles.itemDetails : undefined}>
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
                    <div className={styles.pollResults}>
                        {item.poll?.map((pollResult, index) => (
                            <div key={index} className="pollContent">
                                <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                                <div className="subtext">{pollResult.points} points</div>
                                <div
                                    className="pollBar"
                                    style={{
                                        width: `${(pollResult.points / (item.poll_votes_count ?? 0)) * 100}%`,
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                )}
                <p className={styles.subject} dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
                <ul className={styles.commentList}>
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
