import { api } from './api'

export async function consultarStock() {
  return api.get('/api/inventario/stock')
}

export async function registrarEntrada(datos) {
  return api.post('/api/inventario/entrada', datos)
}

export async function registrarAjuste(datos) {
  return api.post('/api/inventario/ajuste', datos)
}