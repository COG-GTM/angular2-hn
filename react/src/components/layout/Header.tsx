import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="header">
      <Link className="logo" to="/news/1">
        Angular 2 HN
      </Link>
      <nav>
        <Link to="/newest/1">new</Link>
        <Link to="/show/1">show</Link>
        <Link to="/ask/1">ask</Link>
        <Link to="/jobs/1">jobs</Link>
      </nav>
    </header>
  );
}

export default Header;
