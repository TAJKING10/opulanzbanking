/**
 * Person List Management Hook
 * Reusable hook for managing arrays of people (directors, UBOs, shareholders, etc.)
 * Eliminates ~150 lines of duplicate array manipulation code
 */

import { useState, useCallback } from 'react';

/**
 * Generic person list management hook
 * @template T - Type of person object (must have an id field)
 * @param initialValue - Initial array of items
 * @returns Object with items array and CRUD methods
 */
export function usePersonList<T extends { id: string }>(initialValue: T[] = []) {
  const [items, setItems] = useState<T[]>(initialValue);

  /**
   * Add a new item to the list
   */
  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  /**
   * Remove an item by ID
   */
  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
  }, []);

  /**
   * Update specific fields of an item by ID
   */
  const update = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  /**
   * Update a single field of an item
   */
  const updateField = useCallback(<K extends keyof T>(id: string, field: K, value: T[K]) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }, []);

  /**
   * Replace an existing item or add if not found
   */
  const upsert = useCallback((item: T) => {
    setItems(prev => {
      const index = prev.findIndex(p => p.id === item.id);
      if (index >= 0) {
        const newItems = [...prev];
        newItems[index] = item;
        return newItems;
      }
      return [...prev, item];
    });
  }, []);

  /**
   * Clear all items
   */
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Replace entire list
   */
  const replace = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  /**
   * Find item by ID
   */
  const findById = useCallback((id: string): T | undefined => {
    return items.find(p => p.id === id);
  }, [items]);

  /**
   * Get count of items
   */
  const count = items.length;

  /**
   * Check if list is empty
   */
  const isEmpty = items.length === 0;

  return {
    items,
    add,
    remove,
    update,
    updateField,
    upsert,
    clear,
    replace,
    findById,
    count,
    isEmpty,
    setItems, // Direct setter for advanced use cases
  };
}

/**
 * Hook specifically for managing shareholders with ownership validation
 */
export function useShareholderList<T extends { id: string; sharePercent: number }>(
  initialValue: T[] = []
) {
  const personList = usePersonList(initialValue);

  /**
   * Calculate total ownership percentage
   */
  const totalSharePercent = personList.items.reduce(
    (sum, shareholder) => sum + shareholder.sharePercent,
    0
  );

  /**
   * Check if ownership adds up to 100%
   */
  const isOwnershipValid = totalSharePercent === 100;

  /**
   * Check if ownership is complete (allows some tolerance)
   */
  const isOwnershipComplete = Math.abs(totalSharePercent - 100) < 0.01;

  return {
    ...personList,
    totalSharePercent,
    isOwnershipValid,
    isOwnershipComplete,
  };
}

/**
 * Example usage:
 * 
 * const directors = usePersonList<Director>([]);
 * directors.add({ id: '1', firstName: 'John', lastName: 'Doe', ... });
 * directors.update('1', { firstName: 'Jane' });
 * directors.remove('1');
 * 
 * const shareholders = useShareholderList<Shareholder>([]);
 * shareholders.add({ id: '1', sharePercent: 50, ... });
 * console.log(shareholders.totalSharePercent); // 50
 * console.log(shareholders.isOwnershipValid); // false (not 100%)
 */
