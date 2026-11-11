import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../api/hackerNewsApi';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import type { User } from '../models';
import { sanitizedHtml } from '../utils/sanitize';
import './UserPage.scss';

type UserState = { id: string; user?: User; error?: string };

export default function UserPage() {
    const id = useParams().id ?? '';
    const navigate = useNavigate();
    const [state, setState] = useState<UserState>({ id });

    useEffect(() => {
        const controller = new AbortController();
        fetchUser(id, controller.signal).then(
            (user) => setState({ id, user }),
            () => {
                if (!controller.signal.aborted) {
                    setState({ id, error: `Could not load user ${id}.` });
                }
            }
        );
        return () => controller.abort();
    }, [id]);

    const { user, error } = state.id === id ? state : { user: undefined, error: undefined };

    return (
        <div className="main-content user-page" data-testid="user-page">
            {!user && !error && <Loader />}
            {!user && error && <ErrorMessage message={error} />}
            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                role="button"
                                aria-label="Back"
                                onClick={() => navigate(-1)}
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
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={sanitizedHtml(user.about)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
