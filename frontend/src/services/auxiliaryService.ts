import { api } from './api';
import type {
  CategoryItem,
  CreateAuxiliaryPayload,
  LocationItem,
  TeamItem
} from '../interface/auxiliary';

export const auxiliaryService = {
  // Categorias
  async listCategories(): Promise<CategoryItem[]> {
    const response = await api.get<CategoryItem[]>('/categories');
    return response.data;
  },

  async createCategory(data: CreateAuxiliaryPayload): Promise<CategoryItem> {
    const response = await api.post<CategoryItem>('/categories', data);
    return response.data;
  },

  // Localizações
  async listLocations(): Promise<LocationItem[]> {
    const response = await api.get<LocationItem[]>('/locations');
    return response.data;
  },

  async createLocation(data: CreateAuxiliaryPayload): Promise<LocationItem> {
    const response = await api.post<LocationItem>('/locations', data);
    return response.data;
  },

  // Equipes
  async listTeams(): Promise<TeamItem[]> {
    const response = await api.get<TeamItem[]>('/teams');
    return response.data;
  },

  async createTeam(data: CreateAuxiliaryPayload): Promise<TeamItem> {
    const response = await api.post<TeamItem>('/teams', data);
    return response.data;
  }
};
