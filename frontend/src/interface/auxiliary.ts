export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt?: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: CategoryItem[];
}

export interface LocationItem {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt?: string;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: LocationItem[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface TeamItem {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
  members?: TeamMember[];
  _count?: {
    members: number;
    tickets?: number;
  };
}

export interface CreateAuxiliaryPayload {
  name: string;
  description?: string;
  parentId?: string;
  memberIds?: string[];
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  memberIds?: string[];
}
