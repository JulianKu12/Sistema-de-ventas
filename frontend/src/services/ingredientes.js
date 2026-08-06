import { api } from './api'

export async function listarIngredientes() {
  return api.get('/api/ingredientes')
}

export async function crearIngrediente(datos) {
  return api.post('/api/ingredientes', datos)
}

export async function actualizarIngrediente(id, datos) {
  return api.patch(`/api/ingredientes/${id}`, datos)
}

export async function desactivarIngrediente(id, opcion) {
  return api.patch(`/api/ingredientes/${id}/desactivar`, opcion ? { opcion } : {})
}

export async function eliminarIngrediente(id) {
  return api.del(`/api/ingredientes/${id}`)
}
