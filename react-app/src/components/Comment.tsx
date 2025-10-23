import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../types/comment';

interface CommentProps {
  comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div className="deleted-meta text-gray-500 text-sm py-2">
        <span className="collapse">[deleted]</span> | Comment Deleted
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className={`meta text-sm ${collapse ? 'meta-collapse' : ''}`}>
        <span
          className="collapse cursor-pointer font-mono mr-2"
          onClick={() => setCollapse(!collapse)}
        >
          [{collapse ? '+' : '-'}]
        </span>
        <Link
          to={`/user/${comment.user}`}
          className="hover:underline font-medium"
        >
          {comment.user}
        </Link>
        <span className="time text-gray-500 ml-2">{comment.time_ago}</span>
      </div>
      
      <div className="comment-tree">
        {!collapse && (
          <div>
            <p
              className="comment-text my-2 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {comment.comments && comment.comments.length > 0 && (
              <ul className="subtree ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {comment.comments.map((subComment) => (
                  <li key={subComment.id}>
                    <Comment comment={subComment} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
