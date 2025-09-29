import { useState } from 'react';

interface ProcessItemOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useProcessing() {
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const processItem = async (itemId: string, options: ProcessItemOptions = {}) => {
    if (processing.has(itemId)) return;

    try {
      setProcessing(prev => new Set(prev).add(itemId));

      const response = await fetch(`/api/process/${itemId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process item');
      }

      const data = await response.json();
      options.onSuccess?.(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      options.onError?.(errorMessage);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const isProcessing = (itemId: string) => processing.has(itemId);

  return {
    processItem,
    isProcessing,
  };
}
