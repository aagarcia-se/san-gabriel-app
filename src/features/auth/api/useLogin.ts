import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from './authApi';
import { useAuthStore } from '../store/authStore';
import { decodeJwt } from '@/shared/lib/jwt';
import { getDefaultRoute } from '@/shared/lib/routing';
import type { ApiError } from '@/shared/api/httpClient';
import type { JwtPayload, LoginRequest, LoginResponse } from '../types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      const token = data.authUser; // el token plano firmado por el backend
      const { usuario, permisos } = decodeJwt<JwtPayload>(token);
      setSession(token, usuario, permisos);
      navigate(getDefaultRoute(permisos), { replace: true });
    },
  });
}
