import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    let mockHackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    const mockUser: User = {
        id: 'testuser',
        crated_time: 1234567890,
        created: '10 years ago',
        karma: 5000,
        avg: 0,
        about: '<p>Hello, I am a test user.</p>',
    } as User;

    beforeEach(() => {
        mockHackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHackerNewsService.fetchUser.and.returnValue(of(mockUser));

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'testuser' }),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch user on init', () => {
        expect(mockHackerNewsService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user after fetch', () => {
        expect(component.user).toEqual(mockUser);
    });

    it('should navigate back when goBack is called', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should render user profile', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('testuser');
    });

    it('should render user karma', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('5000');
    });

    it('should render created date', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.textContent).toContain('10 years ago');
    });

    it('should render about section when user has about', () => {
        const compiled = fixture.nativeElement;
        const aboutSection = compiled.querySelector('.other-details');
        expect(aboutSection).toBeTruthy();
    });

    it('should render the back button', () => {
        const compiled = fixture.nativeElement;
        const backBtn = compiled.querySelector('.back-button');
        expect(backBtn).toBeTruthy();
    });

    it('should call goBack when back button is clicked', () => {
        const compiled = fixture.nativeElement;
        const backBtn = compiled.querySelector('.back-button');
        backBtn.click();
        expect(mockLocation.back).toHaveBeenCalled();
    });
});

describe('UserComponent with error', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHackerNewsService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;

    beforeEach(() => {
        mockHackerNewsService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHackerNewsService.fetchUser.and.returnValue(throwError('error'));

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent, MockLoaderComponent, MockErrorMessageComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'unknownuser' }),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should set errorMessage on error', () => {
        expect(component.errorMessage).toBe('Could not load user unknownuser.');
    });

    it('should not have user on error', () => {
        expect(component.user).toBeUndefined();
    });
});
