import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useRequest } from '../../hooks/useRequest';
import type { User as UserModel } from '../../models';
import { fetchUser } from '../../services/hackernewsApi';
import './User.scss';

export function User() {
    const { id = '' } = useParams();
    const navigate = useNavigate();

    const { data: user, error } = useRequest<UserModel>(
        (signal) => fetchUser(id, signal),
        `Could not load user ${id}.`,
        [id]
    );

    return (
        <>
            {!user && !error && <Loader />}
            {!user && error !== '' && <ErrorMessage message={error} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                onClick={() => navigate(-1)}
                                role="button"
                                aria-label="Go back"
                            ></span>
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
            )}
        </>
    );
}

export default User;
