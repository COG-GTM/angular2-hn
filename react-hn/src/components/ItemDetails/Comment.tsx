import { Link } from 'react-router-dom';
import { Comment } from '../../types';

interface CommentProps {
  comment: Comment;
}

export function CommentComponent({ comment }: CommentProps) {
  if (comment.deleted) {
    return (
      <div className="bg-gray-100 border border-gray-300 p-3 mb-2 text-gray-600 italic" style={{ marginLeft: `${comment.level * 20}px` }}>
        <div className="text-xs text-gray-600">
          [deleted]
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 p-3 mb-2" style={{ marginLeft: `${comment.level * 20}px` }}>
      <div className="text-xs text-gray-600 mb-2">
        <Link to={`/user/${comment.user}`} className="text-gray-600 no-underline hover:underline">
          {comment.user}
        </Link>{' '}
        {comment.time_ago}
      </div>
      <div 
        className="leading-relaxed text-sm" 
        dangerouslySetInnerHTML={{ __html: comment.content }} 
      />
      {comment.comments && comment.comments.length > 0 && (
        <div className="mt-2">
          {comment.comments.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
