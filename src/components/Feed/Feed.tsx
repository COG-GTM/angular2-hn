import React from 'react'
import { Link } from 'react-router-dom'
import { Story, FeedType } from '../../types'
import Item from '../Item/Item'

interface FeedProps {
  items: Story[]
  feedType: FeedType
  pageNum: number
}

const Feed: React.FC<FeedProps> = ({ items, feedType, pageNum }) => {
  const listStart = ((pageNum - 1) * 30) + 1

  return (
    <div className="main-content">
      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator.
              You can also get a job at a YC startup through <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          
          <ol className={feedType !== 'jobs' ? 'list-margin' : ''} start={listStart}>
            {items.map((item) => (
              <li key={item.id} className="post">
                <Item item={item} className="item-block" />
              </li>
            ))}
          </ol>
          
          <div className="nav">
            {listStart !== 1 && (
              <Link to={`/${feedType}/${pageNum - 1}`} className="prev">
                ‹ Prev
              </Link>
            )}
            {items.length === 30 && (
              <Link to={`/${feedType}/${pageNum + 1}`} className="more">
                More ›
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Feed
