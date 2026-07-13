import { useParams } from 'react-router-dom';

import { Loader } from '../components/loader/Loader';

interface FeedProps {
    feedType: string;
}

/**
 * Placeholder implemented in Phase 4a (FeedComponent + ItemComponent).
 * Route wiring and feed-type data live here so routing can be reviewed in Phase 3.
 */
export const Feed = ({ feedType }: FeedProps) => {
    const { page } = useParams<{ page: string }>();

    return (
        <div className="main-content" data-feed-type={feedType} data-page={page}>
            <Loader />
        </div>
    );
};
