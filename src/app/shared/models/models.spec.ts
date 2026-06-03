import { Story } from './story';
import { Comment } from './comment';
import { User } from './user';
import { PollResult } from './poll-result';

describe('models', () => {
  it('creates a Story instance', () => {
    const story = new Story();
    story.id = 1;
    story.title = 'Test';
    expect(story.id).toBe(1);
    expect(story.title).toBe('Test');
  });

  it('creates a Comment instance', () => {
    const comment = new Comment();
    comment.id = 2;
    comment.user = 'pg';
    expect(comment.id).toBe(2);
    expect(comment.user).toBe('pg');
  });

  it('creates a User instance', () => {
    const user = new User();
    user.id = 'pg';
    user.karma = 100;
    expect(user.id).toBe('pg');
    expect(user.karma).toBe(100);
  });

  it('creates a PollResult instance', () => {
    const poll = new PollResult();
    poll.points = 5;
    poll.content = 'option';
    expect(poll.points).toBe(5);
    expect(poll.content).toBe('option');
  });
});
