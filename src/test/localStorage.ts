/**
 * Node 25 ships its own Web Storage global, which shadows jsdom's `localStorage`
 * and throws unless the process was started with `--localstorage-file`.
 * Tests get this in-memory implementation instead.
 */
class MemoryStorage implements Storage {
  #entries = new Map<string, string>();

  get length(): number {
    return this.#entries.size;
  }

  clear(): void {
    this.#entries.clear();
  }

  getItem(key: string): string | null {
    return this.#entries.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.#entries.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.#entries.delete(key);
  }

  setItem(key: string, value: string): void {
    this.#entries.set(key, String(value));
  }
}

export function installMemoryLocalStorage() {
  const storage = new MemoryStorage();
  const descriptor: PropertyDescriptor = { value: storage, configurable: true, writable: true };

  Object.defineProperty(globalThis, 'localStorage', descriptor);
  Object.defineProperty(window, 'localStorage', descriptor);

  return storage;
}
