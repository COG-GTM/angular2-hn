import { Injectable, NgZone } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  undo?: () => void;
}

export const TOAST_DURATION_MS = 5000;

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  current: Toast | null = null;
  private nextId = 1;
  private timer: ReturnType<typeof setTimeout>;

  constructor(private zone: NgZone) {}

  show(message: string, undo?: () => void) {
    this.clearTimer();
    this.current = { id: this.nextId++, message, undo };
    // Run the timer outside Angular so the app still becomes "stable" (needed for service worker registration).
    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(() => this.zone.run(() => this.dismiss()), TOAST_DURATION_MS);
    });
  }

  undo() {
    const toast = this.current;
    this.dismiss();
    if (toast && toast.undo) {
      toast.undo();
    }
  }

  dismiss() {
    this.clearTimer();
    this.current = null;
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }
}
