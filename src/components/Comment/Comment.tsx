import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Comment as CommentType } from '../../types'
import styles from './Comment.module.scss'

interface CommentProps {
    comment: CommentType
}

export function Comment({ comment }: CommentProps) {
    const [collapsed, setCollapsed] = useState(false)

    if (comment.deleted) {
        return (
            <div className={styles['deleted-meta']}>
                <span className={styles.collapse}>[deleted]</span> | Comment Deleted
            </div>
        )
    }

    return (
        <div>
            <div className={`${styles.meta} ${collapsed ? styles['meta-collapse'] : ''}`}>
                <span className={styles.collapse} onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles['comment-tree']}>
                {!collapsed && (
                    <div>
                        <p
                            className={styles['comment-text']}
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        {comment.comments && comment.comments.length > 0 && (
                            <ul className={styles.subtree}>
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
    )
}
