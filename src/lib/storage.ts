/**
 * Safe local storage utilities with validation and fallback support.
 * Handles JSON serialization, browser environment detection, and error recovery.
 */

/**
 * Type guard function for validating stored data.
 * Used to ensure runtime type safety when loading persisted data.
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Loads a value from local storage with validation and fallback.
 *
 * Safe for use in non-browser environments (returns fallback immediately).
 * Handles JSON parse errors gracefully.
 * Validates deserialized data with optional type guard.
 *
 * @template T - The type of the value being loaded
 * @param key - The storage key
 * @param fallback - Value to return if key doesn't exist, parse fails, or validation fails
 * @param validate - Optional type guard to validate the loaded value
 * @returns The loaded value if found and valid, otherwise the fallback
 *
 * @example
 * const prefs = loadStored('preferences', defaultPrefs, isPreferences);
 * const count = loadStored('count', 0);
 */
export function loadStored<T>(key: string, fallback: T, validate?: TypeGuard<T>): T {
  // Guard against non-browser environments
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    // Move localStorage access inside try to catch SecurityError
    if (typeof window.localStorage === 'undefined') {
      return fallback;
    }

    const stored = window.localStorage.getItem(key);

    // Key doesn't exist in storage
    if (stored === null) {
      return fallback;
    }

    // Parse JSON
    const parsed = JSON.parse(stored);

    // Validate if type guard provided
    if (validate && !validate(parsed)) {
      return fallback;
    }

    return parsed as T;
  } catch (error) {
    // SecurityError (private browsing), JSON parse error, storage quota exceeded, or other error
    return fallback;
  }
}

/**
 * Saves a value to local storage as JSON.
 *
 * Safe for use in non-browser environments (returns false immediately).
 * Handles JSON stringify errors gracefully.
 *
 * @template T - The type of the value being saved
 * @param key - The storage key
 * @param value - The value to save
 * @returns true if save was successful, false otherwise
 *
 * @example
 * const success = saveStored('preferences', newPrefs);
 */
export function saveStored<T>(key: string, value: T): boolean {
  // Guard against non-browser environments
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Move localStorage access inside try to catch SecurityError
    if (typeof window.localStorage === 'undefined') {
      return false;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // SecurityError (private browsing), JSON stringify error, storage quota exceeded, or other error
    return false;
  }
}

/**
 * Removes a value from local storage.
 *
 * Safe for use in non-browser environments (returns false immediately).
 *
 * @param key - The storage key to remove
 * @returns true if key existed and was removed, false otherwise
 *
 * @example
 * const wasRemoved = removeStored('preferences');
 */
export function removeStored(key: string): boolean {
  // Guard against non-browser environments
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Move localStorage access inside try to catch SecurityError
    if (typeof window.localStorage === 'undefined') {
      return false;
    }

    const hadKey = window.localStorage.getItem(key) !== null;
    window.localStorage.removeItem(key);
    return hadKey;
  } catch (error) {
    // SecurityError (private browsing) or other error
    return false;
  }
}

/**
 * Clears all values from local storage.
 *
 * WARNING: This is a dangerous operation that removes ALL stored data.
 * Prefer removeStored() for targeted removal of specific keys.
 * Only use this for complete reset scenarios where losing all stored state is intended.
 *
 * Safe for use in non-browser environments (returns false immediately).
 *
 * @returns true if storage was successfully cleared, false otherwise
 *
 * @example
 * // Only use in exceptional circumstances
 * clearAllStored();
 */
export function clearAllStored(): boolean {
  // Guard against non-browser environments
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Move localStorage access inside try to catch SecurityError
    if (typeof window.localStorage === 'undefined') {
      return false;
    }

    window.localStorage.clear();
    return true;
  } catch (error) {
    // SecurityError (private browsing) or other error
    return false;
  }
}
