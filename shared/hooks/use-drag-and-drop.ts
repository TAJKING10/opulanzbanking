/**
 * Custom hook for drag-and-drop file handling
 * Provides reusable drag-and-drop functionality for file upload components
 */

import * as React from "react";

interface UseDragAndDropReturn {
  isDragging: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, onFile: (file: File) => void) => void;
}

/**
 * Hook for handling drag-and-drop file uploads
 * @returns Object containing drag state and event handlers
 */
export function useDragAndDrop(): UseDragAndDropReturn {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e?: React.DragEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent, onFile: (file: File) => void) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFile(files[0]);
      }
    },
    []
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Hook for handling drag-and-drop with multiple files
 * @returns Object containing drag state and event handlers for multiple files
 */
export function useDragAndDropMultiple() {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e?: React.DragEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent, onFiles: (files: FileList) => void) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    []
  );

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
