import { useParams, NavLink } from 'react-router-dom';
import { useFeed } from '../../api/hooks';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Item } from './Item';

export function Feed({ feedType }: { feedType: string }) {
  const params = useParams();
  const pageNum = params.page ? +params.page : 1;
  const { data: items, errorMessage } = useFeed(feedType, pageNum);
  const listStart = (pageNum - 1) * 30 + 1;

  return (
    <div className="main-content">
      {!items && !errorMessage && <Loader />}
      {!items && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {items && (
        <div>
          {feedType === 'jobs' && (
            <p className="job-header">
              These are jobs at startups that were funded by Y Combinator. You can also get a job at
              a YC startup through{' '}
              <a href="https://triplebyte.com/?ref=yc_jobs">Triplebyte</a>.
            </p>
          )}
          {feedType !== 'new' && (
            <ol className={feedType !== 'jobs' ? 'list-margin' : undefined} start={listStart}>
              {items.map((item) => (
                <li key={item.id} className="post">
                  <div className="item-block">
                    <Item item={item} />
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="nav">
            {listStart !== 1 && (
              <NavLink to={`/${feedType}/${pageNum - 1}`} className="prev">
                ‹ Prev
              </NavLink>
            )}
            {items.length === 30 && (
              <NavLink to={`/${feedType}/${pageNum + 1}`} className="more">
                More ›
              </NavLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
