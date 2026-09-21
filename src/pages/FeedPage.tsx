export function FeedPage({ feedType }: { feedType: string }) {
    return <div className="news-list" data-feed-type={feedType}></div>;
}
