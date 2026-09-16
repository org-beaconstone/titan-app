import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadStored, saveStored, removeStored, clearAllStored } from './storage';

// Mock localStorage for testing
const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
};

describe('storage utilities', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('saveStored', () => {
    it('saves a value to localStorage', () => {
      const success = saveStored('test-key', { value: 123 });
      expect(success).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('{"value":123}');
    });

    it('saves strings', () => {
      const success = saveStored('string-key', 'hello');
      expect(success).toBe(true);
      expect(localStorage.getItem('string-key')).toBe('"hello"');
    });

    it('saves numbers', () => {
      const success = saveStored('number-key', 42);
      expect(success).toBe(true);
      expect(localStorage.getItem('number-key')).toBe('42');
    });

    it('saves arrays', () => {
      const success = saveStored('array-key', [1, 2, 3]);
      expect(success).toBe(true);
      expect(localStorage.getItem('array-key')).toBe('[1,2,3]');
    });

    it('saves complex objects', () => {
      const obj = {
        name: 'test',
        nested: { deep: true },
        array: [1, 2, 3],
      };
      const success = saveStored('complex-key', obj);
      expect(success).toBe(true);
      expect(JSON.parse(localStorage.getItem('complex-key')!)).toEqual(obj);
    });

    it('returns false if localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const success = saveStored('key', 'value');
      expect(success).toBe(false);

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    });
  });

  describe('loadStored', () => {
    it('loads a saved value from localStorage', () => {
      localStorage.setItem('test-key', JSON.stringify({ value: 123 }));
      const result = loadStored('test-key', { value: 0 });
      expect(result).toEqual({ value: 123 });
    });

    it('returns fallback if key does not exist', () => {
      const fallback = { value: 42 };
      const result = loadStored('nonexistent-key', fallback);
      expect(result).toEqual(fallback);
    });

    it('returns fallback if JSON is invalid', () => {
      localStorage.setItem('invalid-json', 'not valid json');
      const fallback = { value: 0 };
      const result = loadStored('invalid-json', fallback);
      expect(result).toEqual(fallback);
    });

    it('validates loaded value with type guard', () => {
      const isObject = (v: unknown): v is { value: number } => {
        return typeof v === 'object' && v !== null && 'value' in v;
      };

      localStorage.setItem('valid', JSON.stringify({ value: 123 }));
      const result = loadStored('valid', { value: 0 }, isObject);
      expect(result).toEqual({ value: 123 });
    });

    it('returns fallback if validation fails', () => {
      const isNumber = (v: unknown): v is number => typeof v === 'number';

      localStorage.setItem('string-value', JSON.stringify('hello'));
      const result = loadStored('string-value', 42, isNumber);
      expect(result).toBe(42);
    });

    it('returns fallback if localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const fallback = { value: 99 };
      const result = loadStored('key', fallback);
      expect(result).toEqual(fallback);

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    });

    it('loads strings correctly', () => {
      localStorage.setItem('string-key', JSON.stringify('hello world'));
      const result = loadStored('string-key', 'default');
      expect(result).toBe('hello world');
    });

    it('loads numbers correctly', () => {
      localStorage.setItem('number-key', JSON.stringify(123));
      const result = loadStored('number-key', 0);
      expect(result).toBe(123);
    });

    it('loads arrays correctly', () => {
      const array = [1, 2, 3];
      localStorage.setItem('array-key', JSON.stringify(array));
      const result = loadStored('array-key', []);
      expect(result).toEqual(array);
    });
  });

  describe('removeStored', () => {
    it('removes a stored value', () => {
      localStorage.setItem('test-key', 'value');
      const removed = removeStored('test-key');
      expect(removed).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('returns false if key does not exist', () => {
      const removed = removeStored('nonexistent-key');
      expect(removed).toBe(false);
    });

    it('returns false if localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const removed = removeStored('key');
      expect(removed).toBe(false);

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    });
  });

  describe('clearAllStored', () => {
    it('clears all localStorage values', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      const success = clearAllStored();
      expect(success).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('returns true even if storage is already empty', () => {
      const success = clearAllStored();
      expect(success).toBe(true);
    });

    it('returns false if localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const success = clearAllStored();
      expect(success).toBe(false);

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    });
  });

  describe('SecurityError handling', () => {
    it('handles SecurityError when accessing localStorage.getItem', () => {
      // Mock a getter that throws SecurityError (like in private browsing)
      const blockedStorage = {
        get getItem() {
          throw new Error('SecurityError: localStorage is not accessible');
        },
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        get length() {
          return 0;
        },
        key: () => null,
      };

      Object.defineProperty(window, 'localStorage', {
        value: blockedStorage,
        writable: true,
      });

      const result = loadStored('key', 'fallback');
      expect(result).toBe('fallback');

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    });

    it('handles SecurityError when accessing localStorage.setItem', () => {
      const blockedStorage = {
        getItem: () => null,
        get setItem() {
          throw new Error('SecurityError: localStorage is not accessible');
        },
        removeItem: () => {},
        clear: () => {},
        get length() {
          return 0;
        },
        key: () => null,
      };

      Object.defineProperty(window, 'localStorage', {
        value: blockedStorage,
        writable: true,
      });

      const success = saveStored('key', 'value');
      expect(success).toBe(false);

      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    });
  });

  describe('round-trip storage', () => {
    it('preserves complex object through save and load', () => {
      const preferences = {
        displayName: 'John Doe',
        email: 'john@example.com',
        theme: 'dark' as const,
        emailDigest: true,
      };

      saveStored('prefs', preferences);
      const loaded = loadStored('prefs', preferences);

      expect(loaded).toEqual(preferences);
    });

    it('handles round-trip with validation', () => {
      interface Prefs {
        displayName: string;
        theme: 'light' | 'dark';
      }

      const isPrefs = (v: unknown): v is Prefs => {
        return (
          typeof v === 'object' &&
          v !== null &&
          'displayName' in v &&
          'theme' in v &&
          (v.theme === 'light' || v.theme === 'dark')
        );
      };

      const prefs: Prefs = { displayName: 'Test', theme: 'dark' };
      saveStored('prefs', prefs);
      const loaded = loadStored('prefs', prefs, isPrefs);

      expect(loaded).toEqual(prefs);
    });
  });

  describe('edge cases', () => {
    it('handles null values', () => {
      saveStored('null-key', null);
      const result = loadStored('null-key', 'default');
      expect(result).toBeNull();
    });

    it('handles undefined by converting to null in JSON', () => {
      // JSON.stringify converts undefined to undefined, which is not valid JSON
      // But when undefined appears in an object, it's omitted
      const obj = { value: undefined };
      saveStored('key', obj);
      const result = loadStored<{ value?: undefined }>('key', {});
      // JSON omits undefined properties
      expect(result).toEqual({});
    });

    it('handles very large strings', () => {
      const largeString = 'x'.repeat(10000);
      saveStored('large', largeString);
      const result = loadStored('large', 'fallback');
      expect(result).toBe(largeString);
    });

    it('handles special characters', () => {
      const special = {
        emoji: '🚀',
        unicode: '\\n\\t',
        quotes: '"\'',
      };
      saveStored('special', special);
      const result = loadStored('special', {});
      expect(result).toEqual(special);
    });

    it('handles empty objects', () => {
      saveStored('empty', {});
      const result = loadStored('empty', { default: true });
      expect(result).toEqual({});
    });

    it('handles empty arrays', () => {
      saveStored('empty-array', []);
      const result = loadStored('empty-array', ['default']);
      expect(result).toEqual([]);
    });
  });
});
