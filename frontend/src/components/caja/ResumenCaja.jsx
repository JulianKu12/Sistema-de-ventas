import { formatearPrecio } from '../../utils/formato'

function Estadistica({ etiqueta, valor, resaltada = false }) {
  return (
    <div className="rounded-2xl bg-input px-4 py-3">
      <p className="text-xs font-medium text-muted">{etiqueta}</p>
      <p className={`mt-0.5 truncate text-lg font-bold ${resaltada ? 'text-accent' : 'text-ink'}`}>
        {formatearPrecio(valor)}
      </p>
    </div>
  )
}

export default function ResumenCaja({ resumen, contado, diferencia }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Estadistica etiqueta="Ventas efectivo" valor={resumen.ventas.efectivo} />
        <Estadistica etiqueta="Ventas tarjeta" valor={resumen.ventas.tarjeta} />
        <Estadistica etiqueta="Ventas transf." valor={resumen.ventas.transferencia} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Estadistica etiqueta="Gastos (efectivo)" valor={resumen.gastosEfectivo} />
        <Estadistica etiqueta="Dev. de caja" valor={resumen.devolucionesEfectivo} />
      </div>

      <div className="rounded-3xl bg-accent/10 p-5 text-center">
        <p className="text-sm font-semibold text-accent">Efectivo esperado</p>
        <p className="mt-1 text-3xl font-extrabold text-accent">
          {formatearPrecio(resumen.efectivoEsperado)}
        </p>
        <p className="mt-1 text-xs text-muted">{resumen.ventas.cantidad} ventas</p>
      </div>

      {typeof contado === 'number' && typeof diferencia === 'number' && (
        <div className={`rounded-3xl p-4 ${diferencia >= 0 ? 'bg-emerald-500/10' : 'bg-danger/10'}`}>
          <div className="flex justify-between">
            <p className="text-sm text-muted">Efectivo contado</p>
            <p className="text-sm font-semibold text-ink">{formatearPrecio(contado)}</p>
          </div>
          <div className="mt-2 flex justify-between">
            <p className="text-sm text-muted">Diferencia</p>
            <p className={`text-lg font-bold ${diferencia >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
              {diferencia >= 0 ? '+' : ''}
              {formatearPrecio(diferencia)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}