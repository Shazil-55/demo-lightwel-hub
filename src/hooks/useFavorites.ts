import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'proxima-hub-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }, []);

  // Get all favorites
  const getFavorites = useCallback((): string[] => {
    return favorites;
  }, [favorites]);

  // Add a favorite
  const addFavorite = useCallback((floorPlanId: string) => {
    setFavorites((prev) => {
      if (prev.includes(floorPlanId)) {
        return prev;
      }
      const updated = [...prev, floorPlanId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
      return updated;
    });
  }, []);

  // Remove a favorite
  const removeFavorite = useCallback((floorPlanId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((id) => id !== floorPlanId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error);
      }
      return updated;
    });
  }, []);

  // Check if a floor plan is favorited
  const isFavorite = useCallback(
    (floorPlanId: string): boolean => {
      return favorites.includes(floorPlanId);
    },
    [favorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (floorPlanId: string) => {
      if (isFavorite(floorPlanId)) {
        removeFavorite(floorPlanId);
      } else {
        addFavorite(floorPlanId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    getFavorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};

