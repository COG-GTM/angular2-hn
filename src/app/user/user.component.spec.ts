import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { of, throwError, Subject } from 'rxjs';
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
    let mockHNService: any;
    let mockLocation: any;
    let paramsSubject: Subject<any>;

    beforeEach(async(() => {
        paramsSubject = new Subject();
        mockHNService = {
            fetchUser: jasmine.createSpy('fetchUser'),
        };
        mockLocation = {
            back: jasmine.createSpy('back'),
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
                        params: paramsSubject.asObservable(),
                    },
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch user on init', () => {
        const mockUser = {
            id: 'testuser',
            crated_time: 1234567890,
            created: '2 years ago',
            karma: 500,
            avg: 10,
            about: 'Test about',
        } as User;
        mockHNService.fetchUser.and.returnValue(of(mockUser));

        fixture.detectChanges();
        paramsSubject.next({ id: 'testuser' });

        expect(mockHNService.fetchUser).toHaveBeenCalledWith('testuser');
        expect(component.user).toEqual(mockUser);
    });

    it('should set error message on fetch error', () => {
        mockHNService.fetchUser.and.returnValue(throwError('error'));

        fixture.detectChanges();
        paramsSubject.next({ id: 'baduser' });

        expect(component.errorMessage).toBe('Could not load user baduser.');
    });

    it('should call location.back on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });

    it('should initialize with empty errorMessage', () => {
        expect(component.errorMessage).toBe('');
    });

    it('should initialize user as undefined', () => {
        expect(component.user).toBeUndefined();
    });
});
