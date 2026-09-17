export type UserRole = 'ADMIN' | 'MANAGER' | 'ASSISTANT' | 'TECHNICIAN' | 'REQUESTER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  locationId?: string;
  location?: {
    id: string;
    name: string;
  };
}

export interface PaginatedUsersResponse {
  data: UserItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  locationId?: string;
}

export interface UserFilterParams {
  name?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}
