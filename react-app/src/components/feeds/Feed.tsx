// PLACEHOLDER (Phase 1 scaffold) - replaced by the Phase 2A port.
import type { FeedType } from '../../models/feed-type.type';

export interface FeedProps {
    feedType: FeedType;
}

export default function Feed({ feedType }: FeedProps) {
    return <div className="main-content">{feedType}</div>;
}
