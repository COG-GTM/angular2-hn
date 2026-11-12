import { useNavigate } from 'react-router-dom';

/** Mobile back chevron; equivalent of Angular's `Location.back()`. */
export function BackButton() {
    const navigate = useNavigate();
    return <span className="back-button" role="button" aria-label="Back" onClick={() => navigate(-1)}></span>;
}
