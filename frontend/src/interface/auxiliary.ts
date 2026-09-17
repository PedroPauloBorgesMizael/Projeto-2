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

export interface TeamItem {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAuxiliaryPayload {
  name: string;
  description?: string;
  parentId?: string;
}
