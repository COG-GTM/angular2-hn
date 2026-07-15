import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentModel } from '../models';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

// Port of src/app/item-details/comment/comment.component.{ts,html,scss}
export default function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState<boolean>(false);

    return (
        <div className="app-comment">
            {!comment.deleted && (
                <div>
                    <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                        <span className="collapse" onClick={() => setCollapse((c) => !c)}>
                            [{collapse ? '+' : '-'}]
                        </span>{' '}
                        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                        <span className="time">{comment.time_ago}</span>
                    </div>
                    <div className="comment-tree">
                        <div hidden={collapse}>
                            <p
                                className="comment-text"
                                dangerouslySetInnerHTML={{ __html: comment.content }}
                            ></p>
                            <ul className="subtree">
                                {comment.comments.map((subComment) => (
                                    <li key={subComment.id}>
                                        <Comment comment={subComment} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
            {comment.deleted && (
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            )}
        </div>
    );
}
