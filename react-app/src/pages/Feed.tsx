import { useParams } from 'react-router-dom';

export function Feed({ feedType }: { feedType: string }) {
    const { page } = useParams();
    return (
        <div className="main-content">
            <p>
                {feedType} feed, page {page ?? '1'}
            </p>
        </div>
    );
}
