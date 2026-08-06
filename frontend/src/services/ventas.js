import { api } from './api'

export async function crearVenta(payload) {
  return api.post('/api/ventas', payload)
}

export async function listarVentas(params = {}) {
  const query = new URLSearchParams(params).toString()
  return api.get(`/api/ventas${query ? `?${query}` : ''}`)
}
