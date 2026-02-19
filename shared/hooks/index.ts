/**
 * Shared Custom Hooks Index
 * Centralized exports for all custom hooks
 */

// State management hooks
export { useLocalStorage, useLocalStorageFlag } from "./use-local-storage";
export { useToggle, useToggles, useTemporaryToggle } from "./use-toggle";
export { useAsyncOperation, useFormSubmit } from "./use-async-operation";

// UI interaction hooks
export { useDragAndDrop, useDragAndDropMultiple } from "./use-drag-and-drop";
export { useScrollDetection, useScrollPosition } from "./use-scroll-detection";

// List management hooks
export { usePersonList, useShareholderList } from "./use-person-list";
