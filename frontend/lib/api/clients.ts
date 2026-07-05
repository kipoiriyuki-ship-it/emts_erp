import apiClient from "./client"

export interface Client {
  id: number
  client_number: string
  name: string
  contact_person: string
  email: string
  phone: string
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  website: string | null
  status: 'active' | 'inactive' | 'blacklisted'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClientStatistics {
  total: number
  active: number
  inactive: number
  blacklisted: number
}

export const clientsApi = {
  getClients: (params?: { status?: string; search?: string; per_page?: number }) =>
    apiClient.get('/clients', { params }),

  getClient: (id: number) =>
    apiClient.get(`/clients/${id}`),

  createClient: (data: Partial<Client>) =>
    apiClient.post('/clients', data),

  updateClient: (id: number, data: Partial<Client>) =>
    apiClient.put(`/clients/${id}`, data),

  deleteClient: (id: number) =>
    apiClient.delete(`/clients/${id}`),

  getStatistics: () =>
    apiClient.get('/clients/statistics'),
}
