export function calcularResumen({ ventas = [], gastos = [], devoluciones = [], fondoInicial = 0 }) {
  const esValida = (v) => !v.noCobrar && !v.esVentaPreviaApertura
  let ventasEfectivo = 0
  let ventasTarjeta = 0
  let ventasTransferencia = 0
  let ventasNoCobrar = 0
  let ventasPrevias = 0

  ventas.forEach((v) => {
    if (v.esVentaPreviaApertura) ventasPrevias += v.total
    if (v.noCobrar) ventasNoCobrar += v.total
    if (!esValida(v)) return
    if (v.metodoPago === 'Efectivo') ventasEfectivo += v.total
    else if (v.metodoPago === 'Tarjeta') ventasTarjeta += v.total
    else if (v.metodoPago === 'Transferencia') ventasTransferencia += v.total
  })

  const gastosEfectivo = gastos
    .filter((g) => g.metodoPago === 'Efectivo')
    .reduce((acc, g) => acc + g.monto, 0)
  const devolucionesEfectivo = devoluciones
    .filter((d) => d.medioDevolucion === 'Efectivo_de_caja')
    .reduce((acc, d) => acc + d.monto, 0)

  return {
    ventas: {
      efectivo: ventasEfectivo,
      tarjeta: ventasTarjeta,
      transferencia: ventasTransferencia,
      cantidad: ventas.filter(esValida).length,
    },
    ventasNoCobrar,
    ventasPrevias,
    gastosEfectivo,
    devolucionesEfectivo,
    efectivoEsperado: fondoInicial + ventasEfectivo - gastosEfectivo - devolucionesEfectivo,
  }
}