import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'app-error-message',
    templateUrl: './error-message.component.html',
    styleUrl: './error-message.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
    readonly message = input('Something went wrong.');
}
