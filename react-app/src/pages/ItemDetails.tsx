import { useParams, useNavigate } from 'react-router-dom';
import { useItem } from '../services/hackerNewsApi';
import { useSettings } from '../contexts/SettingsContext';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const itemId = parseInt(id!, 10);
  
  const { data: item, isLoading, error } = useItem(itemId);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Could not load item comments." />;
  if (!item) return <ErrorMessage message="Item not found." />;

  const hasUrl = item.url && item.url.indexOf('http') === 0;

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="item-details">
      <button onClick={goBack} className="back-btn">
        ← Back
      </button>
      
      <div className="item-header">
        <h1 className="item-title">
          {hasUrl ? (
            <a 
              href={item.url} 
              target={settings.openLinkInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
            >
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h1>
        
        <div className="item-meta">
          <span>{item.points} points</span>
          <span>by {item.user}</span>
          <span>{item.time_ago}</span>
          <span>{item.comments_count} comments</span>
        </div>
      </div>

      <div className="comments">
        {item.comments?.map((comment) => (
          <div key={comment.id} className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
            <div className="comment-meta">
              <span>{comment.user}</span>
              <span>{comment.time_ago}</span>
            </div>
            <div 
              className="comment-content" 
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemDetails;
