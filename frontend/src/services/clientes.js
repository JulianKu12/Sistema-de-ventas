import { api } from './api'

export async function listarClientes() {
  return api.get('/api/clientes')
}

export async function crearCliente(datos) {
  return api.post('/api/clientes', datos)
}

export async function actualizarCliente(id, datos) {
  return api.patch(`/api/clientes/${id}`, datos)
}

export async function eliminarCliente(id) {
  return api.del(`/api/clientes/${id}`)
}

export async function crearReferencia(clienteId, datos) {
  return api.post(`/api/clientes/${clienteId}/referencias`, datos)
}

export async function listarReferencias(clienteId) {
  return api.get(`/api/clientes/${clienteId}/referencias`)
}

export async function actualizarReferencia(referenciaId, datos) {
  return api.patch(`/api/clientes/referencias/${referenciaId}`, datos)
}

export async function eliminarReferencia(referenciaId) {
  return api.del(`/api/clientes/referencias/${referenciaId}`)
}