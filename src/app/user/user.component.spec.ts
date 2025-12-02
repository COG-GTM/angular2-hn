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
        karma: 1000,
        avg: 10,
        about: 'Test user about'
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
                { provide: ActivatedRoute, useValue: { params: paramsSubject.asObservable() } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default error message as empty string', () => {
        expect(component.errorMessage).toBe('');
    });

    it('should fetch user on init', () => {
        component.ngOnInit();
        paramsSubject.next({ id: 'testuser' });
        expect(mockHackerNewsAPIService.fetchUser).toHaveBeenCalledWith('testuser');
    });

    it('should set user when fetched successfully', () => {
        component.ngOnInit();
        paramsSubject.next({ id: 'testuser' });
        expect(component.user).toEqual(mockUser);
    });

    describe('goBack', () => {
        it('should call location.back()', () => {
            component.goBack();
            expect(mockLocation.back).toHaveBeenCalled();
        });
    });
});
