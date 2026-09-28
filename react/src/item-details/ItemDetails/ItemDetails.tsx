import { useEffect } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useItem } from '../../api'
import { useSettings } from '../../settings'
import { ErrorMessage } from '../../shared/components/ErrorMessage/ErrorMessage'
import { Loader } from '../../shared/components/Loader/Loader'
import { formatCommentCount } from '../../utils/formatCommentCount'
import { hasUrl } from '../../utils/hasUrl'
import { Comment } from '../Comment/Comment'
import './ItemDetails.scss'

export function ItemDetails() {
  const { id } = useParams()
  const { data: item, error } = useItem(Number(id))
  const { settings } = useSettings()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const externalLinkProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {}

  return (
    <div className="app-item-details">
      <div className="main-content">
        {!item && !error && <Loader />}
        {!item && error && <ErrorMessage message="Could not load item comments." />}

        {item && (
          <div className="item">
            <div className="mobile item-header">
              <p className="title-block">
                <span className="back-button" onClick={() => navigate(-1)}></span>
                {hasUrl(item.url) ? (
                  <a className="title" href={item.url} {...externalLinkProps}>
                    {item.title}
                  </a>
                ) : (
                  <NavLink className="title" to={`/item/${item.id}`}>
                    {item.title}
                  </NavLink>
                )}
              </p>
            </div>
            <div className={item.comments_count > 0 || item.type === 'job' ? 'laptop item-header' : 'laptop'}>
              {hasUrl(item.url) ? (
                <p>
                  <a className="title" href={item.url} {...externalLinkProps}>
                    {item.title}
                  </a>{' '}
                  {item.domain && <span className="domain">({item.domain})</span>}
                </p>
              ) : (
                <p>
                  <NavLink className="title" to={`/item/${item.id}`}>
                    {item.title}
                  </NavLink>
                </p>
              )}
              <div className="subtext">
                {item.type !== 'job' && (
                  <span>
                    {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
                  </span>
                )}{' '}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>
                  {item.time_ago}
                  {item.type !== 'job' && (
                    <span>
                      {' | '}
                      <NavLink to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</NavLink>
                    </span>
                  )}
                </span>
              </div>
            </div>
            {item.type === 'poll' && (
              <div className="pollResults">
                {item.poll?.map((pollResult, i) => (
                  <div key={i} className="pollContent">
                    <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                    <div className="subtext">{pollResult.points} points</div>
                    <div
                      className="pollBar"
                      style={{ width: `${(pollResult.points / (item.poll_votes_count ?? 0)) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            )}
            <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
            <ul className="comment-list">
              {item.comments.map((comment) => (
                <li key={comment.id}>
                  <Comment comment={comment} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
