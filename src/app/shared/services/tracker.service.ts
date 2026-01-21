import { Injectable } from '@angular/core';

export interface PageView {
  page: string;
  timestamp: number;
  duration?: number;
}

export interface StoryClick {
  storyId: number;
  title: string;
  timestamp: number;
}

export interface UserView {
  userId: string;
  timestamp: number;
}

export interface TrackerData {
  pageViews: PageView[];
  storyClicks: StoryClick[];
  userViews: UserView[];
  sessionCount: number;
  firstVisit: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private readonly STORAGE_KEY = 'hn_tracker_data';
  private currentPageStart: number | null = null;
  private currentPage: string | null = null;

  constructor() {
    this.incrementSession();
  }

  private getData(): TrackerData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      pageViews: [],
      storyClicks: [],
      userViews: [],
      sessionCount: 0,
      firstVisit: Date.now()
    };
  }

  private saveData(data: TrackerData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private incrementSession(): void {
    const data = this.getData();
    data.sessionCount++;
    this.saveData(data);
  }

  trackPageView(page: string): void {
    this.endCurrentPageView();
    this.currentPage = page;
    this.currentPageStart = Date.now();

    const data = this.getData();
    data.pageViews.push({
      page,
      timestamp: this.currentPageStart
    });
    this.saveData(data);
  }

  endCurrentPageView(): void {
    if (this.currentPage && this.currentPageStart) {
      const duration = Date.now() - this.currentPageStart;
      const data = this.getData();
      const lastView = data.pageViews.find(
        pv => pv.page === this.currentPage && pv.timestamp === this.currentPageStart
      );
      if (lastView) {
        lastView.duration = duration;
        this.saveData(data);
      }
    }
    this.currentPage = null;
    this.currentPageStart = null;
  }

  trackStoryClick(storyId: number, title: string): void {
    const data = this.getData();
    data.storyClicks.push({
      storyId,
      title,
      timestamp: Date.now()
    });
    this.saveData(data);
  }

  trackUserView(userId: string): void {
    const data = this.getData();
    data.userViews.push({
      userId,
      timestamp: Date.now()
    });
    this.saveData(data);
  }

  getMetrics() {
    const data = this.getData();

    const pageViewsByType = this.aggregateByKey(data.pageViews, 'page');
    const storyClickCounts = this.aggregateStoryClicks(data.storyClicks);
    const userViewCounts = this.aggregateByKey(data.userViews, 'userId');
    const activityByHour = this.aggregateByHour(data.pageViews);
    const avgTimeByPage = this.calculateAvgTime(data.pageViews);

    return {
      totalPageViews: data.pageViews.length,
      totalStoryClicks: data.storyClicks.length,
      totalUserViews: data.userViews.length,
      sessionCount: data.sessionCount,
      firstVisit: data.firstVisit,
      pageViewsByType: this.sortByCount(pageViewsByType),
      topStories: storyClickCounts.slice(0, 10),
      topUsers: this.sortByCount(userViewCounts).slice(0, 10),
      activityByHour,
      avgTimeByPage
    };
  }

  private aggregateByKey(items: any[], key: string): { name: string; count: number }[] {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const val = item[key];
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  private aggregateStoryClicks(clicks: StoryClick[]): { storyId: number; title: string; count: number }[] {
    const counts: Record<number, { title: string; count: number }> = {};
    clicks.forEach(click => {
      if (!counts[click.storyId]) {
        counts[click.storyId] = { title: click.title, count: 0 };
      }
      counts[click.storyId].count++;
    });
    return Object.entries(counts)
      .map(([id, data]) => ({ storyId: +id, title: data.title, count: data.count }))
      .sort((a, b) => b.count - a.count);
  }

  private aggregateByHour(pageViews: PageView[]): { hour: number; count: number }[] {
    const counts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) counts[i] = 0;
    pageViews.forEach(pv => {
      const hour = new Date(pv.timestamp).getHours();
      counts[hour]++;
    });
    return Object.entries(counts).map(([hour, count]) => ({ hour: +hour, count }));
  }

  private calculateAvgTime(pageViews: PageView[]): { page: string; avgTime: number }[] {
    const times: Record<string, number[]> = {};
    pageViews.forEach(pv => {
      if (pv.duration) {
        if (!times[pv.page]) times[pv.page] = [];
        times[pv.page].push(pv.duration);
      }
    });
    return Object.entries(times).map(([page, durations]) => ({
      page,
      avgTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000)
    }));
  }

  private sortByCount(items: { name: string; count: number }[]): { name: string; count: number }[] {
    return items.sort((a, b) => b.count - a.count);
  }

  clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
