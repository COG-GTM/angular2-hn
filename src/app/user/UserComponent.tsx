import React, { useState, useEffect } from 'react';

/**
 * React port of Angular UserComponent
 *
 * Original Angular component: user.component.ts
 * - @Input: none (route param `id` used)
 * - @Output: none
 * - Services: HackerNewsAPIService, ActivatedRoute, Location
 * - Lifecycle: ngOnInit → useEffect
 */

interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}

interface UserComponentProps {
  /** The user ID to fetch, typically from route params */
  userId: string;
  /** Function to fetch user data from the Hacker News API */
  fetchUser: (userId: string) => Promise<User>;
  /** Callback for navigating back */
  onGoBack: () => void;
}

export const UserComponent: React.FC<UserComponentProps> = ({
  userId,
  fetchUser,
  onGoBack,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Replaces ngOnInit + route.params subscription
  useEffect(() => {
    if (!userId) return;
    setUser(null);
    setErrorMessage('');

    fetchUser(userId)
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        setErrorMessage(`Could not load user ${userId}.`);
      });
  }, [userId, fetchUser]);

  // Loading state
  if (!user && !errorMessage) {
    // TODO: Replace with actual Loader component
    return <div className="app-loader">Loading...</div>;
  }

  // Error state
  if (!user && errorMessage !== '') {
    // TODO: Replace with actual ErrorMessage component
    return <div className="app-error-message">{errorMessage}</div>;
  }

  // User loaded state
  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={onGoBack}></span>
          Profile: {user!.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user!.id}</span>
        <span className="right">{user!.karma} ★</span>
        <p className="age">Created {user!.created}</p>
      </div>
      {user!.about && (
        <div className="other-details">
          <p dangerouslySetInnerHTML={{ __html: user!.about }} />
        </div>
      )}
    </div>
  );
};
