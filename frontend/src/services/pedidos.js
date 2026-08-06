import { api } from './api'

export async function listarPedidos(params = {}) {
  const query = new URLSearchParams(params).toString()
  return api.get(`/api/pedidos${query ? `?${query}` : ''}`)
}

export async function crearPedido(datos) {
  return api.post('/api/pedidos', datos)
}

export async function cambiarEstadoPreparacion(id, datos) {
  return api.patch(`/api/pedidos/${id}/estado-preparacion`, datos)
}

export async function cambiarEstadoPago(id, datos) {
  return api.patch(`/api/pedidos/${id}/estado-pago`, datos)
}