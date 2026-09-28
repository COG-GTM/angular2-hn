import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentComponent } from './comment/comment.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { Settings } from '../shared/models/settings';
import { Story } from '../shared/models/story';
import { Comment } from '../shared/models/comment';

function buildComment(id: number, overrides: Partial<Comment> = {}): Comment {
    return {
        id,
        level: 0,
        user: `user${id}`,
        time: 0,
        time_ago: '1 hour ago',
        content: `<p>Comment ${id}</p>`,
        deleted: false,
        comments: [],
        ...overrides,
    };
}

function buildStory(overrides: Partial<Story> = {}): Story {
    return ({
        id: 123,
        title: 'Show HN: A thing',
        points: 250,
        user: 'pg',
        time: 0,
        time_ago: '3 hours ago',
        type: 'story',
        url: 'https://example.com/thing',
        domain: 'example.com',
        comments: [buildComment(1), buildComment(2)],
        comments_count: 2,
        ...overrides,
    } as unknown) as Story;
}

describe('ItemDetailsComponent', () => {
    let fixture: ComponentFixture<ItemDetailsComponent>;
    let component: ItemDetailsComponent;
    let api: jasmine.SpyObj<HackerNewsAPIService>;
    let location: jasmine.SpyObj<Location>;
    let routeParams: BehaviorSubject<{ id: string }>;
    let settings: Settings;

    const element = (): HTMLElement => fixture.nativeElement;

    beforeEach(() => {
        api = jasmine.createSpyObj<HackerNewsAPIService>('HackerNewsAPIService', ['fetchItemContent']);
        location = jasmine.createSpyObj<Location>('Location', ['back']);
        routeParams = new BehaviorSubject({ id: '123' });
        settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '16',
            listSpacing: '0',
        };
        spyOn(window, 'scrollTo');

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule, SharedComponentsModule],
            declarations: [ItemDetailsComponent, CommentComponent],
            providers: [
                { provide: HackerNewsAPIService, useValue: api },
                { provide: SettingsService, useValue: { settings } },
                { provide: Location, useValue: location },
                { provide: ActivatedRoute, useValue: { params: routeParams } },
            ],
        });

        fixture = TestBed.createComponent(ItemDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should fetch the item using the numeric id from the route', () => {
        api.fetchItemContent.and.returnValue(of(buildStory()));

        fixture.detectChanges();

        expect(api.fetchItemContent).toHaveBeenCalledWith(123);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('should refetch when the route id changes', () => {
        api.fetchItemContent.and.returnValue(of(buildStory()));
        fixture.detectChanges();

        routeParams.next({ id: '456' });

        expect(api.fetchItemContent.calls.mostRecent().args).toEqual([456]);
    });

    it('should show the loader until the item arrives', () => {
        api.fetchItemContent.and.returnValue(new Subject<Story>());

        fixture.detectChanges();

        expect(element().querySelector('app-loader')).not.toBeNull();
        expect(element().querySelector('.item')).toBeNull();
    });

    it('should render the story details and a comment per top-level comment', () => {
        api.fetchItemContent.and.returnValue(of(buildStory()));

        fixture.detectChanges();

        const text = element().textContent;
        expect(text).toContain('Show HN: A thing');
        expect(text).toContain('250 points by');
        expect(text).toContain('2 comments');
        expect(element().querySelector('.domain').textContent).toContain('(example.com)');
        expect(element().querySelectorAll('.comment-list > li > app-comment').length).toBe(2);
        expect(element().querySelector('app-loader')).toBeNull();
    });

    it('should link external stories to their url, honouring the new tab setting', () => {
        settings.openLinkInNewTab = true;
        api.fetchItemContent.and.returnValue(of(buildStory()));

        fixture.detectChanges();

        const title = element().querySelector('.laptop a.title');
        expect(component.hasUrl).toBe(true);
        expect(title.getAttribute('href')).toBe('https://example.com/thing');
        expect(title.getAttribute('target')).toBe('_blank');
        expect(title.getAttribute('rel')).toBe('noopener');
    });

    it('should link self posts back to the item route', () => {
        api.fetchItemContent.and.returnValue(of(buildStory({ url: 'item?id=123' })));

        fixture.detectChanges();

        expect(component.hasUrl).toBe(false);
        expect(element().querySelector('.laptop a.title').getAttribute('href')).toBe('/item/123');
    });

    it('should render poll options', () => {
        api.fetchItemContent.and.returnValue(
            of(
                buildStory({
                    type: 'poll',
                    poll: [{ points: 30, content: 'Tabs' }, { points: 10, content: 'Spaces' }],
                    poll_votes_count: 40,
                })
            )
        );

        fixture.detectChanges();

        const options = element().querySelectorAll('.pollContent');
        expect(options.length).toBe(2);
        expect(options[0].textContent).toContain('Tabs');
        expect(options[0].textContent).toContain('30 points');
        expect((options[0].querySelector('.pollBar') as HTMLElement).style.width).toBe('75%');
    });

    it('should show an error message when the item fails to load', () => {
        api.fetchItemContent.and.returnValue(throwError(new Error('offline')));

        fixture.detectChanges();

        expect(component.errorMessage).toBe('Could not load item comments.');
        expect(element().querySelector('app-error-message')).not.toBeNull();
    });

    it('should navigate back when the back button is clicked', () => {
        api.fetchItemContent.and.returnValue(of(buildStory()));
        fixture.detectChanges();

        (element().querySelector('.back-button') as HTMLElement).click();

        expect(location.back).toHaveBeenCalled();
    });
});
