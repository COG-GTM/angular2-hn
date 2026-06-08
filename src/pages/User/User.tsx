import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { fetchUser } from '../../services/hackernews-api';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './User.scss';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: user, error } = useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id!),
        enabled: !!id,
    });

    const goBack = () => navigate(-1);

    if (!user && !error) return <Loader />;
    if (!user && error) return <ErrorMessage message={`Could not load user ${id}.`} />;
    if (!user) return null;

    return (
        <div>
            <div className="profile">
                <div className="mobile item-header">
                    <p className="title-block">
                        <span className="back-button" onClick={goBack} />
                        Profile: {user.id}
                    </p>
                </div>
                <div className="main-details">
                    <span className="name">{user.id}</span>
                    <span className="right">{user.karma} ★</span>
                    <p className="age">Created {user.created}</p>
                </div>
                {user.about && (
                    <div className="other-details">
                        <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.about) }} />
                    </div>
                )}
            </div>
        </div>
    );
}
