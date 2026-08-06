import { api } from './api'

export async function listarEmpleados() {
  return api.get('/api/empleados')
}

export async function crearEmpleado(datos) {
  return api.post('/api/empleados', datos)
}

export async function actualizarEmpleado(id, datos) {
  return api.patch(`/api/empleados/${id}`, datos)
}