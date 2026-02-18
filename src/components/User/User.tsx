import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserType } from './User.types';
import './User.css';

const API_BASE_URL = 'https://node-hnapi.herokuapp.com';

const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setErrorMessage('');
        setUser(null);

        fetch(`${API_BASE_URL}/user/${id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then((data: UserType) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => {
                setErrorMessage(`Could not load user ${id}.`);
                setLoading(false);
            });
    }, [id]);

    if (loading && !errorMessage) {
        return <div className="user-loading">Loading...</div>;
    }

    if (errorMessage) {
        return <div className="user-error">{errorMessage}</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="user-profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span
                        className="back-button"
                        onClick={() => navigate(-1)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') navigate(-1);
                        }}
                    />
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
    );
};

export default UserProfile;
