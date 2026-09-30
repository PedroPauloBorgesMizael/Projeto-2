export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "MANAGER" | "ASSISTANT" | "TECHNICIAN" | "REQUESTER";
  locationId?: string | null;
  teamIds?: string[];
}
