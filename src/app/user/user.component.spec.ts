import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

@Component({ selector: 'app-loader', template: '' })
class MockLoaderComponent {}

@Component({ selector: 'app-error-message', template: '' })
class MockErrorMessageComponent {
    @Input() message: string;
}

function createMockUser(): User {
    const user = new User();
    user.id = 'testuser';
    user.crated_time = 1234567890;
    user.created = '10 years ago';
    user.karma = 5000;
    user.avg = 10;
    user.about = 'A test user';
    return user;
}

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHNService: any;
    let mockLocation: any;
    let mockUser: User;

    beforeEach(async(() => {
        mockUser = createMockUser();
        mockHNService = {
            fetchUser: jasmine.createSpy('fetchUser').and.returnValue(of(mockUser))
        };
        mockLocation = {
            back: jasmine.createSpy('back')
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'testuser' })
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch user on init', () => {
        expect(mockHNService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user after fetching', () => {
        expect(component.user).toEqual(mockUser);
    });

    it('should call location.back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should have empty errorMessage initially', () => {
        expect(component.errorMessage).toBe('');
    });

    it('should set errorMessage on fetch error', () => {
        mockHNService.fetchUser.and.returnValue(throwError('error'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHNService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'failuser' })
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.errorMessage).toBe('Could not load user failuser.');
    });

    it('should render user profile when loaded', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.profile')).toBeTruthy();
    });

    it('should display user id', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('testuser');
    });

    it('should display user karma', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('5000');
    });

    it('should display created time', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.textContent).toContain('10 years ago');
    });

    it('should display about section', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.other-details')).toBeTruthy();
    });

    it('should render back button', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.back-button')).toBeTruthy();
    });

    it('should not show about section when about is empty', () => {
        component.user = createMockUser();
        component.user.about = '';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('.other-details')).toBeFalsy();
    });
});
