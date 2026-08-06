import { api } from './api'

export async function listarGastos() {
  return api.get('/api/gastos')
}

export async function crearGasto(datos) {
  return api.post('/api/gastos', datos)
}