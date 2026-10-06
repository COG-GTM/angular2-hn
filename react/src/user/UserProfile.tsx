import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/components/Loader/Loader';
import { SafeHtml } from '../shared/components/SafeHtml/SafeHtml';
import type { User } from '../shared/models';
import { fetchUser } from '../shared/services/hackernewsApi';
import { onActivateKey } from '../shared/utils/a11y';
import './UserProfile.scss';

interface UserState {
    id: string;
    user?: User;
    errorMessage?: string;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

export default function UserProfile() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState<UserState>({ id });

    useEffect(() => {
        const controller = new AbortController();
        fetchUser(id, controller.signal).then(
            (user) => setState({ id, user }),
            (error: unknown) => {
                if (!controller.signal.aborted && !isAbortError(error)) {
                    setState({ id, errorMessage: `Could not load user ${id}.` });
                }
            }
        );
        return () => controller.abort();
    }, [id]);

    // Ignore results belonging to a previous id while the new one loads.
    const { user, errorMessage } = state.id === id ? state : {};

    const goBack = () => navigate(-1);

    return (
        <div className="main-content" data-testid="user-profile" data-user-id={id}>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage && <ErrorMessage message={errorMessage} />}
            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                role="button"
                                tabIndex={0}
                                aria-label="Go back"
                                onClick={goBack}
                                onKeyDown={onActivateKey(goBack)}
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
                            <SafeHtml as="p" html={user.about} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
