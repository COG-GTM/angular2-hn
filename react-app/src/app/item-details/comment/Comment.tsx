import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentModel } from '../../shared/models/models';
import './comment.scss';

export function Comment({ comment }: { comment: CommentModel }): JSX.Element {
    const [collapse, setCollapse] = useState(false);

    return (
        <app-comment>
            {!comment.deleted && (
                <div>
                    <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                        <span className="collapse" onClick={() => setCollapse(!collapse)}>
                            {`[${collapse ? '+' : '-'}]`}
                        </span>
                        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                        <span className="time">{comment.time_ago}</span>
                    </div>
                    <div className="comment-tree">
                        <div hidden={collapse}>
                            <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
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
                <div>
                    <div className="deleted-meta">
                        <span className="collapse">[deleted]</span> | Comment Deleted
                    </div>
                </div>
            )}
        </app-comment>
    );
}
