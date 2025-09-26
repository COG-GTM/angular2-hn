import React from 'react';
import { useParams } from 'react-router-dom';
import { useFeed } from '../services/api';
import { FeedType } from '../types';

interface FeedProps {
    feedType: FeedType;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
    const { page } = useParams<{ page: string }>();
    const pageNum = parseInt(page || '1', 10);
    
    const { data: items, isLoading, error } = useFeed(feedType, pageNum);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading {feedType} stories.</div>;

    return (
        <div>
            <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Stories</h1>
            <div>
                {items?.map((item) => (
                    <div key={item.id}>
                        <h3>{item.title}</h3>
                        <p>Points: {item.points} | User: {item.user} | Comments: {item.comments_count}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;
