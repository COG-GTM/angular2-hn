import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHackerNewsAPI } from '../../../hooks/useHackerNewsAPI';
import './User.css';

export const User: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchUser } = useHackerNewsAPI();

    const {
        data: user,
        error,
        isLoading,
    } = useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id!),
        enabled: !!id,
    });

    if (isLoading) return <div className="loader">Loading...</div>;
    if (error) return <div className="error">Error loading user {id}.</div>;
    if (!user) return <div className="error">User not found</div>;

    return (
        <div className="user-profile">
            <button className="back-btn" onClick={() => navigate(-1)}>
                &larr; Back
            </button>
            <h1 className="user-name">{user.id}</h1>
            <div className="user-info">
                <p>
                    <strong>Karma:</strong> {user.karma}
                </p>
                <p>
                    <strong>Created:</strong> {user.created}
                </p>
            </div>
            {user.about && (
                <div className="user-about">
                    <h2>About</h2>
                    <div dangerouslySetInnerHTML={{ __html: user.about }} />
                </div>
            )}
        </div>
    );
};
