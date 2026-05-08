import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Story } from '../../models/story';
import { fetchFeed } from '../../services/hackernews-api';
import { useSettings } from '../../hooks/useSettings';
import FeedItem from '../FeedItem/FeedItem';
import Loader from '../Loader/Loader';
import './Feed.scss';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const currentPage = Number(page) || 1;
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset loading on nav
    setLoading(true);

    (async () => {
      try {
        const data = await fetchFeed(feedType, currentPage);
        if (active) {
          setStories(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setStories([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [feedType, currentPage]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      window.scrollTo(0, 0);
      navigate(`/${feedType}/${currentPage - 1}`);
    }
  };

  const goToNextPage = () => {
    window.scrollTo(0, 0);
    navigate(`/${feedType}/${currentPage + 1}`);
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  if (loading) return <Loader />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="feed-container">
      <div className="nav">
        <NavItem label="top" path="/news/1" isActive={isActive('/news')} navigate={navigate} />
        <NavItem label="new" path="/newest/1" isActive={isActive('/newest')} navigate={navigate} />
        <NavItem label="show" path="/show/1" isActive={isActive('/show')} navigate={navigate} />
        <NavItem label="ask" path="/ask/1" isActive={isActive('/ask')} navigate={navigate} />
        <NavItem label="jobs" path="/jobs/1" isActive={isActive('/jobs')} navigate={navigate} />
      </div>
      <ul className="item-list">
        {stories.map((story, index) => (
          <FeedItem
            key={story.id}
            story={story}
            index={(currentPage - 1) * 30 + index + 1}
            openInNewTab={settings.openLinkInNewTab}
            titleFontSize={settings.titleFontSize}
            listSpacing={settings.listSpacing}
          />
        ))}
      </ul>
      <div className="pagination">
        {currentPage > 1 && (
          <button className="prev" onClick={goToPrevPage}>
            ‹ Prev
          </button>
        )}
        <span className="page-number">{currentPage}</span>
        {stories.length >= 30 && (
          <button className="next" onClick={goToNextPage}>
            Next ›
          </button>
        )}
      </div>
    </div>
  );
}

function NavItem({
  label,
  path,
  isActive,
  navigate,
}: {
  label: string;
  path: string;
  isActive: boolean;
  navigate: (path: string) => void;
}) {
  return (
    <a
      className={isActive ? 'nav-item active' : 'nav-item'}
      href={path}
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        navigate(path);
      }}
    >
      {label}
    </a>
  );
}
