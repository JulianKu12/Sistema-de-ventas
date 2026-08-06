import { api } from './api'

export async function estadoCaja() {
  return api.get('/api/caja/estado')
}

export const obtenerEstadoCaja = estadoCaja

export async function historialCaja() {
  return api.get('/api/caja/historial')
}

export async function abrirCaja(fondo) {
  const datos = typeof fondo === 'object' && fondo !== null ? fondo : { fondoInicial: fondo }
  return api.post('/api/caja/abrir', datos)
}

export async function cerrarCaja({ efectivoContado }) {
  return api.post('/api/caja/cerrar', { efectivoContado })
}