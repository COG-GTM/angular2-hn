import { useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Comment as CommentModel } from '../../models/comment';
import './Comment.scss';

interface Props {
    comment: CommentModel;
}

export default function Comment({ comment }: Props) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div>
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                {!collapse && (
                    <div>
                        <p
                            className="comment-text"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }}
                        />
                        <ul className="subtree">
                            {comment.comments?.map((sub) => (
                                <li key={sub.id}>
                                    <Comment comment={sub} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
