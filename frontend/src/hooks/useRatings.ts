import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '../utils/api';
import { RatingItem, RatingsAggregate } from '../types';

export const useRatingsQuery = (page: number = 1, limit: number = 6) => {
  return useQuery({
    queryKey: ['ratings', page, limit],
    queryFn: async () => {
      const res = await customFetch(`/api/ratings?page=${page}&limit=${limit}`);
      return res as RatingsAggregate & { ratings: RatingItem[] };
    },
  });
};

export const useSubmitRatingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      subjectType: 'project' | 'contract';
      subjectId: string;
      projectId?: string;
      contractId?: string;
      stars: number;
      review: string;
    }) => {
      return customFetch('/api/ratings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export const useDeleteRatingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ratingId: string) => {
      return customFetch(`/api/ratings/${ratingId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
};
