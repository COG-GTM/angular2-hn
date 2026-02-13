import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <nav className="header-nav">
        <span className="header-logo" onClick={() => window.scrollTo(0, 0)}>
          <NavLink to="/news/1">HN</NavLink>
        </span>
        <NavLink to="/news/1" className={({ isActive }) => isActive ? 'active' : ''}>
          news
        </NavLink>
        <NavLink to="/newest/1" className={({ isActive }) => isActive ? 'active' : ''}>
          newest
        </NavLink>
        <NavLink to="/show/1" className={({ isActive }) => isActive ? 'active' : ''}>
          show
        </NavLink>
        <NavLink to="/ask/1" className={({ isActive }) => isActive ? 'active' : ''}>
          ask
        </NavLink>
        <NavLink to="/jobs/1" className={({ isActive }) => isActive ? 'active' : ''}>
          jobs
        </NavLink>
      </nav>
    </header>
  );
}
