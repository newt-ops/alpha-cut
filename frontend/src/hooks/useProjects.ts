import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '../utils/api';
import { Project } from '../types';

export const useProjectsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await customFetch('/api/projects');
      return (res.projects || []) as Project[];
    },
    enabled,
    retry: 1,
  });
};

export const useAcceptProposalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      return customFetch(`/api/projects/${projectId}/accept`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};

export const useDeclineProposalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      return customFetch(`/api/projects/${projectId}/decline`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};

export const useApproveDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      return customFetch(`/api/projects/${projectId}/approve`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
};

export const useRequestRevisionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, revisionNotes }: { projectId: string; revisionNotes: string }) => {
      return customFetch(`/api/projects/${projectId}/revision`, {
        method: 'POST',
        body: JSON.stringify({ revisionNotes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
