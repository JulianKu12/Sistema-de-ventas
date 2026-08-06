import { api } from './api'

export async function listarProductos() {
  return api.get('/api/productos')
}

export async function crearProducto(datos) {
  return api.post('/api/productos', datos)
}

export async function actualizarProducto(id, datos) {
  return api.patch(`/api/productos/${id}`, datos)
}

export async function cambiarDisponibilidad(id, disponibleHoy) {
  return api.patch(`/api/productos/${id}/disponibilidad`, { disponibleHoy })
}

export async function desactivarProducto(id) {
  return api.patch(`/api/productos/${id}/desactivar`, {})
}

export async function eliminarProducto(id) {
  return api.del(`/api/productos/${id}`)
}
