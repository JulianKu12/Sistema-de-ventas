import { api } from './api'

export async function estadoConfig() {
  return api.get('/api/config')
}

export async function actualizarConfig(datos) {
  return api.patch('/api/config', datos)
}