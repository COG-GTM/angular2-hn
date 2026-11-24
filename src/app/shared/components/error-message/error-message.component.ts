import { Component, OnInit, input } from '@angular/core';

@Component({
    selector: 'app-error-message',
    templateUrl: './error-message.component.html',
    styleUrls: ['./error-message.component.scss']
})
export class ErrorMessageComponent implements OnInit {
  readonly message = input<string>(undefined);

  constructor() { }

  ngOnInit() {
  }

}
