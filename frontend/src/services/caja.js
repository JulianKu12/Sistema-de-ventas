import { api } from './api'

export async function obtenerEstadoCaja() {
  return api.get('/api/caja/estado')
}

export async function abrirCaja(fondoInicial) {
  return api.post('/api/caja/abrir', { fondoInicial })
}
