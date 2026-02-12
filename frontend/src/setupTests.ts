import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage with in-memory store and null for missing keys (matching Web API)
let __lsStore: Record<string, string> = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => (key in __lsStore ? __lsStore[key] : null)),
  setItem: jest.fn((key: string, value: string) => {
    __lsStore[key] = String(value);
  }),
  removeItem: jest.fn((key: string) => {
    delete __lsStore[key];
  }),
  clear: jest.fn(() => {
    __lsStore = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock IntersectionObserver
;(globalThis as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
