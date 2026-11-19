import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { User } from '../shared/models/user';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { UserComponent } from './user.component';

const pg: User = {
    id: 'pg',
    created_time: 1160418092,
    created: '20 years ago',
    karma: 157316,
    about: 'Bug fixer. <a href="http://paulgraham.com">paulgraham.com</a>',
};

describe('UserComponent', () => {
    let fetchUser: ReturnType<typeof vi.fn<(id: string) => Observable<User | null>>>;
    let back: ReturnType<typeof vi.fn>;

    async function render(id = 'pg', waitForUser = true) {
        await TestBed.configureTestingModule({
            imports: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: { fetchUser } },
                { provide: Location, useValue: { back } },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(UserComponent);
        fixture.componentRef.setInput('id', id);
        fixture.detectChanges();
        if (waitForUser) {
            await fixture.whenStable();
            fixture.detectChanges();
        }
        return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    beforeEach(() => {
        fetchUser = vi.fn();
        back = vi.fn();
    });

    it('renders the profile of the user in the route', async () => {
        fetchUser.mockReturnValue(of(pg));
        const { el } = await render('pg');

        expect(fetchUser).toHaveBeenCalledWith('pg');
        expect(el.querySelector('.title-block')?.textContent?.trim()).toBe('Profile: pg');
        expect(el.querySelector('.main-details .name')?.textContent).toBe('pg');
        expect(el.querySelector('.main-details .right')?.textContent).toBe('157316 ★');
        expect(el.querySelector('.main-details .age')?.textContent).toBe('Created 20 years ago');
        expect(el.querySelector('.other-details p')?.innerHTML).toBe(pg.about);
        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelector('app-error-message')).toBeNull();
    });

    it('omits the about section when the user has none', async () => {
        fetchUser.mockReturnValue(of({ ...pg, about: undefined }));
        const { el } = await render();

        expect(el.querySelector('.profile')).toBeTruthy();
        expect(el.querySelector('.other-details')).toBeNull();
    });

    it('shows the loader until the user arrives', async () => {
        const response = new Subject<User>();
        fetchUser.mockReturnValue(response);
        const { fixture, el } = await render('pg', false);

        expect(el.querySelector('app-loader')).toBeTruthy();
        expect(el.querySelector('.profile')).toBeNull();

        response.next(pg);
        response.complete();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelector('.profile')).toBeTruthy();
    });

    it('shows an error message when the request fails', async () => {
        fetchUser.mockReturnValue(throwError(() => new Error('500')));
        const { el } = await render('nobody');

        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelector('.profile')).toBeNull();
        expect(el.querySelector('app-error-message')?.textContent).toContain('Could not load user nobody.');
    });

    it('shows an error message when the user does not exist', async () => {
        fetchUser.mockReturnValue(of(null));
        const { el } = await render('nobody');

        expect(el.querySelector('app-loader')).toBeNull();
        expect(el.querySelector('app-error-message')?.textContent).toContain('Could not load user nobody.');
    });

    it('goes back when the back button is clicked', async () => {
        fetchUser.mockReturnValue(of(pg));
        const { el } = await render();

        (el.querySelector('.back-button') as HTMLElement).click();
        expect(back).toHaveBeenCalled();
    });
});
