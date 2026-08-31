import { Link } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { commentText } from '../utils/commentText';
import type { Story } from '../types';
import '../styles/item.scss';

export default function Item({ item }: { item: Story }) {
    const { settings } = useSettings();
    const hasUrl = (item.url || '').indexOf('http') === 0;
    const target = settings.openLinkInNewTab ? '_blank' : undefined;
    return (
        <div className="item-content" style={{ marginBottom: `${settings.listSpacing}px` }}>
            <p>{hasUrl ? <a className="title" style={{ fontSize: `${settings.titleFontSize}px` }} href={item.url} target={target} rel={target ? 'noopener' : undefined}>{item.title}</a> : <Link className="title" style={{ fontSize: `${settings.titleFontSize}px` }} to={`/item/${item.id}`}>{item.title}</Link>}{hasUrl && item.domain && <span className="domain">({item.domain})</span>}</p>
            <div className="subtext-palm">
                {item.type !== 'job' && <div className="details"><span className="name"><Link to={`/user/${item.user}`}>{item.user}</Link></span><span className="right">{item.points} ★</span></div>}
                <div className="details">{item.time_ago} {item.type !== 'job' && <Link to={`/item/${item.id}`} className="comment-number"> • {commentText(item.comments_count)}</Link>}</div>
            </div>
            <div className="subtext-laptop">
                {item.type !== 'job' && <span>{item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link></span>}
                <span className={item.type !== 'job' ? 'item-details' : undefined}>{item.time_ago}{item.type !== 'job' && <> | <Link to={`/item/${item.id}`}>{commentText(item.comments_count)}</Link></>}</span>
            </div>
        </div>
    );
}
