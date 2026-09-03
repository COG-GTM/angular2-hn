import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import type { Story } from '../models/story'
import { formatCommentCount } from '../utils/format-comments'
import './Item.scss'

interface ItemProps {
  item: Story
}

export function Item({ item }: ItemProps) {
  const { settings } = useSettings()
  const hasUrl = item.url?.startsWith('http') ?? false
  const titleStyle = { fontSize: `${settings.titleFontSize}px` }
  const externalLinkProps = settings.openLinkInNewTab
    ? { target: '_blank', rel: 'noopener' }
    : {}

  return (
    <div
      className="item-block"
      style={{ marginBottom: `${settings.listSpacing}px` }}
    >
      {hasUrl ? (
        <p>
          <a className="title" style={titleStyle} href={item.url} {...externalLinkProps}>
            {item.title}
          </a>
          {item.domain && <span className="domain">({item.domain})</span>}
        </p>
      ) : (
        <p>
          <Link className="title" style={titleStyle} to={`/item/${item.id}`}>
            {item.title}
          </Link>
        </p>
      )}
      <div className="subtext-palm">
        <div className="details">
          {item.type !== 'job' && (
            <>
              <span className="name">
                <Link to={`/user/${item.user}`}>{item.user}</Link>
              </span>
              <span className="right">{item.points} ★</span>
            </>
          )}
        </div>
        <div className="details">
          {item.time_ago}
          {item.type !== 'job' && (
            <Link to={`/item/${item.id}`} className="comment-number">
              {' • '}
              {formatCommentCount(item.comments_count)}
            </Link>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        <span>
          {item.type !== 'job' && (
            <>
              {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
            </>
          )}
        </span>
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
  )
}
