import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hackerNewsAPI } from '../services/api';
import type { FeedType } from '../types';

interface FeedProps {
    feedType: FeedType;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
    const { page = '1' } = useParams<{ page: string }>();
    const pageNumber = parseInt(page, 10);

    const { data: stories, isLoading, error } = useQuery({
        queryKey: ['feed', feedType, pageNumber],
        queryFn: () => hackerNewsAPI.fetchFeed(feedType, pageNumber),
    });

    if (isLoading) return <div className="loader">Loading...</div>;
    if (error) return <div className="error-section">Error loading feed</div>;

    return (
        <div className="feed">
            <h2>{feedType.charAt(0).toUpperCase() + feedType.slice(1)}</h2>
            {stories?.map((story, index) => (
                <div key={story.id} className="story-item">
                    <span className="story-rank">{(pageNumber - 1) * 30 + index + 1}.</span>
                    <div className="story-content">
                        <h3>
                            <a href={story.url} target="_blank" rel="noopener noreferrer">
                                {story.title}
                            </a>
                            {story.domain && <span className="domain">({story.domain})</span>}
                        </h3>
                        <div className="subtext">
                            {story.points} points by {story.user} {story.time_ago} |{' '}
                            <a href={`/item/${story.id}`}>{story.comments_count} comments</a>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Feed;
