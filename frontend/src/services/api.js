import { TOKEN_KEY } from '../context/authContext'

async function peticion(path, { method = 'GET', body } = {}) {
  const encabezados = { 'Content-Type': 'application/json' }
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  if (token) encabezados.Authorization = `Bearer ${token}`

  const respuesta = await fetch(path, {
    method,
    headers: encabezados,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!respuesta.ok) {
    let datos = null
    try {
      datos = await respuesta.json()
    } catch {
      // respuesta sin cuerpo JSON
    }
    const error = new Error(datos?.message || 'Error del servidor')
    error.status = respuesta.status
    error.datos = datos
    throw error
  }

  if (respuesta.status === 204) return null
  return respuesta.json()
}

export const api = {
  get: (path) => peticion(path),
  post: (path, body) => peticion(path, { method: 'POST', body }),
}
