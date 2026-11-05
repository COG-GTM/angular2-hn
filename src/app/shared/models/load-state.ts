export interface LoadState<T> {
  data: T | null;
  error: string;
}

export const loading = <T>(): LoadState<T> => ({ data: null, error: '' });
