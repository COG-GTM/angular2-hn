import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import type { Story } from '../../types';
import { formatCommentCount } from '../../utils/comment';
import './Item.scss';

export function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const hasUrl = item.url?.indexOf('http') === 0;
    const titleStyle = { fontSize: `${settings.titleFontSize}px` };
    const externalProps = settings.openLinkInNewTab ? { target: '_blank', rel: 'noopener' } : {};
    return (
        <div style={{ marginBottom: `${settings.listSpacing}px` }}>
            <p>{hasUrl
                ? <><a className="title" style={titleStyle} href={item.url} {...externalProps}>{item.title}</a>{item.domain && <span className="domain">({item.domain})</span>}</>
                : <Link className="title" style={titleStyle} to={`/item/${item.id}`}>{item.title}</Link>}
            </p>
            <div className="subtext-palm">
                {item.type !== 'job' && <div className="details"><span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span><span className="right">{item.points} ★</span></div>}
                <div className="details">{item.time_ago}{item.type !== 'job' && <Link to={`/item/${item.id}`} className="comment-number"> • {formatCommentCount(item.comments_count)}</Link>}</div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>{item.time_ago}{item.type !== 'job' && <> | <Link to={`/item/${item.id}`}>{formatCommentCount(item.comments_count)}</Link></>}</span>
            </div>
        </div>
    );
}
