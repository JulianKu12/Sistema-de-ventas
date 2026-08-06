import { useEffect, useState } from 'react'
import { listarVentas } from '../../services/ventas'
import { listarGastos } from '../../services/gastos'
import { listarDevoluciones } from '../../services/devoluciones'
import { calcularResumen } from '../../utils/resumenCaja'
import { formatearFecha, formatearPrecio } from '../../utils/formato'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ResumenCaja from './ResumenCaja'

function CorteDetalleModal({ dia, onClose, onError }) {
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!dia) return
    let activo = true
    setCargando(true)
    ;(async () => {
      try {
        const [ventas, gastos, devoluciones] = await Promise.all([
          listarVentas({ diaOperativoId: dia.id }),
          listarGastos({ diaOperativoId: dia.id }),
          listarDevoluciones(),
        ])
        if (!activo) return
        const devolucionesDelDia = devoluciones.filter((d) => d.diaOperativoId === dia.id)
        setResumen(
          calcularResumen({
            ventas,
            gastos,
            devoluciones: devolucionesDelDia,
            fondoInicial: dia.fondoInicial,
          })
        )
      } catch (err) {
        if (!activo) return
        onError?.(err)
      } finally {
        if (activo) setCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [dia, onError])

  return (
    <Modal
      open={!!dia}
      onClose={onClose}
      title="Detalle del corte"
      footer={
        <Button variant="secondary" size="md" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {dia && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-input p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Apertura</span>
              <span className="font-medium text-ink">{formatearFecha(dia.fechaApertura)}</span>
            </div>
            {dia.fechaCierre && (
              <div className="mt-1 flex justify-between">
                <span className="text-muted">Cierre</span>
                <span className="font-medium text-ink">{formatearFecha(dia.fechaCierre)}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between">
              <span className="text-muted">Fondo inicial</span>
              <span className="font-medium text-ink">{formatearPrecio(dia.fondoInicial)}</span>
            </div>
          </div>

          {cargando ? (
            <p className="text-center text-muted">Cargando detalle…</p>
          ) : resumen ? (
            <>
              <ResumenCaja
                resumen={resumen}
                contado={dia.efectivoContado}
                diferencia={dia.diferencia}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-input px-4 py-3">
                  <p className="text-xs font-medium text-muted">Efectivo contado</p>
                  <p className="text-lg font-bold text-ink">{formatearPrecio(dia.efectivoContado)}</p>
                </div>
                <div className="rounded-2xl bg-input px-4 py-3">
                  <p className="text-xs font-medium text-muted">Diferencia</p>
                  <p className={`text-lg font-bold ${dia.diferencia >= 0 ? 'text-emerald-600' : 'text-danger'}`}>
                    {dia.diferencia >= 0 ? '+' : ''}
                    {formatearPrecio(dia.diferencia)}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </Modal>
  )
}

export default CorteDetalleModal