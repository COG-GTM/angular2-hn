import { useParams } from 'react-router-dom';

function Feed() {
    const { feedType, page } = useParams();
    return <div className="main-content">{feedType} {page}</div>;
}

export default Feed;
