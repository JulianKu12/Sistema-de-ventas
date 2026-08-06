import { api } from './api'

export async function estadoConfig() {
  return api.get('/api/config')
}