import Placeholder from './Placeholder';

interface FeedProps {
    feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
    return <Placeholder name="Feed" feedType={feedType} />;
}
