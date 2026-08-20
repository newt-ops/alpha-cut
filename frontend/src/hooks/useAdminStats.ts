import { useQuery } from '@tanstack/react-query';
import { customFetch } from '../utils/api';
import { AdminStats } from '../types';

export const useAdminStatsQuery = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await customFetch('/api/admin/stats');
      return (res.stats || {}) as AdminStats;
    },
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes in admin
  });
};
