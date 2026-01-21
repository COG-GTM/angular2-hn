import { Component, OnInit } from '@angular/core';
import { TrackerService } from '../shared/services/tracker.service';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  styleUrls: ['./tracker.component.scss']
})
export class TrackerComponent implements OnInit {
  metrics: any;

  constructor(private trackerService: TrackerService) {}

  ngOnInit() {
    this.trackerService.trackPageView('metrics');
    this.loadMetrics();
  }

  loadMetrics() {
    this.metrics = this.trackerService.getMetrics();
  }

  clearData() {
    if (confirm('Are you sure you want to clear all tracking data?')) {
      this.trackerService.clearData();
      this.loadMetrics();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  formatHour(hour: number): string {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}${suffix}`;
  }
}
