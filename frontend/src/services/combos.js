import { api } from './api'

export async function listarCombos() {
  return api.get('/api/combos')
}

export async function crearCombo(datos) {
  return api.post('/api/combos', datos)
}

export async function actualizarCombo(id, datos) {
  return api.patch(`/api/combos/${id}`, datos)
}

export async function desactivarCombo(id) {
  return api.patch(`/api/combos/${id}/desactivar`, {})
}

export async function eliminarCombo(id) {
  return api.del(`/api/combos/${id}`)
}
