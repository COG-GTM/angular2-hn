import { NavLink } from 'react-router-dom';

// Placeholder: the full header (logo, feed nav, settings popup) is ported in Phase 3 from src/app/core/header.
export function Header() {
  return (
    <header>
      <div id="header">
        <NavLink to="/news/1">news</NavLink> | <NavLink to="/newest/1">new</NavLink> |{' '}
        <NavLink to="/show/1">show</NavLink> | <NavLink to="/ask/1">ask</NavLink> | <NavLink to="/jobs/1">jobs</NavLink>
      </div>
    </header>
  );
}
