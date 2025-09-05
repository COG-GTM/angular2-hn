import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

export function Header() {
  const { toggleSettings } = useSettings();

  return (
    <header className="bg-orange-500 p-2 border-b border-gray-300">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/news/1" className="text-black font-bold text-sm no-underline">
          Hacker News
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/news/1" className="text-black text-sm no-underline hover:underline">news</Link>
          <Link to="/newest/1" className="text-black text-sm no-underline hover:underline">newest</Link>
          <Link to="/show/1" className="text-black text-sm no-underline hover:underline">show</Link>
          <Link to="/ask/1" className="text-black text-sm no-underline hover:underline">ask</Link>
          <Link to="/jobs/1" className="text-black text-sm no-underline hover:underline">jobs</Link>
          <button onClick={toggleSettings} className="text-black text-sm underline bg-transparent border-none cursor-pointer">
            settings
          </button>
        </div>
      </nav>
    </header>
  );
}
