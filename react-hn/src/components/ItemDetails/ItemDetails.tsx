import { useParams, useNavigate } from 'react-router-dom';
import { useFetchItemContent } from '../../hooks/useHackerNewsAPI';
import { CommentComponent } from './Comment';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const itemId = id ? parseInt(id, 10) : 0;
  
  const { data: item, loading, error } = useFetchItemContent(itemId);

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading item...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!item) {
    return <div className="text-center py-10 text-red-600">Item not found</div>;
  }

  return (
    <div className="max-w-4xl">
      <button 
        onClick={() => navigate(-1)} 
        className="bg-transparent border-none text-gray-600 cursor-pointer text-sm mb-4 hover:underline"
      >
        ← Back
      </button>
      
      <div className="bg-white border border-gray-300 p-4 mb-4">
        <h1 className="text-lg font-normal mb-2">{item.title}</h1>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 text-xs no-underline hover:underline">
            {item.domain}
          </a>
        )}
        <div className="text-xs text-gray-600 my-2">
          {item.points} points by {item.user} {item.time_ago}
        </div>
        {item.content && (
          <div className="mt-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}
      </div>

      <div>
        <h2 className="text-base font-normal mb-4">Comments ({item.comments_count})</h2>
        {item.comments && item.comments.length > 0 ? (
          <div>
            {item.comments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
