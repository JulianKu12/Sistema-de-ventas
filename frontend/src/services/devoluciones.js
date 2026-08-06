import { api } from './api'

export async function listarDevoluciones() {
  return api.get('/api/devoluciones')
}

export async function crearDevolucion(datos) {
  return api.post('/api/devoluciones', datos)
}