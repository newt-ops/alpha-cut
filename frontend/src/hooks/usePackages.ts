import { useQuery } from '@tanstack/react-query';
import { customFetch } from '../utils/api';
import { PackageConfigItem } from '../types';

export const usePackagesQuery = () => {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await customFetch('/api/packages');
      return (res.configs || []) as PackageConfigItem[];
    },
  });
};

export const useExchangeRateQuery = () => {
  return useQuery({
    queryKey: ['exchangeRate'],
    queryFn: async () => {
      const res = await customFetch('/api/packages/exchange-rate');
      return res as { usdToEtb: number; etbToUsd: number };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};
