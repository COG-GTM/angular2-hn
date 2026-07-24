import { BookmarksService } from './bookmarks.service';
import { Story } from '../models/story';

function makeStory(id: number, title: string): Story {
  const story = new Story();
  story.id = id;
  story.title = title;
  return story;
}

describe('BookmarksService', () => {
  let service: BookmarksService;

  beforeEach(() => {
    localStorage.removeItem('savedStories');
    service = new BookmarksService();
  });

  it('should start with no saved stories', () => {
    expect(service.savedStories.length).toBe(0);
    expect(service.isSaved(1)).toBe(false);
  });

  it('should save a story on toggle', () => {
    service.toggle(makeStory(1, 'First'));
    expect(service.isSaved(1)).toBe(true);
    expect(service.savedStories.length).toBe(1);
  });

  it('should unsave a saved story on second toggle', () => {
    const story = makeStory(1, 'First');
    service.toggle(story);
    service.toggle(story);
    expect(service.isSaved(1)).toBe(false);
    expect(service.savedStories.length).toBe(0);
  });

  it('should put the most recently saved story first', () => {
    service.toggle(makeStory(1, 'First'));
    service.toggle(makeStory(2, 'Second'));
    expect(service.savedStories[0].id).toBe(2);
  });

  it('should persist saved stories to localStorage', () => {
    service.toggle(makeStory(1, 'First'));
    const restored = new BookmarksService();
    expect(restored.isSaved(1)).toBe(true);
  });

  it('should recover from corrupt localStorage data', () => {
    localStorage.setItem('savedStories', 'not-json');
    const restored = new BookmarksService();
    expect(restored.savedStories.length).toBe(0);
  });

  it('should paginate saved stories', () => {
    for (let i = 1; i <= 35; i++) {
      service.toggle(makeStory(i, `Story ${i}`));
    }
    expect(service.getPage(1).length).toBe(30);
    expect(service.getPage(2).length).toBe(5);
    expect(service.getPage(1, 10).length).toBe(10);
  });
});
