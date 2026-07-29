import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of } from 'rxjs';

export type LoadState<T> =
    | { status: 'loading' }
    | { status: 'loaded'; value: T }
    | { status: 'error'; error: unknown };

/** Turns a data observable into a signal that also carries loading and error states. */
export function toLoadState<T>(source: Observable<T>): Signal<LoadState<T>> {
    return toSignal<LoadState<T>, LoadState<T>>(
        source.pipe(
            map((value) => ({ status: 'loaded', value }) as LoadState<T>),
            catchError((error: unknown) => of({ status: 'error', error } as LoadState<T>))
        ),
        { initialValue: { status: 'loading' } }
    );
}

export function loadedValue<T>(state: LoadState<T>): T | null {
    return state.status === 'loaded' ? state.value : null;
}

export function isLoading(...states: LoadState<unknown>[]): boolean {
    return states.some((state) => state.status === 'loading');
}

export function hasError(...states: LoadState<unknown>[]): boolean {
    return states.some((state) => state.status === 'error');
}
