import { api } from './api'

export async function listarClientes() {
  return api.get('/api/clientes')
}

export async function crearCliente(datos) {
  return api.post('/api/clientes', datos)
}