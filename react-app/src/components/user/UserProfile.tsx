import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackernews';
import { useFetch } from '../../api/useFetch';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import './UserProfile.scss';

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: user, error } = useFetch((signal) => fetchUser(String(id), signal), [id]);

    const goBack = () => navigate(-1);

    if (!user) {
        return error ? <ErrorMessage message={`Could not load user ${id}.`} /> : <Loader />;
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

export default UserProfile;
