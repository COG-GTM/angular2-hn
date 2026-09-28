import { NavLink } from 'react-router-dom'
import type { Story } from '../../api'
import { useSettings } from '../../settings'
import { formatCommentCount } from '../../utils/formatCommentCount'
import { hasUrl } from '../../utils/hasUrl'
import './Item.scss'

// Port of src/app/feeds/item/item.component.{ts,html}. The root element stands in for the Angular
// `<item class="item-block">` host plus the template's outer div.
export function Item({ item }: { item: Story }) {
  const { settings } = useSettings()
  const titleStyle = { fontSize: `${settings.titleFontSize}px` }
  const isJob = item.type === 'job'
  const commentCount = formatCommentCount(item.comments_count)

  return (
    <div className="item item-block" style={{ marginBottom: `${settings.listSpacing}px` }}>
      {hasUrl(item.url) ? (
        <p>
          <a
            className="title"
            style={titleStyle}
            href={item.url}
            target={settings.openLinkInNewTab ? '_blank' : undefined}
            rel={settings.openLinkInNewTab ? 'noopener' : undefined}
          >
            {item.title}
          </a>
          {item.domain && (
            <>
              {' '}
              <span className="domain">({item.domain})</span>
            </>
          )}
        </p>
      ) : (
        <p>
          <NavLink className="title" style={titleStyle} to={`/item/${item.id}`}>
            {item.title}
          </NavLink>
        </p>
      )}
      <div className="subtext-palm">
        {!isJob && (
          <div className="details">
            <span className="name">
              <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>
            </span>
            <span className="right">{item.points} ★</span>
          </div>
        )}
        <div className="details">
          {item.time_ago}
          {!isJob && (
            <NavLink to={`/item/${item.id}`} className="comment-number">
              {' '}
              • {commentCount}
            </NavLink>
          )}
        </div>
      </div>
      <div className="subtext-laptop">
        {!isJob && (
          <span>
            {item.points} points by <NavLink to={`/user/${item.user}`}>{item.user}</NavLink>{' '}
          </span>
        )}
        <span className={isJob ? undefined : 'item-details'}>
          {item.time_ago}
          {!isJob && (
            <span>
              {' '}
              | <NavLink to={`/item/${item.id}`}>{commentCount}</NavLink>
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
