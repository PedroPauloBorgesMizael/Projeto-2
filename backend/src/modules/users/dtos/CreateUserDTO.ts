export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "ASSISTANT" | "TECHNICIAN" | "REQUESTER";
  locationId?: string;
  teamIds?: string[];
}