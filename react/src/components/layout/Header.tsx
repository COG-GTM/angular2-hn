// OWNER: Session 4 (app shell). Stub — port src/app/core/header (markup, SCSS, settings toggle).
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <div className="app-header">
      <header>
        <div id="header">
          <Link to="/news/1">HN</Link> | <Link to="/newest/1">new</Link> | <Link to="/show/1">show</Link> |{' '}
          <Link to="/ask/1">ask</Link> | <Link to="/jobs/1">jobs</Link>
        </div>
      </header>
    </div>
  );
}
