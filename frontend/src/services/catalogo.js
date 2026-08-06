import { api } from './api'

export async function listarProductos() {
  return api.get('/api/productos?estado=Activo&disponibleHoy=true')
}

export async function listarCombos() {
  return api.get('/api/combos')
}

export async function listarIngredientes() {
  return api.get('/api/ingredientes')
}
