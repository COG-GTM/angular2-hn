import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchItemContent } from '../api/hackernews'
import { Comment } from '../components/Comment'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loader } from '../components/Loader'
import { useSettings } from '../context/SettingsContext'
import type { Story } from '../models/story'
import { formatCommentCount } from '../utils/format-comments'
import { sanitizeHtml } from '../utils/sanitize'
import './ItemDetails.scss'

function StoryTitle({ item }: { item: Story }) {
  const { settings } = useSettings()
  const hasUrl = item.url?.startsWith('http') ?? false
  const linkProps = settings.openLinkInNewTab
    ? { target: '_blank', rel: 'noopener' }
    : {}

  return hasUrl ? (
    <>
      <a className="title" href={item.url} {...linkProps}>
        {item.title}
      </a>
      {item.domain && <span className="domain">({item.domain})</span>}
    </>
  ) : (
    <Link className="title" to={`/item/${item.id}`}>
      {item.title}
    </Link>
  )
}

export default function ItemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routeKey = id ?? ''
  const [state, setState] = useState<{
    key: string
    item?: Story
    error?: string
  }>({ key: '' })

  useEffect(() => {
    let cancelled = false
    setState({ key: routeKey })
    window.scrollTo(0, 0)
    fetchItemContent(Number(id))
      .then((nextItem) => {
        if (!nextItem || nextItem.id !== Number(id)) {
          throw new Error('Invalid item response')
        }
        if (!cancelled) setState({ key: routeKey, item: nextItem })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ key: routeKey, error: 'Could not load item comments.' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, routeKey])

  const current = state.key === routeKey ? state : { key: routeKey }
  const { item, error } = current

  return (
    <div className="main-content">
      {!item && !error && <Loader />}
      {!item && error && <ErrorMessage message={error} />}
      {item && (
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)} />
              <StoryTitle item={item} />
            </p>
          </div>
          <div
            className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}${item.content ? ' head-margin' : ''}`}
          >
            <p>
              <StoryTitle item={item} />
            </p>
            <div className="subtext">
              {item.type !== 'job' && (
                <span>
                  {item.points} points by{' '}
                  <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? 'item-details' : ''}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <>
                    {' | '}
                    <Link to={`/item/${item.id}`}>
                      {formatCommentCount(item.comments_count)}
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div className="pollContent" key={index}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(pollResult.content),
                    }}
                  />
                  <div className="subtext">{pollResult.points} points</div>
                  <div
                    className="pollBar"
                    style={{
                      width: `${item.poll_votes_count
                        ? (pollResult.points / item.poll_votes_count) * 100
                        : 0}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          <p
            className="subject"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.content) }}
          />
          <ul className="comment-list">
            {item.comments?.map((comment) => (
              <li key={comment.id}>
                <Comment comment={comment} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
