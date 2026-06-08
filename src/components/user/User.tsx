import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import './User.scss';

export function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, error, loading } = useUser(id!);

    const goBack = () => navigate(-1);

    return (
        <>
            {loading && !error && <Loader />}
            {!loading && error && <ErrorMessage message={error} />}

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
                        <div
                            className="other-details"
                            dangerouslySetInnerHTML={{ __html: user.about }}
                        />
                    )}
                </div>
            )}
        </>
    );
}
