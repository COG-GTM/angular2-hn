import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchFeed } from '../api/hackernews'
import { ErrorMessage } from '../components/ErrorMessage'
import { Item } from '../components/Item'
import { Loader } from '../components/Loader'
import type { FeedType } from '../models/feed-type'
import type { Story } from '../models/story'

interface FeedProps {
  feedType: FeedType
}

export function Feed({ feedType }: FeedProps) {
  const { page: pageParam } = useParams()
  const page = Number(pageParam) || 1
  const [items, setItems] = useState<Story[] | undefined>()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setItems(undefined)
    setError('')
    fetchFeed(feedType, page)
      .then((nextItems) => {
        if (!cancelled) {
          setItems(nextItems)
          window.scrollTo(0, 0)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(`Could not load ${feedType} stories.`)
        }
      })

    return () => {
      cancelled = true
    }
  }, [feedType, page])

  const listStart = (page - 1) * 30 + 1

  return (
    <div className="main-content">
      {!items && !error && <Loader />}
      {!items && error && <ErrorMessage message={error} />}
      {items && (
        <>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You
              can also get a job at a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          <ol
            className={feedType !== 'jobs' ? 'list-margin' : ''}
            start={listStart}
          >
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} />
              </li>
            ))}
          </ol>
          <div className="nav">
            {listStart !== 1 && (
              <Link className="prev" to={`/${feedType}/${page - 1}`}>
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link className="more" to={`/${feedType}/${page + 1}`}>
                More ›
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  )
}
