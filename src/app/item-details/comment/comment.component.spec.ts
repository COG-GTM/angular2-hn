import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  it('starts expanded', () => {
    const component = new CommentComponent();

    component.ngOnInit();

    expect(component.collapse).toBe(false);
  });
});
