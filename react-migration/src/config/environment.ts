export const environment = {
  production: import.meta.env.VITE_APP_ENV === 'production',
  apiUrl: import.meta.env.VITE_API_URL || 'https://hacker-news.firebaseio.com/v0'
};
