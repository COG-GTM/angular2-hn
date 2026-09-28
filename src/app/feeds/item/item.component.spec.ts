import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SettingsService } from '../../shared/services/settings.service';
import { Settings } from '../../shared/models/settings';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
    let fixture: ComponentFixture<ItemComponent>;
    let settings: Settings;

    const element = (): HTMLElement => fixture.nativeElement;

    function render(item: Partial<Story>) {
        fixture = TestBed.createComponent(ItemComponent);
        fixture.componentInstance.item = ({
            id: 1,
            title: 'A story',
            points: 99,
            user: 'dang',
            time_ago: '2 hours ago',
            type: 'story',
            url: 'https://example.com/post',
            domain: 'example.com',
            comments_count: 3,
            ...item,
        } as unknown) as Story;
        fixture.detectChanges();
    }

    beforeEach(() => {
        settings = {
            showSettings: false,
            openLinkInNewTab: false,
            theme: 'default',
            titleFontSize: '18',
            listSpacing: '6',
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, PipesModule],
            declarations: [ItemComponent],
            providers: [{ provide: SettingsService, useValue: { settings } }],
        });
    });

    it('should link external stories to their url and show the domain', () => {
        render({});

        const title = element().querySelector('a.title') as HTMLAnchorElement;
        expect(fixture.componentInstance.hasUrl).toBe(true);
        expect(title.getAttribute('href')).toBe('https://example.com/post');
        expect(title.getAttribute('target')).toBeNull();
        expect(element().querySelector('.domain').textContent).toContain('(example.com)');
    });

    it('should open external links in a new tab when the setting is enabled', () => {
        settings.openLinkInNewTab = true;
        render({});

        const title = element().querySelector('a.title');
        expect(title.getAttribute('target')).toBe('_blank');
        expect(title.getAttribute('rel')).toBe('noopener');
    });

    it('should link self posts to the item details page', () => {
        render({ id: 55, url: 'item?id=55' });

        expect(fixture.componentInstance.hasUrl).toBe(false);
        expect(element().querySelector('a.title').getAttribute('href')).toBe('/item/55');
    });

    it('should apply the font size and list spacing settings', () => {
        render({});

        const title = element().querySelector('a.title') as HTMLElement;
        const wrapper = element().firstElementChild as HTMLElement;
        expect(title.style.fontSize).toBe('18px');
        expect(wrapper.style.marginBottom).toBe('6px');
    });

    it('should show author, points and comment count for stories', () => {
        render({});

        const text = element().textContent;
        expect(text).toContain('99 points by');
        expect(text).toContain('dang');
        expect(text).toContain('3 comments');
    });

    it('should hide author and comment details for jobs', () => {
        render({ type: 'job' });

        const text = element().textContent;
        expect(text).not.toContain('points by');
        expect(text).not.toContain('comments');
        expect(text).toContain('2 hours ago');
    });
});
