import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './UserPage.scss';

// Port of src/app/user/user.component.{ts,html,scss}
export default function UserPage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, loading, error } = useUser(id);

    const goBack = () => navigate(-1);

    if (loading && !error) {
        return <Loader />;
    }

    if (!user && error) {
        return <ErrorMessage message={`Could not load user ${id}.`} />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={goBack}></span>
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
                    <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                </div>
            )}
        </div>
    );
}
