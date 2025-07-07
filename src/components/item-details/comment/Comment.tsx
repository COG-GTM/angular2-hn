import React, { useState } from 'react';
import { Comment as CommentModel } from '../../shared/models/comment';

interface CommentProps {
  comment: CommentModel;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [collapse, setCollapse] = useState<boolean>(false);

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };

  if (comment.deleted) {
    return (
      <div className="text-gray-500 italic p-2">
        [deleted]
      </div>
    );
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4 py-2">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
        <button 
          onClick={toggleCollapse}
          className="text-orange-500 hover:text-orange-600 font-bold"
        >
          {collapse ? '[+]' : '[-]'}
        </button>
        <span className="font-medium">{comment.user}</span>
        <span>{comment.time_ago}</span>
      </div>
      
      {!collapse && (
        <>
          <div 
            className="prose prose-sm max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          
          {comment.comments && comment.comments.length > 0 && (
            <div className="ml-4 space-y-2">
              {comment.comments.map((childComment) => (
                <Comment key={childComment.id} comment={childComment} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Comment;
