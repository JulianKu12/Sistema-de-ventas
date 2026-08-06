import { api } from './api'

export async function crearVenta(payload) {
  return api.post('/api/ventas', payload)
}
