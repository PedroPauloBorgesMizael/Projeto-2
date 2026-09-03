import { api } from './api';
import type { AuthResponse } from '../interface/auth';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};
