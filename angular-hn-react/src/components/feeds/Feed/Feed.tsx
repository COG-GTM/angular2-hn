import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHackerNewsAPI } from '../../../hooks/useHackerNewsAPI';
import { Item } from '../Item/Item';
import './Feed.css';

export const Feed: React.FC = () => {
    const { page = '1' } = useParams();
    const location = useLocation();
    const { fetchFeed } = useHackerNewsAPI();

    const feedType = location.pathname.split('/')[1] || 'news';

    const {
        data: items,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: () => fetchFeed(feedType, parseInt(page)),
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [feedType, page]);

    if (isLoading) return <div className="loader">Loading...</div>;
    if (error) return <div className="error">Error loading {feedType} stories.</div>;

    const startNumber = (parseInt(page) - 1) * 30 + 1;
    const pageNum = parseInt(page);

    return (
        <div className="main-content">
            <ol start={startNumber} className="feed-list">
                {items?.map((item) => (
                    <Item key={item.id} item={item} />
                ))}
            </ol>
            <div className="pagination">
                {pageNum > 1 && <Link to={`/${feedType}/${pageNum - 1}`}>Previous</Link>}
                {pageNum > 1 && items && items.length > 0 && <span> | </span>}
                {items && items.length > 0 && <Link to={`/${feedType}/${pageNum + 1}`}>More</Link>}
            </div>
        </div>
    );
};
