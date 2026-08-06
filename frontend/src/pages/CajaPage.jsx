import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { abrirCaja, cerrarCaja, estadoCaja, historialCaja } from '../services/caja'
import { listarVentas } from '../services/ventas'
import { listarGastos } from '../services/gastos'
import { listarDevoluciones } from '../services/devoluciones'
import { calcularResumen } from '../utils/resumenCaja'
import { formatearFecha, formatearPrecio } from '../utils/formato'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ResumenCaja from '../components/caja/ResumenCaja'
import AbrirCajaModal from '../components/caja/AbrirCajaModal'
import CerrarCajaModal from '../components/caja/CerrarCajaModal'
import CorteDetalleModal from '../components/caja/CorteDetalleModal'

function Insignia({ abierta }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${abierta ? 'bg-emerald-500/15 text-emerald-600' : 'bg-muted/15 text-muted'}`}>
      {abierta ? 'Caja abierta' : 'Caja cerrada'}
    </span>
  )
}

function ResultadoCierreModal({ abierto, resultado, onClose }) {
  const pedidos = resultado?.pedidosPendientesPago?.cantidad ?? 0
  const entregadosPendientes = resultado?.pedidosEntregadosPendientesPago ?? null
  const resumen = resultado
    ? {
        ventas: { ...resultado.ventas, cantidad: 0 },
        gastosEfectivo: resultado.gastosEfectivo,
        devolucionesEfectivo: resultado.devolucionesEfectivoCaja,
        efectivoEsperado: resultado.cierre.efectivoEsperado,
      }
    : null

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Caja cerrada"
      footer={<Button onClick={onClose}>Entendido</Button>}
    >
      {resumen && (
        <div className="space-y-4">
          <ResumenCaja
            resumen={resumen}
            contado={resultado.cierre.efectivoContado}
            diferencia={resultado.cierre.diferencia}
          />

          {pedidos > 0 && (
            <div className="rounded-2xl bg-warning/15 px-4 py-3 text-sm text-warning">
              {pedidos} pedido{pedidos === 1 ? '' : 's'} siguen Pendiente_pago al cierre.
            </div>
          )}
          {entregadosPendientes && entregadosPendientes.cantidad > 0 && (
            <div className="rounded-2xl bg-warning/15 px-4 py-3 text-sm text-warning">
              {entregadosPendientes.cantidad} pedido{entregadosPendientes.cantidad === 1 ? '' : 's'} entregado
              {entregadosPendientes.cantidad === 1 ? '' : 's'} sin pagar todavía —{' '}
              {formatearPrecio(entregadosPendientes.monto)}.
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

function CajaPage() {
  const { logout } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [estado, setEstado] = useState(null)
  const [historial, setHistorial] = useState([])
  const [resumen, setResumen] = useState(null)
  const [resumenCargando, setResumenCargando] = useState(false)

  const [modalAbrir, setModalAbrir] = useState(false)
  const [modalCerrar, setModalCerrar] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [detalleDia, setDetalleDia] = useState(null)
  const [toast, setToast] = useState('')

  const manejarError = useCallback(
    (err) => {
      if (err.status === 401) return logout()
      setError(err.message)
    },
    [logout]
  )

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [e, his] = await Promise.all([estadoCaja(), historialCaja()])
      setEstado(e)
      setHistorial(his)
    } catch (err) {
      manejarError(err)
    } finally {
      setCargando(false)
    }
  }, [manejarError])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!estado?.abierta || !estado.dia) {
      setResumen(null)
      return
    }
    let activo = true
    setResumenCargando(true)
    ;(async () => {
      try {
        const [ventas, gastos, devoluciones] = await Promise.all([
          listarVentas({ diaOperativoId: estado.dia.id }),
          listarGastos({ diaOperativoId: estado.dia.id }),
          listarDevoluciones(),
        ])
        if (!activo) return
        const devolucionesDelDia = devoluciones.filter((d) => d.diaOperativoId === estado.dia.id)
        setResumen(
          calcularResumen({
            ventas,
            gastos,
            devoluciones: devolucionesDelDia,
            fondoInicial: estado.dia.fondoInicial,
          })
        )
      } catch (err) {
        if (activo) manejarError(err)
      } finally {
        if (activo) setResumenCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [estado, manejarError])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(temporizador)
  }, [toast])

  const abrir = async ({ fondoInicial, ventasPrevias }) => {
    setGuardando(true)
    setError('')
    try {
      await abrirCaja(ventasPrevias && ventasPrevias.length > 0 ? { fondoInicial, ventasPrevias } : { fondoInicial })
      setModalAbrir(false)
      setToast('Caja abierta correctamente')
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const cerrar = async ({ efectivoContado }) => {
    setGuardando(true)
    setError('')
    try {
      const resultadoCierre = await cerrarCaja({ efectivoContado })
      setModalCerrar(false)
      setResultado(resultadoCierre)
      setToast('Caja cerrada correctamente')
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Caja</h1>
            <p className="text-sm text-muted">Apertura, cierre e historial del corte</p>
          </div>
        </div>
        <Insignia abierta={estado?.abierta} />
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso" className="shrink-0">✕</button>
          <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {cargando ? (
          <p className="text-muted">Cargando…</p>
        ) : (
          <>
            {estado?.abierta ? (
              <section className="mx-auto max-w-3xl space-y-4">
                <div className="rounded-3xl bg-card p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-muted">Día operativo en curso</p>
                      <p className="text-lg font-bold text-ink">{formatearFecha(estado.dia.fechaApertura)}</p>
                    </div>
                    <p className="text-ink">Fondo inicial: <span className="font-bold">{formatearPrecio(estado.dia.fondoInicial)}</span></p>
                  </div>
                </div>

                <div className="rounded-3xl bg-card p-6 shadow-card">
                  <h2 className="mb-4 text-lg font-bold text-ink">Resumen en vivo</h2>
                  {resumenCargando ? (
                    <p className="text-muted">Calculando resumen…</p>
                  ) : resumen ? (
                    <ResumenCaja resumen={resumen} />
                  ) : null}
                </div>

                <Button variant="danger" className="w-full" onClick={() => setModalCerrar(true)}>
                  Cerrar caja
                </Button>
              </section>
            ) : (
              <section className="mx-auto max-w-3xl space-y-4">
                <div className="rounded-3xl bg-card p-5 text-center shadow-card">
                  <p className="font-semibold text-ink">No hay caja abierta</p>
                  <p className="mt-1 text-sm text-muted">Para registrar cortes de caja, abre un día operativo.</p>
                  <Button className="mt-4" onClick={() => setModalAbrir(true)}>
                    Abrir caja
                  </Button>
                </div>
              </section>
            )}

            <section className="mx-auto max-w-3xl">
              <h2 className="mb-3 text-lg font-bold text-ink">Historial de cortes</h2>
              {historial.length === 0 ? (
                <p className="rounded-2xl bg-card p-5 text-center text-sm text-muted shadow-card">
                  Aún no hay cortes registrados.
                </p>
              ) : (
                <ul className="space-y-3">
                  {historial.map((dia) => (
                    <li key={dia.id}>
                      <button
                        type="button"
                        onClick={() => setDetalleDia(dia)}
                        className="flex w-full items-center justify-between gap-4 rounded-2xl bg-card p-4 text-left shadow-card transition active:scale-[0.99] active:bg-muted/10"
                      >
                        <div>
                          <p className="text-sm text-muted">{formatearFecha(dia.fechaApertura)}</p>
                          <p className="font-semibold text-ink">{formatearPrecio(dia.efectivoContado)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${dia.diferencia >= 0 ? 'bg-emerald-500/15 text-emerald-600' : 'bg-danger/15 text-danger'}`}>
                          {dia.diferencia >= 0 ? '+' : ''}
                          {formatearPrecio(dia.diferencia)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>

      {modalAbrir && (
        <AbrirCajaModal abierto guardando={guardando} onClose={() => setModalAbrir(false)} onAbrir={abrir} />
      )}
      {modalCerrar && resumen && (
        <CerrarCajaModal
          abierto
          guardando={guardando}
          efectivoEsperado={resumen.efectivoEsperado}
          onClose={() => setModalCerrar(false)}
          onCerrar={cerrar}
        />
      )}
      {resultado && (
        <ResultadoCierreModal abierto onClose={() => setResultado(null)} resultado={resultado} />
      )}
      {detalleDia && (
        <CorteDetalleModal dia={detalleDia} onClose={() => setDetalleDia(null)} onError={manejarError} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  )
}

export default CajaPage