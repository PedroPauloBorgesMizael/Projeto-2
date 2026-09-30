import { api } from './api';
import type {
  CreateUserPayload,
  PaginatedUsersResponse,
  UpdateUserPayload,
  UserFilterParams,
  UserItem,
  UserStatus
} from '../interface/user';

export const userService = {
  async listUsers(params?: UserFilterParams): Promise<PaginatedUsersResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.name) queryParams.append('name', params.name);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response = await api.get<PaginatedUsersResponse>(url);
    return response.data;
  },

  async createUser(data: CreateUserPayload): Promise<UserItem> {
    const response = await api.post<UserItem>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserPayload): Promise<UserItem> {
    const response = await api.put<UserItem>(`/users/${id}`, data);
    return response.data;
  },

  async changeStatus(id: string, status: UserStatus): Promise<UserItem> {
    const response = await api.patch<UserItem>(`/users/${id}/status`, { status });
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};
