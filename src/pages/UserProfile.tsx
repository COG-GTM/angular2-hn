import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/UserProfile.scss';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, error } = useUser(id || '');

    const goBack = () => navigate(-1);

    return (
        <div className="user-profile-component">
            {!user && !error && <Loader />}
            {!user && error && <ErrorMessage message={error} />}

            {user && (
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
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
