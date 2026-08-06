import { api } from './api'

export async function listarGastos(params = {}) {
  const query = new URLSearchParams(params).toString()
  return api.get(`/api/gastos${query ? `?${query}` : ''}`)
}

export async function crearGasto(datos) {
  return api.post('/api/gastos', datos)
}