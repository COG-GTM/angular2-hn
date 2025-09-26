import React from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../services/api';

const User: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    
    const { data: user, isLoading, error } = useUser(id || '');

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading user {id}.</div>;

    return (
        <div>
            <h1>User: {user?.id}</h1>
            <p>Karma: {user?.karma}</p>
            <p>Created: {user?.created}</p>
            {user?.about && <div dangerouslySetInnerHTML={{ __html: user.about }} />}
        </div>
    );
};

export default User;
