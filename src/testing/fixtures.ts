// Shared recorded HN API fixtures for the Angular test suite. These are the SAME
// JSON files under the repo-root `fixtures/` directory used by the React (MSW)
// and Playwright parity suites, so both implementations are tested against
// identical data.
import feedNews1 from '../../fixtures/feed-news-1.json';
import feedNews2 from '../../fixtures/feed-news-2.json';
import feedNewest1 from '../../fixtures/feed-newest-1.json';
import feedShow1 from '../../fixtures/feed-show-1.json';
import feedAsk1 from '../../fixtures/feed-ask-1.json';
import feedJobs1 from '../../fixtures/feed-jobs-1.json';
import item1001 from '../../fixtures/item-1001.json';
import item1002 from '../../fixtures/item-1002.json';
import item5001 from '../../fixtures/item-5001.json';
import item300 from '../../fixtures/item-300.json';
import item301 from '../../fixtures/item-301.json';
import item302 from '../../fixtures/item-302.json';
import item303 from '../../fixtures/item-303.json';
import userUser1 from '../../fixtures/user-user1.json';

const FIXTURES: { [key: string]: any } = {
  'news?page=1': feedNews1,
  'news?page=2': feedNews2,
  'newest?page=1': feedNewest1,
  'show?page=1': feedShow1,
  'ask?page=1': feedAsk1,
  'jobs?page=1': feedJobs1,
  'item/1001': item1001,
  'item/1002': item1002,
  'item/5001': item5001,
  'item/300': item300,
  'item/301': item301,
  'item/302': item302,
  'item/303': item303,
  'user/user1': userUser1,
};

export function resolveFixture(pathname: string, page?: string): any | null {
  const path = pathname.replace(/^\//, '');
  const feedMatch = path.match(/^(news|newest|show|ask|jobs)$/);
  if (feedMatch) {
    const key = `${feedMatch[1]}?page=${page || '1'}`;
    return FIXTURES[key] !== undefined ? FIXTURES[key] : null;
  }
  return FIXTURES[path] !== undefined ? FIXTURES[path] : null;
}

export {
  feedNews1,
  feedNews2,
  feedNewest1,
  feedShow1,
  feedAsk1,
  feedJobs1,
  item1001,
  item1002,
  item5001,
  item300,
  userUser1,
};
