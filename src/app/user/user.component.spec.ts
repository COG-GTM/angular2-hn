import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { UserComponent } from './user.component';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
    let fixture: ComponentFixture<UserComponent>;
    let component: UserComponent;
    let api: jasmine.SpyObj<HackerNewsAPIService>;
    let location: jasmine.SpyObj<Location>;
    let routeParams: BehaviorSubject<{ id: string }>;

    const user: User = {
        id: 'pg',
        crated_time: 1160418092,
        created: '13 years ago',
        karma: 155111,
        avg: 0,
        about: '<p>Bug fixer.</p>',
    };

    const element = (): HTMLElement => fixture.nativeElement;

    beforeEach(() => {
        api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchUser']);
        location = jasmine.createSpyObj<Location>('Location', ['back']);
        routeParams = new BehaviorSubject({ id: 'pg' });

        TestBed.configureTestingModule({
            imports: [SharedComponentsModule],
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: api },
                { provide: Location, useValue: location },
                { provide: ActivatedRoute, useValue: { params: routeParams } },
            ],
        });

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
    });

    it('should fetch the user identified by the route param', () => {
        api.fetchUser.and.returnValue(of(user));

        fixture.detectChanges();

        expect(api.fetchUser).toHaveBeenCalledWith('pg');
        expect(component.user).toEqual(user);
    });

    it('should refetch when the route param changes', () => {
        api.fetchUser.and.returnValue(of(user));
        fixture.detectChanges();

        routeParams.next({ id: 'dang' });

        expect(api.fetchUser.calls.mostRecent().args).toEqual(['dang']);
    });

    it('should show the loader while the profile is loading', () => {
        api.fetchUser.and.returnValue(new Subject<User>());

        fixture.detectChanges();

        expect(element().querySelector('app-loader')).not.toBeNull();
        expect(element().querySelector('.profile')).toBeNull();
    });

    it('should render the profile details', () => {
        api.fetchUser.and.returnValue(of(user));

        fixture.detectChanges();

        expect(element().querySelector('.name').textContent).toBe('pg');
        expect(element().querySelector('.right').textContent).toContain('155111');
        expect(element().querySelector('.age').textContent).toBe('Created 13 years ago');
        expect(element().querySelector('.other-details p').innerHTML).toBe('<p>Bug fixer.</p>');
        expect(element().querySelector('app-loader')).toBeNull();
    });

    it('should omit the about section when the user has none', () => {
        api.fetchUser.and.returnValue(of({ ...user, about: '' }));

        fixture.detectChanges();

        expect(element().querySelector('.other-details')).toBeNull();
    });

    it('should show an error message when the user fails to load', () => {
        api.fetchUser.and.returnValue(throwError(new Error('not found')));

        fixture.detectChanges();

        expect(component.errorMessage).toBe('Could not load user pg.');
        expect(element().querySelector('app-error-message')).not.toBeNull();
        expect(element().querySelector('app-loader')).toBeNull();
    });

    it('should navigate back when the back button is clicked', () => {
        api.fetchUser.and.returnValue(of(user));
        fixture.detectChanges();

        (element().querySelector('.back-button') as HTMLElement).click();

        expect(location.back).toHaveBeenCalled();
    });
});
