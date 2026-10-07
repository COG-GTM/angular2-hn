import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchFeed } from '../services/hackernewsApi'
import type { FeedName } from '../types/FeedType'
import type { Story } from '../types/Story'
import ErrorMessage from '../components/ErrorMessage'
import Item from '../components/Item'
import Loader from '../components/Loader'
import './Feed.scss'

export default function Feed({ feedType }: { feedType: FeedName }) {
  const { page: pageParam } = useParams()
  const page = Number(pageParam) || 1
  const [items, setItems] = useState<Story[] | undefined>()
  const [listStart, setListStart] = useState(1)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setErrorMessage('')

    fetchFeed(feedType, page, controller.signal)
      .then((stories) => {
        setItems(stories)
        setListStart((page - 1) * 30 + 1)
        window.scrollTo(0, 0)
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setErrorMessage(`Could not load ${feedType} stories.`)
        }
      })

    return () => controller.abort()
  }, [feedType, page])

  return (
    <div className="app-feed">
      <div className="main-content">
        {!items && !errorMessage && <Loader />}
        {!items && errorMessage && <ErrorMessage message={errorMessage} />}
        {items && (
          <>
            {feedType === 'jobs' && (
              <p className="job-header">
                These are jobs at startups that were funded by Y Combinator.
                You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
              </p>
            )}
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
              {items.map((item) => (
                <li key={item.id} className="post"><Item item={item} /></li>
              ))}
            </ol>
            <div className="nav">
              {listStart !== 1 && (
                <Link to={`/${feedType}/${page - 1}`} className="prev">‹ Prev</Link>
              )}
              {items.length === 30 && (
                <Link to={`/${feedType}/${page + 1}`} className="more">More ›</Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
