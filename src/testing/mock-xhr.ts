// Installs a fake XMLHttpRequest that serves the shared fixtures, so the real
// HackerNewsAPIService (which fetches via `unfetch` -> XHR) can be exercised in
// unit tests without hitting the network. Returns fixtures identical to those
// used by the React MSW mocks and the Playwright parity suite.
import { resolveFixture } from './fixtures';

class FakeXMLHttpRequest {
  method = 'GET';
  url = '';
  status = 0;
  statusText = 'OK';
  responseText = '';
  response = '';
  responseURL = '';
  withCredentials = false;
  onload: (() => void) | null = null;
  onerror: ((err?: any) => void) | null = null;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader() {
    /* no-op */
  }

  getAllResponseHeaders() {
    return '';
  }

  send() {
    setTimeout(() => {
      let parsed: URL;
      try {
        parsed = new URL(this.url);
      } catch {
        this.status = 500;
        if (this.onerror) this.onerror(new Error('bad url'));
        return;
      }
      const page = parsed.searchParams.get('page') || undefined;
      const data = resolveFixture(parsed.pathname, page);
      if (data === null) {
        this.status = 500;
        this.statusText = 'Internal Server Error';
        if (this.onerror) this.onerror(new Error('fixture not found: ' + this.url));
        return;
      }
      this.status = 200;
      this.responseURL = this.url;
      this.responseText = JSON.stringify(data);
      this.response = this.responseText;
      if (this.onload) this.onload();
    }, 0);
  }
}

let original: any;

export function installFixtureXhr() {
  original = (window as any).XMLHttpRequest;
  (window as any).XMLHttpRequest = FakeXMLHttpRequest as any;
}

export function uninstallFixtureXhr() {
  (window as any).XMLHttpRequest = original;
}
