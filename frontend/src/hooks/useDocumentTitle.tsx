// hooks/useDocumentTitle.ts
import { useEffect, useRef } from 'react';

/**
 * Custom hook to set and manage document title
 * @param title - The title to set for the document
 * @param restoreOnUnmount - Whether to restore the previous title when component unmounts
 */
export const useDocumentTitle = (
  title: string, 
  restoreOnUnmount: boolean = false
): void => {
  const prevTitleRef = useRef<string>();

  useEffect(() => {
    // Store the previous title on first render
    if (prevTitleRef.current === undefined) {
      prevTitleRef.current = document.title;
    }

    // Set the new title
    document.title = title;

    // Cleanup function to restore previous title if needed
    return () => {
      if (restoreOnUnmount && prevTitleRef.current) {
        document.title = prevTitleRef.current;
      }
    };
  }, [title, restoreOnUnmount]);

  // Update the stored previous title when title changes
  useEffect(() => {
    return () => {
      prevTitleRef.current = document.title;
    };
  }, []);
};