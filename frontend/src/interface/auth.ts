export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  locationId?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
