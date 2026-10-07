import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchItemContent } from '../services/hackernewsApi'
import type { Story } from '../types/Story'
import { formatCommentCount } from '../utils/comment'
import Comment from '../components/Comment'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import { useSettings } from '../hooks/useSettings'
import './ItemDetails.scss'

export default function ItemDetails() {
  const { id: idParam = '' } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const settings = useSettings()
  const [item, setItem] = useState<Story | undefined>()
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    window.scrollTo(0, 0)
    setErrorMessage('')

    fetchItemContent(id, controller.signal)
      .then(setItem)
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setErrorMessage('Could not load item comments.')
        }
      })

    return () => controller.abort()
  }, [id])

  if (!item) {
    return (
      <div className="app-item-details">
        {!errorMessage ? <Loader /> : <ErrorMessage message={errorMessage} />}
      </div>
    )
  }

  const hasUrl = item.url.indexOf('http') === 0
  const targetProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {}

  return (
    <div className="app-item-details">
      <div className="main-content">
        <div className="item">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)} />
              {hasUrl ? (
                <a className="title" href={item.url} {...targetProps}>{item.title}</a>
              ) : (
                <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
              )}
            </p>
          </div>
          <div className={`laptop${item.comments_count > 0 || item.type === 'job' ? ' item-header' : ''}`}>
            <p>
              {hasUrl ? (
                <a className="title" href={item.url} {...targetProps}>{item.title}</a>
              ) : (
                <Link className="title" to={`/item/${item.id}`}>{item.title}</Link>
              )}
              {hasUrl && item.domain && (
                <>
                  {' '}
                  <span className="domain">({item.domain})</span>
                </>
              )}
            </p>
            <div className="subtext">
              {item.type !== 'job' && (
                <span>
                  {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
                </span>
              )}
              <span className={item.type !== 'job' ? 'item-details' : undefined}>
                {item.time_ago}
                {item.type !== 'job' && (
                  <>
                    {' | '}
                    <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link>
                  </>
                )}
              </span>
            </div>
          </div>
          {item.type === 'poll' && (
            <div className="pollResults">
              {item.poll.map((pollResult, index) => (
                <div key={index} className="pollContent">
                  <div dangerouslySetInnerHTML={{ __html: pollResult.content }} />
                  <div className="subtext">{pollResult.points} points</div>
                  <div className="pollBar" style={{ width: `${pollResult.points / item.poll_votes_count * 100}%` }} />
                </div>
              ))}
            </div>
          )}
          <p className="subject" dangerouslySetInnerHTML={{ __html: item.content ?? '' }} />
          <ul className="comment-list">
            {item.comments.map((comment) => (
              <li key={comment.id}><Comment comment={comment} /></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
