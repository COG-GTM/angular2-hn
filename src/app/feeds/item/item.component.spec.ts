import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept item input', () => {
    const testItem = {
      id: 1,
      title: 'Test',
      points: 100,
      user: 'testuser',
      time: 1234567890,
      time_ago: 123456,
      type: 'news' as any,
      url: 'https://test.com',
      domain: 'test.com',
      comments: [],
      comments_count: 0,
      poll: [],
      poll_votes_count: 0,
      deleted: false,
      dead: false
    };
    component.item = testItem;
    expect(component.item).toEqual(testItem);
  });
});
