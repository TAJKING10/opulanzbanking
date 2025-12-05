/**
 * Custom hook for managing async operations (form submissions, API calls, etc.)
 * Provides loading, error, and success states with automatic state management
 */

import * as React from "react";

interface UseAsyncOperationState<T = unknown> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: T | null;
}

interface UseAsyncOperationActions<T = unknown> {
  execute: (asyncFn: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
}

type UseAsyncOperationReturn<T = unknown> = UseAsyncOperationState<T> &
  UseAsyncOperationActions<T>;

/**
 * Hook for managing async operations with automatic loading/error/success states
 * @returns Object with state and control functions
 */
export function useAsyncOperation<T = unknown>(): UseAsyncOperationReturn<T> {
  const [state, setState] = React.useState<UseAsyncOperationState<T>>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: null,
  });

  const execute = React.useCallback(async (asyncFn: () => Promise<T>) => {
    setState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
    });

    try {
      const result = await asyncFn();
      setState({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        data: result,
      });
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: errorObj,
        data: null,
      });
      return undefined;
    }
  }, []);

  const reset = React.useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
    });
  }, []);

  const setData = React.useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  const setError = React.useCallback((error: Error | null) => {
    setState((prev) => ({
      ...prev,
      isError: !!error,
      error,
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Simplified hook specifically for form submissions
 * @returns Object with submission state and submit function
 */
export function useFormSubmit<T = unknown>() {
  const { isLoading: isSubmitting, isSuccess, isError, error, execute, reset } =
    useAsyncOperation<T>();

  const submit = React.useCallback(
    async (submitFn: () => Promise<T>) => {
      return execute(submitFn);
    },
    [execute]
  );

  return {
    isSubmitting,
    isSuccess,
    isError,
    error,
    submit,
    reset,
  };
}
