import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { pedidosRepartidor, cambiarEstadoPreparacion } from '../services/pedidos'
import { formatearPrecio, formatearFecha } from '../utils/formato'
import Button from '../components/ui/Button'

const COLOR_ESTADO = {
  Pendiente: 'bg-warning/15 text-warning',
  En_preparacion: 'bg-accent/10 text-accent',
  Enviado: 'bg-muted/15 text-muted',
  Entregado: 'bg-emerald-500/15 text-emerald-600',
  Cancelado: 'bg-danger/10 text-danger',
}

function radioClase(activo) {
  return `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm cursor-pointer ${
    activo ? 'bg-accent/10 font-semibold text-ink ring-1 ring-accent/40' : 'bg-input text-muted'
  }`
}

function nombreProducto(p) {
  if (p.producto) return p.producto.nombre
  if (p.combo) return p.combo.nombre
  if (p.esMitadYMitad && p.mitadYMitad) {
    const m = p.mitadYMitad
    return `Mitad: ${m.sabor1Producto?.nombre ?? '?'} + ${m.sabor2Producto?.nombre ?? '?'}`
  }
  return 'Producto'
}

function MisPedidosPage({ repartidorId }) {
  const { logout } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [entregar, setEntregar] = useState(null)
  const [cobro, setCobro] = useState('pendiente')
  const [metodoPago, setMetodoPago] = useState('Efectivo')
  const [guardando, setGuardando] = useState(false)

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
      setPedidos(await pedidosRepartidor(repartidorId))
    } catch (err) {
      manejarError(err)
    } finally {
      setCargando(false)
    }
  }, [repartidorId, manejarError])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(temporizador)
  }, [toast])

  const confirmarEntregado = async () => {
    setGuardando(true)
    setError('')
    try {
      const datos = { estadoPreparacion: 'Entregado' }
      if (cobro === 'noCobrar') datos.noCobrar = true
      if (cobro === 'pagado') {
        datos.estadoPago = 'Pagado'
        datos.metodoPago = metodoPago
      }
      await cambiarEstadoPreparacion(entregar.id, datos)
      setEntregar(null)
      setCobro('pendiente')
      setMetodoPago('Efectivo')
      const etiqueta = cobro === 'noCobrar' ? ' (No cobrar)' : cobro === 'pagado' ? ' (pagado)' : ' (pendiente de pago)'
      setToast(`Pedido #${entregar.id} entregado${etiqueta}`)
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const visibles = pedidos

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mis pedidos</h1>
          <p className="text-sm text-muted">Pedidos asignados a ti y su entrega</p>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {cargando ? (
          <p className="text-muted">Cargando pedidos…</p>
        ) : visibles.length === 0 ? (
          <p className="mt-12 text-center text-muted">Aún no tienes pedidos asignados.</p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {visibles.map((pedido) => (
              <li key={pedido.id}>
                <div className="rounded-3xl bg-card p-4 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ink">Pedido #{pedido.id}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COLOR_ESTADO[pedido.estadoPreparacion]}`}>
                          {pedido.estadoPreparacion.replaceAll('_', ' ')}
                        </span>
                        <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted">{pedido.tipo.replaceAll('_', ' ')}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{formatearFecha(pedido.fechaHoraCreacion)}</p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {pedido.cliente ? pedido.cliente.nombre : pedido.nombreClienteLibre ?? 'Cliente no identificado'}
                      </p>
                      {pedido.referencia && (
                        <p className="text-xs text-muted">Ref: {pedido.referencia.detalle}</p>
                      )}
                      {pedido.nota && (
                        <p className="mt-1 rounded-lg bg-warning/10 px-2 py-1 text-xs font-medium text-ink">
                          <span className="font-bold text-accent">Nota:</span> {pedido.nota}
                        </p>
                      )}
                    </div>
                    <p className="text-lg font-bold text-ink">{formatearPrecio(pedido.total)}</p>
                  </div>

                  {pedido.productos && pedido.productos.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {pedido.productos.map((p, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-input px-3 py-2 text-sm">
                          <span className="min-w-0 truncate text-ink">
                            <span className="font-semibold">{p.cantidad}×</span> {nombreProducto(p)}
                          </span>
                          <span className="shrink-0 font-semibold text-muted">{formatearPrecio(p.precioCongelado * p.cantidad)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {pedido.estadoPreparacion === 'Enviado' && (
                    <Button size="md" className="mt-4" onClick={() => { setEntregar(pedido); setCobro('pendiente'); setMetodoPago('Efectivo') }}>
                      Marcar entregado
                    </Button>
                  )}
                  {pedido.estadoPreparacion === 'Entregado' && pedido.estadoPago === 'Pagado' && (
                    <p className="mt-3 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      Entregado y cobrado
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {entregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold text-ink">Entregar pedido #{entregar.id}</h2>
            <p className="mt-2 text-sm text-muted">
              Total: <span className="font-bold text-ink">{formatearPrecio(entregar.total)}</span>. Confirma que entregaste el pedido al cliente.
            </p>
            {entregar.estadoPago !== 'Pagado' && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Estado de cobro</p>
                <label className={radioClase(cobro === 'pendiente')}>
                  <input type="radio" name="cobro" checked={cobro === 'pendiente'} onChange={() => setCobro('pendiente')} className="h-4 w-4 accent-accent" />
                  <span>Pendiente de pago</span>
                </label>
                <label className={radioClase(cobro === 'pagado')}>
                  <input type="radio" name="cobro" checked={cobro === 'pagado'} onChange={() => setCobro('pagado')} className="h-4 w-4 accent-accent" />
                  <span>Cobrar en entrega (queda pagado)</span>
                </label>
                {cobro === 'pagado' && (
                  <div className="flex gap-2 pl-7">
                    {['Efectivo', 'Transferencia', 'Otro'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMetodoPago(m)}
                        className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                          metodoPago === m ? 'bg-accent text-white' : 'bg-input text-muted'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                <label className={radioClase(cobro === 'noCobrar')}>
                  <input type="radio" name="cobro" checked={cobro === 'noCobrar'} onChange={() => setCobro('noCobrar')} className="h-4 w-4 accent-accent" />
                  <span>No cobrar (consumo interno)</span>
                </label>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={() => setEntregar(null)} disabled={guardando}>Cancelar</Button>
              <Button size="md" onClick={confirmarEntregado} disabled={guardando}>
                {guardando ? 'Guardando…' : 'Confirmar entrega'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  )
}

export default MisPedidosPage