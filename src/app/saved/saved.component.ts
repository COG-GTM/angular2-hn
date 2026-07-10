import { Component, OnInit } from '@angular/core';

import { Story } from '../shared/models/story';
import { SavedService } from '../shared/services/saved.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit {
  items: Story[] = [];

  constructor(private _savedService: SavedService) { }

  ngOnInit() {
    this.items = this._savedService.getSaved();
  }
}
