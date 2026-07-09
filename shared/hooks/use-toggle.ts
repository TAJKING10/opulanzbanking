/**
 * Custom hooks for boolean state management
 * Simplifies common boolean toggle patterns
 */

import * as React from "react";

/**
 * Hook for managing boolean state with helpful utility functions
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, setTrue, setFalse, toggle]
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = React.useState(initialValue);

  const setTrue = React.useCallback(() => setValue(true), []);
  const setFalse = React.useCallback(() => setValue(false), []);
  const toggle = React.useCallback(() => setValue((v) => !v), []);

  return [value, setTrue, setFalse, toggle];
}

/**
 * Hook for managing multiple boolean flags
 * @param initialValues - Object with initial boolean values
 * @returns Object with current values and toggle functions
 */
export function useToggles<T extends Record<string, boolean>>(initialValues: T) {
  const [values, setValues] = React.useState<T>(initialValues);

  const toggles = React.useMemo(() => {
    const result: Record<string, {
      value: boolean;
      setTrue: () => void;
      setFalse: () => void;
      toggle: () => void;
    }> = {};

    Object.keys(initialValues).forEach((key) => {
      result[key] = {
        value: values[key],
        setTrue: () => setValues((prev) => ({ ...prev, [key]: true })),
        setFalse: () => setValues((prev) => ({ ...prev, [key]: false })),
        toggle: () => setValues((prev) => ({ ...prev, [key]: !prev[key] })),
      };
    });

    return result;
  }, [values, initialValues]);

  return toggles;
}

/**
 * Hook for boolean state that auto-resets after a delay
 * Useful for temporary UI states like success messages
 * @param duration - Duration in ms before auto-reset (default: 3000)
 * @returns Tuple of [value, setTrue, setFalse]
 */
export function useTemporaryToggle(duration = 3000): [boolean, () => void, () => void] {
  const [value, setValue] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const setTrue = React.useCallback(() => {
    setValue(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setValue(false);
    }, duration);
  }, [duration]);

  const setFalse = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setValue(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setTrue, setFalse];
}
