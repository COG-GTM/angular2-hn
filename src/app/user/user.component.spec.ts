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

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockUser: User = {
        id: 'testuser',
        crated_time: 1234567890,
        created: '10 years ago',
        karma: 500,
        avg: 10,
        about: '<p>A test user</p>',
    };

    beforeEach(async(() => {
        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'testuser' }),
                    },
                },
            ],
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
        expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user from API response', () => {
        expect(component.user).toEqual(mockUser);
    });

    it('should navigate back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should set errorMessage on API error', () => {
        mockHackerNewsAPIService.fetchUser.and.returnValue(throwError('error'));

        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'testuser' }),
                    },
                },
            ],
        }).compileComponents();

        const errorFixture = TestBed.createComponent(UserComponent);
        const errorComponent = errorFixture.componentInstance;
        errorFixture.detectChanges();

        expect(errorComponent.errorMessage).toBe('Could not load user testuser.');
    });

    it('should render user name', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.name').textContent).toContain('testuser');
    });

    it('should render user karma', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('500');
    });

    it('should render user created date', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.age').textContent).toContain('10 years ago');
    });

    it('should render about section when present', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.other-details')).toBeTruthy();
    });

    it('should not render about section when empty', () => {
        component.user = { ...mockUser, about: '' };
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.other-details')).toBeFalsy();
    });

    it('should render back button', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.back-button')).toBeTruthy();
    });
});
