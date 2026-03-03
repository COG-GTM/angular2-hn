import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { UserComponent } from './user.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { Component, Input } from '@angular/core';

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
        karma: 5000,
        avg: 10,
        about: 'Test user bio',
    } as User;

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

    it('should fetch user data on init', () => {
        expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user after fetching', () => {
        expect(component.user).toEqual(mockUser);
    });

    it('should call location.back() on goBack', () => {
        component.goBack();
        expect(mockLocation.back).toHaveBeenCalled();
    });
});
