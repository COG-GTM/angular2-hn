import { NgZone } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';

import { TOAST_DURATION_MS, ToastService } from './toast.service';

describe('ToastService', () => {
  // Created inside each fakeAsync test so NgZone forks the fake-async zone.
  const create = () => new ToastService(new NgZone({ enableLongStackTrace: false }));

  it('dismisses the toast after 5 seconds', fakeAsync(() => {
    const service = create();
    service.show('Saved');
    expect(service.current.message).toBe('Saved');
    tick(TOAST_DURATION_MS - 1);
    expect(service.current).not.toBeNull();
    tick(1);
    expect(service.current).toBeNull();
  }));

  it('runs the undo action once and dismisses', fakeAsync(() => {
    const service = create();
    const undo = jasmine.createSpy('undo');
    service.show('Removed', undo);
    service.undo();
    service.undo();
    expect(undo).toHaveBeenCalledTimes(1);
    expect(service.current).toBeNull();
  }));

  it('replaces the current toast and restarts the timer', fakeAsync(() => {
    const service = create();
    service.show('Saved');
    tick(3000);
    service.show('Removed');
    tick(3000);
    expect(service.current.message).toBe('Removed');
    tick(2000);
    expect(service.current).toBeNull();
  }));
});
