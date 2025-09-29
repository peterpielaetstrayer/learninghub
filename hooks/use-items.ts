import { useState, useEffect } from 'react';
import { ItemWithAI } from '@/lib/db';

interface UseItemsOptions {
  searchQuery?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

interface UseItemsReturn {
  items: ItemWithAI[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

export function useItems(options: UseItemsOptions = {}): UseItemsReturn {
  const [items, setItems] = useState<ItemWithAI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { searchQuery, tag, limit = 50 } = options;

  const fetchItems = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (tag) params.append('tag', tag);
      params.append('limit', limit.toString());
      params.append('offset', reset ? '0' : offset.toString());

      const response = await fetch(`/api/items?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      
      if (reset) {
        setItems(data.items);
        setOffset(data.items.length);
      } else {
        setItems(prev => [...prev, ...data.items]);
        setOffset(prev => prev + data.items.length);
      }
      
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setOffset(0);
    fetchItems(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchItems(false);
    }
  };

  useEffect(() => {
    fetchItems(true);
  }, [searchQuery, tag]);

  return {
    items,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
  };
}
