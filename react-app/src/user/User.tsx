import { useParams } from 'react-router-dom';

import { useUser } from '../api/queries';
import { BackButton } from '../components/BackButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { sanitizeHtml } from '../utils/format';
import './User.scss';

export default function User() {
    const { id = '' } = useParams<{ id: string }>();
    const { data: user, isError } = useUser(id);

    return (
        <div className="app-user">
            {!user && !isError && <Loader />}
            {!user && isError && <ErrorMessage message={`Could not load user ${id}.`} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <BackButton />
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
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
