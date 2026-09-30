// Port of src/app/item-details (item header, poll results, subject and comment tree).
// Route module for React Router `lazy`: must export `Component`.
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { hackerNewsApi } from '../api/hackernews';
import { ItemDetails } from '../components/item/ItemDetails';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { Loader } from '../components/shared/Loader';
import { useAsync } from '../hooks/useAsync';
import { useSettings } from '../settings/SettingsContext';

export function Component() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { data: item, error } = useAsync((signal) => hackerNewsApi.fetchItemContent(Number(id), signal), [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app-item-details">
      <div className="main-content">
        {!item && !error && <Loader />}
        {!item && !!error && <ErrorMessage message="Could not load item comments." />}
        {item && <ItemDetails item={item} openLinkInNewTab={settings.openLinkInNewTab} goBack={() => navigate(-1)} />}
      </div>
    </div>
  );
}
