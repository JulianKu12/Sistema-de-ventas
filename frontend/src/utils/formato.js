const formatoPrecio = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export function formatearPrecio(valor) {
  return formatoPrecio.format(valor)
}

export function formatearFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-MX')
}
