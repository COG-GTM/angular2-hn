import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, Subject } from 'rxjs';

import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';

describe('UserComponent', () => {
    let component: UserComponent;
    let fixture: ComponentFixture<UserComponent>;
    let mockHackerNewsAPIService: jasmine.SpyObj<HackerNewsAPIService>;
    let mockLocation: jasmine.SpyObj<Location>;
    let paramsSubject: Subject<any>;

    const mockUser: User = {
        id: 'testuser',
        crated_time: 1234567890,
        created: '10 years ago',
        karma: 5000,
        avg: 10,
        about: 'This is a test user bio',
    };

    beforeEach(async () => {
        paramsSubject = new Subject();

        mockHackerNewsAPIService = jasmine.createSpyObj('HackerNewsAPIService', ['fetchUser']);
        mockHackerNewsAPIService.fetchUser.and.returnValue(of(mockUser));

        mockLocation = jasmine.createSpyObj('Location', ['back']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [UserComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: mockHackerNewsAPIService },
                { provide: Location, useValue: mockLocation },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: paramsSubject.asObservable(),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default errorMessage as empty string', () => {
        expect(component.errorMessage).toBe('');
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should fetch user when route params change', () => {
            paramsSubject.next({ id: 'testuser' });
            expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
        });

        it('should set user when fetch is successful', () => {
            paramsSubject.next({ id: 'testuser' });
            expect(component.user).toEqual(mockUser);
        });

        it('should handle different user IDs', () => {
            paramsSubject.next({ id: 'anotheruser' });
            expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('anotheruser');
        });
    });

    describe('goBack', () => {
        it('should call location.back', () => {
            component.goBack();
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should set errorMessage when fetch fails', () => {
            const errorSubject = new Subject<User>();
            mockHackerNewsAPIService.fetchUser.and.returnValue(errorSubject.asObservable());

            fixture.detectChanges();
            paramsSubject.next({ id: 'testuser' });
            errorSubject.error(new Error('Network error'));

            expect(component.errorMessage).toBe('Could not load user testuser.');
        });
    });

    describe('user data', () => {
        beforeEach(() => {
            fixture.detectChanges();
            paramsSubject.next({ id: 'testuser' });
        });

        it('should have user id', () => {
            expect(component.user.id).toBe('testuser');
        });

        it('should have user karma', () => {
            expect(component.user.karma).toBe(5000);
        });

        it('should have user created date', () => {
            expect(component.user.created).toBe('10 years ago');
        });

        it('should have user about', () => {
            expect(component.user.about).toBe('This is a test user bio');
        });
    });
});
