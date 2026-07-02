import { Component, Input } from '@angular/core';

@Component({
    standalone: false,
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent {
  @Input() message: string;

  constructor() { }

}
