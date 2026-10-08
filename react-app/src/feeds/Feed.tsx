import { useFeedType, usePageNumber } from '../router';

// Placeholder: ported by the feeds workstream (src/app/feeds/feed).
export function Feed() {
    const feedType = useFeedType();
    const page = usePageNumber();
    return (
        <div className="main-content" data-feed={feedType} data-page={page}>
            {feedType} page {page}
        </div>
    );
}
