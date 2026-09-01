import { useParams } from 'react-router-dom';

export function useFeedPage(): number {
    const { page } = useParams();

    return page ? +page : 1;
}
