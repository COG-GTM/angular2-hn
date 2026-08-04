import { useCallback, useEffect, useState } from 'react';

import { Story, User } from './shared/models';
import { fetchFeed, fetchItemContent, fetchUser } from './shared/services/hackernewsApi';
import { useSettings } from './shared/settings/useSettings';
import { formatCommentCount } from './shared/utils/comment';

const DEFAULT_POLL_ID = '126809';
const THEMES = ['default', 'night', 'amoledblack'];

/**
 * Throwaway Phase 1a scaffolding that exercises the ported API client and settings
 * context so they can be verified in a browser. Phase 3 removes it.
 */
export function ServicesPreview() {
    const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

    const [stories, setStories] = useState<Story[]>([]);
    const [feedError, setFeedError] = useState<string | null>(null);

    const [pollId, setPollId] = useState(DEFAULT_POLL_ID);
    const [poll, setPoll] = useState<Story | null>(null);
    const [pollError, setPollError] = useState<string | null>(null);

    const [user, setUser] = useState<User | null>(null);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        fetchFeed('news', 1)
            .then(setStories)
            .catch((error: Error) => setFeedError(error.message));
    }, []);

    const loadPoll = useCallback(() => {
        setPoll(null);
        setPollError(null);
        fetchItemContent(Number(pollId))
            .then(setPoll)
            .catch((error: Error) => setPollError(error.message));
    }, [pollId]);

    const loadUser = useCallback(() => {
        setUser(null);
        setUserError(null);
        fetchUser('pg')
            .then(setUser)
            .catch((error: Error) => setUserError(error.message));
    }, []);

    return (
        <section className={settings.theme}>
            <h1>Services preview</h1>

            <h2>fetchFeed(&apos;news&apos;, 1)</h2>
            {feedError && <p id="feed-error">Error: {feedError}</p>}
            <ol id="feed">
                {stories.map((story) => (
                    <li key={story.id}>
                        {story.title} <span className="subtext">({formatCommentCount(story.comments_count)})</span>
                    </li>
                ))}
            </ol>

            <h2>fetchItemContent(pollId)</h2>
            <input aria-label="Poll id" value={pollId} onChange={(event) => setPollId(event.target.value)} />
            <button id="load-poll" onClick={loadPoll}>
                Load poll
            </button>
            {pollError && <p id="poll-error">Error: {pollError}</p>}
            {poll && (
                <div id="poll">
                    <p>
                        {poll.title} — type: {poll.type}, poll_votes_count: <b>{poll.poll_votes_count}</b>
                    </p>
                    <ul>
                        {(poll.poll ?? []).map((option, index) => (
                            <li key={index}>
                                <b>{option.points} points</b> —{' '}
                                <span dangerouslySetInnerHTML={{ __html: option.content }} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <h2>fetchUser(&apos;pg&apos;)</h2>
            <button id="load-user" onClick={loadUser}>
                Load user
            </button>
            {userError && <p id="user-error">Error: {userError}</p>}
            {user && <pre id="user">{JSON.stringify(user, null, 2)}</pre>}

            <h2>useSettings()</h2>
            <pre id="settings">{JSON.stringify(settings, null, 2)}</pre>
            <button id="toggle-settings" onClick={toggleSettings}>
                toggleSettings
            </button>
            <button id="toggle-new-tab" onClick={toggleOpenLinksInNewTab}>
                toggleOpenLinksInNewTab
            </button>
            <div>
                {THEMES.map((theme) => (
                    <button key={theme} onClick={() => setTheme(theme)}>
                        setTheme({theme})
                    </button>
                ))}
            </div>
            <div>
                {['12', '16', '20'].map((fontSize) => (
                    <button key={fontSize} onClick={() => setFont(fontSize)}>
                        setFont({fontSize})
                    </button>
                ))}
            </div>
            <div>
                {['0', '5', '10'].map((spacing) => (
                    <button key={spacing} onClick={() => setSpacing(spacing)}>
                        setSpacing({spacing})
                    </button>
                ))}
            </div>
        </section>
    );
}
