import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage, Loader } from '../shared/components';
import { useUser } from '../shared/hooks';
import './UserPage.scss';

export default function UserPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { data: user, loading, error } = useUser(id);

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <Loader />;
    }

    if (error || !user) {
        return <ErrorMessage message={'Could not load user ' + id + '.'} />;
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
