import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { hasNextPage, hasPreviousPage, listStart, useFeed, type FeedType } from '../../api'
import { ErrorMessage } from '../../shared/components/ErrorMessage/ErrorMessage'
import { Loader } from '../../shared/components/Loader/Loader'
import { Item } from '../Item/Item'
import './Feed.scss'

// Port of src/app/feeds/feed/feed.component.{ts,html}. The root element stands in for the Angular
// `<app-feed>` host.
export function Feed({ feedType }: { feedType: FeedType }) {
  const params = useParams<{ page: string }>()
  const page = params.page ? +params.page : 1
  const { data: items, loading, error } = useFeed(feedType, page)

  useEffect(() => {
    if (items) window.scrollTo(0, 0)
  }, [items])

  return (
    <div className="app-feed">
      <div className="main-content">
        {loading && <Loader />}
        {error && <ErrorMessage message={`Could not load ${feedType} stories.`} />}

        {items && (
          <div>
            {feedType === 'jobs' && (
              <p className="job-header">
                These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup
                through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
              </p>
            )}
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart(page)}>
              {items.map((item) => (
                <li key={item.id} className="post">
                  <Item item={item} />
                </li>
              ))}
            </ol>
            <div className="nav">
              {hasPreviousPage(page) && (
                <Link to={`/${feedType}/${page - 1}`} className="prev">
                  ‹ Prev
                </Link>
              )}
              {hasNextPage(items.length) && (
                <Link to={`/${feedType}/${page + 1}`} className="more">
                  More ›
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
