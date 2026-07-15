import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../shared/components/error-message/error-message.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { userUser1 } from '../../testing/fixtures';

function configure(apiMock: Partial<HackerNewsAPIService>, params: any) {
  return TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    declarations: [UserComponent, LoaderComponent, ErrorMessageComponent],
    providers: [
      { provide: HackerNewsAPIService, useValue: apiMock },
      { provide: ActivatedRoute, useValue: { params: of(params) } },
    ],
  }).compileComponents();
}

describe('UserComponent', () => {
  it('renders the user id, karma, created date and about', async () => {
    await configure({ fetchUser: () => of(userUser1 as any) }, { id: 'user1' });
    const fixture: ComponentFixture<UserComponent> = TestBed.createComponent(UserComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('user1');
    expect(el.textContent).toContain('1234');
    expect(el.querySelector('.other-details p')!.innerHTML).toContain('<i>user1</i>');
  });

  it('renders an error message when the user fails to load', async () => {
    await configure({ fetchUser: () => throwError('boom') }, { id: 'ghost' });
    const fixture: ComponentFixture<UserComponent> = TestBed.createComponent(UserComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Could not load user ghost.'
    );
  });
});
