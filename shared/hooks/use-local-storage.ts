/**
 * Custom hook for managing localStorage with React state
 * Provides a simple API for storing and retrieving values from localStorage
 */

import * as React from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        setStoredValue((currentValue) => {
          const valueToStore =
            value instanceof Function ? value(currentValue) : value;
          
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          
          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * Custom hook for simple boolean localStorage flags (like dismissed banners)
 */
export function useLocalStorageFlag(
  key: string,
  initialValue = false
): [boolean, () => void, () => void] {
  const [value, setValue] = useLocalStorage(key, initialValue);

  const setTrue = React.useCallback(() => setValue(true), [setValue]);
  const setFalse = React.useCallback(() => setValue(false), [setValue]);

  return [value, setTrue, setFalse];
}
