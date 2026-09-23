import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarDataDashboard } from './dashboardApi';

export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.dashboard.data(),
    queryFn: consultarDataDashboard,
    select: (data) => data.dataDashboard,
  });
}