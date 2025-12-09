import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHackerNewsAPI } from '../../../hooks/useHackerNewsAPI';
import { useSettings } from '../../../hooks/useSettings';
import { Comment } from '../Comment/Comment';
import './ItemDetails.css';

export const ItemDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchItem } = useHackerNewsAPI();
    const { settings } = useSettings();

    const {
        data: item,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['item', id],
        queryFn: () => fetchItem(id!),
        enabled: !!id,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (isLoading) return <div className="loader">Loading...</div>;
    if (error) return <div className="error">Error loading item.</div>;
    if (!item) return <div className="error">Item not found</div>;

    const hasUrl = item.url?.startsWith('http');

    return (
        <div className="item-details">
            <button className="back-btn" onClick={() => navigate(-1)}>
                &larr; Back
            </button>
            <h1 className="item-details-title" style={{ fontSize: `${parseInt(settings.titleFontSize) + 4}px` }}>
                {hasUrl ? (
                    <a
                        href={item.url}
                        target={settings.openLinkInNewTab ? '_blank' : undefined}
                        rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
                    >
                        {item.title}
                    </a>
                ) : (
                    item.title
                )}
            </h1>
            {item.domain && <div className="item-domain">{item.domain}</div>}
            <div className="item-details-meta">
                <span>{item.points} points</span>
                <span>
                    {' '}
                    by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
                <span> {item.time_ago}</span>
                <span> | {item.comments_count || 0} comments</span>
            </div>
            {item.content && <div className="item-content" dangerouslySetInnerHTML={{ __html: item.content }} />}
            <div className="comments-section">
                <h2>Comments</h2>
                {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment) => <Comment key={comment.id} comment={comment} />)
                ) : (
                    <p className="no-comments">No comments yet.</p>
                )}
            </div>
        </div>
    );
};
