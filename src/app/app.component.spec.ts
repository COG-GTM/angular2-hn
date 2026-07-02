import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SettingsService } from './shared/services/settings.service';

describe('AppComponent', () => {
    beforeEach(async () => {
        (window as any).ga = () => {};
        await TestBed.configureTestingModule({
            declarations: [AppComponent],
            imports: [RouterModule.forRoot([]), CoreModule],
            providers: [SettingsService],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should have settings', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.settings).toBeDefined();
    });
});
