import { useEffect, useState } from 'react';
import type { Story } from '../models/story';
import type { User } from '../models/user';
import { fetchFeed, fetchItemContent, fetchUser } from './hnApi';

interface AsyncState<T> {
  data: T | undefined;
  errorMessage: string;
}

export function useFeed(feedType: string, page: number) {
  const [state, setState] = useState<AsyncState<Story[]>>({
    data: undefined,
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: undefined, errorMessage: '' });
    fetchFeed(feedType, page)
      .then((items) => {
        if (cancelled) return;
        setState({ data: items, errorMessage: '' });
        window.scrollTo(0, 0);
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          data: undefined,
          errorMessage: 'Could not load ' + feedType + ' stories.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [feedType, page]);

  return state;
}

export function useItem(id: number) {
  const [state, setState] = useState<AsyncState<Story>>({
    data: undefined,
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: undefined, errorMessage: '' });
    window.scrollTo(0, 0);
    fetchItemContent(id)
      .then((item) => {
        if (cancelled) return;
        setState({ data: item, errorMessage: '' });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ data: undefined, errorMessage: 'Could not load item comments.' });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}

export function useUser(id: string) {
  const [state, setState] = useState<AsyncState<User>>({
    data: undefined,
    errorMessage: '',
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: undefined, errorMessage: '' });
    fetchUser(id)
      .then((user) => {
        if (cancelled) return;
        setState({ data: user, errorMessage: '' });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ data: undefined, errorMessage: 'Could not load user ' + id + '.' });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
