import { Loader } from '../../shared/components';

export interface FeedPageProps {
    feedType: 'news' | 'newest' | 'show' | 'ask' | 'jobs';
}

export default function FeedPage({ feedType }: FeedPageProps) {
    return (
        <div className="main-content" data-feed-type={feedType}>
            <Loader />
        </div>
    );
}
