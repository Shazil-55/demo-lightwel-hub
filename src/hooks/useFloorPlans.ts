/**
 * React Query hook for fetching floor plans
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllFloorPlans } from '../services/api';
import { GetAllFloorPlansResponse } from '../types/api';

export const useFloorPlans = (
  projectSlugs: string[],
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  }
): UseQueryResult<GetAllFloorPlansResponse, Error> => {
  return useQuery({
    queryKey: ['floorPlans', projectSlugs],
    queryFn: () => getAllFloorPlans({ projectSlugs }),
    enabled: options?.enabled !== false && projectSlugs.length > 0,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
  });
};

