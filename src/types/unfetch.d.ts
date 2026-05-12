declare module 'unfetch' {
  const unfetch: (url: string, options?: RequestInit) => Promise<Response>;
  export default unfetch;
}
