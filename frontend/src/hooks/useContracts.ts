import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '../utils/api';
import { Contract } from '../types';

export const useContractsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const res = await customFetch('/api/contracts');
      return (res.contracts || []) as Contract[];
    },
    enabled,
    retry: 1,
  });
};

export const useAcceptContractMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contractId: string) => {
      return customFetch(`/api/contracts/${contractId}/accept`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};

export const useDeclineContractMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contractId: string) => {
      return customFetch(`/api/contracts/${contractId}/decline`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};

export const useApproveDeliverableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, deliverableId }: { contractId: string; deliverableId: string }) => {
      return customFetch(`/api/contracts/${contractId}/deliverables/${deliverableId}/approve`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};
