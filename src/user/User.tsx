import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/components/Loader/Loader';
import { useUser } from '../shared/hooks/use-hackernews';
import './User.scss';

export default function User() {
    const { id: userID = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isError } = useUser(userID);

    return (
        <div className="user-page">
            {!user && !isError && <Loader />}
            {!user && isError && <ErrorMessage message={`Could not load user ${userID}.`} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
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
        </div>
    );
}
