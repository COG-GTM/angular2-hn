import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { User } from '../api/types';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useUser } from '../hooks/useUser';
import './UserPage.css';

export const SUBMISSIONS_PAGE_SIZE = 30;

const BLOCKED_TAGS = 'script, style, iframe, object, embed, link, meta, base, form, input, button, textarea, select';
const SAFE_URL = /^(?:https?:|mailto:|\/|#|item\?|user\?)/i;

/**
 * Strips active content from the HN-supplied `about` HTML, standing in for
 * Angular's built-in `[innerHTML]` sanitization.
 */
// Inlined; deduplicate with the shared sanitizer once T4/T6 land.
export function sanitizeAbout(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.body.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const unsafeUrl = (name === 'href' || name === 'src') && !SAFE_URL.test(attr.value.trim());
      if (name.startsWith('on') || name === 'style' || unsafeUrl) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

/** `created_time` (unix seconds) → ISO date, e.g. `2006-10-09`. */
export function createdDate(createdTime: number): string {
  return new Date(createdTime * 1000).toISOString().slice(0, 10);
}

function Submissions({ ids }: { ids: number[] }) {
  const [visible, setVisible] = useState(SUBMISSIONS_PAGE_SIZE);
  return (
    <section className="submissions" aria-label="Submissions">
      <h2>Submissions ({ids.length})</h2>
      <ul>
        {ids.slice(0, visible).map((id) => (
          <li key={id}>
            <Link to={`/item/${id}`}>{id}</Link>
          </li>
        ))}
      </ul>
      {visible < ids.length && (
        <button type="button" onClick={() => setVisible((v) => v + SUBMISSIONS_PAGE_SIZE)}>
          More ›
        </button>
      )}
    </section>
  );
}

function Profile({ user }: { user: User }) {
  const navigate = useNavigate();
  const about = useMemo(() => (user.about ? sanitizeAbout(user.about) : ''), [user.about]);
  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <button type="button" className="back-button" aria-label="Back" onClick={() => navigate(-1)} />
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right" aria-label="Karma">
          {user.karma} ★
        </span>
        <p className="age">
          Created{' '}
          <time dateTime={createdDate(user.created_time)} title={createdDate(user.created_time)}>
            {user.created}
          </time>
        </p>
      </div>
      {about && <div className="other-details" data-testid="about" dangerouslySetInnerHTML={{ __html: about }} />}
      {user.submitted && user.submitted.length > 0 && <Submissions ids={user.submitted} />}
    </div>
  );
}

/** Port of user/user.component; lazy-loaded at `/user/:id`. */
export default function UserPage() {
  const id = useParams().id ?? '';
  const state = useUser(id);

  if (state.status === 'loading') {
    return <Loader />;
  }
  if (state.status === 'error') {
    return <ErrorMessage message={`Could not load user ${id}.`} />;
  }
  return <Profile key={id} user={state.user} />;
}
