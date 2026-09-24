import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { routing } from './app.routes';
import { FeedComponent } from './feeds/feed/feed.component';

describe('app routes', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [routing] });
    router = TestBed.inject(Router);
  });

  it('redirects the root path to news/1', () => {
    const root = router.config.find(r => r.path === '');
    expect(root.redirectTo).toBe('news/1');
    expect(root.pathMatch).toBe('full');
  });

  it('defines a paged feed route per feed type', () => {
    for (const type of ['news', 'newest', 'show', 'ask', 'jobs']) {
      const route = router.config.find(r => r.path === type);
      expect(route.data.feedType).toBe(type);
      expect(route.children[0].path).toBe(':page');
      expect(route.children[0].component).toBe(FeedComponent);
    }
  });

  it('lazy loads item and user modules', () => {
    const item = router.config.find(r => r.path === 'item');
    const user = router.config.find(r => r.path === 'user');
    expect(typeof item.loadChildren).toBe('function');
    expect(typeof user.loadChildren).toBe('function');
  });
});
