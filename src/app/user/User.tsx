import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../shared/hooks/useHackerNews';
import { Loader } from '../shared/components/loader/Loader';
import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import './user.component.scss';

export function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, error, isLoading } = useUser(id!);

    const goBack = () => navigate(-1);

    return (
        <>
            {isLoading && !error && <Loader />}
            {!isLoading && error && <ErrorMessage message={`Could not load user ${id}.`} />}

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
                        <span className="right">{user.karma} &#9733;</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
