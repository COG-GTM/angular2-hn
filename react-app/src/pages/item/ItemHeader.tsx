// Ported from the header blocks of src/app/item-details/item-details.component.html
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../../settings/SettingsContext';
import type { Story } from '../../types';
import { commentLabel, externalLinkProps, hasExternalUrl } from '../../utils/format';

function TitleLink({ item }: { item: Story }) {
  const { settings } = useSettings();
  if (hasExternalUrl(item.url)) {
    return (
      <a className="title" href={item.url} {...externalLinkProps(settings.openLinkInNewTab)}>
        {item.title}
      </a>
    );
  }
  return (
    <Link className="title" to={`/item/${item.id}`}>
      {item.title}
    </Link>
  );
}

export function ItemHeader({ item }: { item: Story }) {
  const navigate = useNavigate();
  const isJob = item.type === 'job';
  const laptopClasses = ['laptop'];
  if (item.comments_count > 0 || isJob) laptopClasses.push('item-header');
  if (item.content) laptopClasses.push('head-margin');

  return (
    <>
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" role="button" aria-label="Back" onClick={() => navigate(-1)}></span>
          <TitleLink item={item} />
        </p>
      </div>
      <div className={laptopClasses.join(' ')} data-testid="laptop-header">
        <p>
          <TitleLink item={item} />
          {hasExternalUrl(item.url) && item.domain && <span className="domain"> ({item.domain})</span>}
        </p>
        <div className="subtext">
          {!isJob && (
            <span>
              {item.points} points by <Link to={`/user/${item.user}`}>{item.user}</Link>
            </span>
          )}{' '}
          <span className={isJob ? undefined : 'item-details'}>
            {item.time_ago}
            {!isJob && (
              <span>
                {' | '}
                <Link to={`/item/${item.id}`}>{commentLabel(item.comments_count)}</Link>
              </span>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
