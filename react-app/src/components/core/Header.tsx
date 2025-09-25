import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

const Header = () => {
  const { toggleSettings } = useSettings();

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/news/1" className="nav-link">News</Link>
        <Link to="/newest/1" className="nav-link">Newest</Link>
        <Link to="/show/1" className="nav-link">Show</Link>
        <Link to="/ask/1" className="nav-link">Ask</Link>
        <Link to="/jobs/1" className="nav-link">Jobs</Link>
        <button onClick={toggleSettings} className="settings-btn">
          Settings
        </button>
      </nav>
    </header>
  );
};

export default Header;
