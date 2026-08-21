import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from './authApi';
import { useAuthStore } from '../store/authStore';
import { decodeJwt } from '@/shared/lib/jwt';
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
      // "/inicio" es de acceso libre — aterrizaje seguro sin importar
      // qué permisos tenga el rol.
      navigate('/inicio', { replace: true });
    },
  });
}
