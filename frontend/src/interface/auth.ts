export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  locationId?: string;
  location?: {
    id: string;
    name: string;
  } | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
