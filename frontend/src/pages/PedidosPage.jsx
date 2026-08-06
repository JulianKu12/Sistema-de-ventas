import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { listarPedidos, cambiarEstadoPreparacion, cambiarEstadoPago, editarPedido } from '../services/pedidos'
import { estadoConfig } from '../services/config'
import { formatearPrecio, formatearFecha } from '../utils/formato'
import Button from '../components/ui/Button'
import EnviarPedidoModal from '../components/pedidos/EnviarPedidoModal'
import CancelarPedidoModal from '../components/pedidos/CancelarPedidoModal'
import EditarPedidoModal from '../components/pedidos/EditarPedidoModal'
import DetallePedidoModal from '../components/pedidos/DetallePedidoModal'

const TABS = [
  { clave: 'Todos', etiqueta: 'Todos' },
  { clave: 'Pendiente', etiqueta: 'Pendientes' },
  { clave: 'En_preparacion', etiqueta: 'En preparación' },
  { clave: 'Enviado', etiqueta: 'Enviados' },
  { clave: 'Entregado', etiqueta: 'Entregados' },
  { clave: 'Cancelado', etiqueta: 'Cancelados' },
]

const COLOR_ESTADO = {
  Pendiente: 'bg-warning/15 text-warning',
  En_preparacion: 'bg-accent/10 text-accent',
  Enviado: 'bg-muted/15 text-muted',
  Entregado: 'bg-emerald-500/15 text-emerald-600',
  Cancelado: 'bg-danger/10 text-danger',
}

function TarjetaResumen({ pedido, onAbrir }) {
  const cliente = pedido.cliente ? pedido.cliente.nombre : pedido.nombreClienteLibre ?? 'Cliente no identificado'
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex flex-col rounded-3xl bg-card p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-ink">#{pedido.id}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${COLOR_ESTADO[pedido.estadoPreparacion]}`}>
            {pedido.estadoPreparacion.replaceAll('_', ' ')}
          </span>
          <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted">
            {pedido.tipo.replaceAll('_', ' ')}
          </span>
        </div>
        <p className="text-lg font-bold text-ink">{formatearPrecio(pedido.total)}</p>
      </div>

      <p className="mt-2 text-sm font-semibold text-ink">{cliente}</p>
      <p className="mt-0.5 text-xs text-muted">
        {pedido.origen} · {formatearFecha(pedido.fechaHoraCreacion)}
      </p>
      {pedido.repartidor && <p className="mt-0.5 text-xs text-muted">Repartidor: {pedido.repartidor.nombre}</p>}

      {pedido.nota && (
        <p className="mt-2 truncate rounded-lg bg-warning/10 px-2 py-1 text-xs font-medium text-ink">
          <span className="font-bold text-accent">Nota:</span> {pedido.nota}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
        <span
          className={`text-xs font-semibold ${
            pedido.estadoPago === 'Pagado' ? 'text-emerald-600' : 'text-warning'
          }`}
        >
          {pedido.estadoPago === 'Pagado' ? 'Pagado' : 'Pendiente de pago'}
          {pedido.noCobrar ? ' · No cobrar' : ''}
        </span>
        <span className="text-xs font-semibold text-muted transition group-hover:text-accent">
          Ver detalles →
        </span>
      </div>
    </button>
  )
}

function PedidosPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [tab, setTab] = useState('Todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [config, setConfig] = useState(null)
  const [toast, setToast] = useState('')

  const [detalle, setDetalle] = useState(null)
  const [modalEnviar, setModalEnviar] = useState(null)
  const [modalCancelar, setModalCancelar] = useState(null)
  const [modalEditar, setModalEditar] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [pagarPedido, setPagarPedido] = useState(null)

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
      const params = tab === 'Todos' ? {} : { estadoPreparacion: tab }
      const [lista, cfg] = await Promise.all([listarPedidos(params), estadoConfig()])
      setPedidos(lista)
      setConfig(cfg)
    } catch (err) {
      manejarError(err)
    } finally {
      setCargando(false)
    }
  }, [tab, manejarError])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(temporizador)
  }, [toast])

  const avanzar = async (pedido, estadoPreparacion, extra = {}) => {
    setGuardando(true)
    setError('')
    try {
      await cambiarEstadoPreparacion(pedido.id, { estadoPreparacion, ...extra })
      setToast(`Pedido #${pedido.id} → ${estadoPreparacion.replaceAll('_', ' ')}`)
      setModalEnviar(null)
      setModalCancelar(null)
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const pagar = async (pedido) => {
    setGuardando(true)
    setError('')
    try {
      await cambiarEstadoPago(pedido.id, { estadoPago: 'Pagado' })
      setPagarPedido(null)
      setToast(`Pedido #${pedido.id} pagado (venta generada)`)
      cargar()
    } catch (err) {
      manejarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const editar = async (pedido, cambios) => {
    setGuardando(true)
    setError('')
    try {
      await editarPedido(pedido.id, cambios)
      setModalEditar(null)
      setToast(`Pedido #${pedido.id} editado y total recalculado`)
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
          <h1 className="text-2xl font-bold text-ink">Pedidos</h1>
          <p className="text-sm text-muted">Panel de pedidos y su preparación</p>
        </div>
        <Button size="md" onClick={() => navigate('/nuevo-pedido')}>Nuevo pedido</Button>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto border-b border-black/5 bg-card px-6 py-3">
        {TABS.map((t) => (
          <button
            key={t.clave}
            type="button"
            onClick={() => setTab(t.clave)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.clave ? 'bg-accent text-white' : 'bg-input text-muted'
            }`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {cargando ? (
          <p className="text-muted">Cargando pedidos…</p>
        ) : visibles.length === 0 ? (
          <p className="mt-12 text-center text-muted">No hay pedidos en esta vista.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((pedido) => (
              <TarjetaResumen key={pedido.id} pedido={pedido} onAbrir={() => setDetalle(pedido)} />
            ))}
          </div>
        )}
      </div>

      {detalle && (
        <DetallePedidoModal
          pedido={detalle}
          guardando={guardando}
          onCerrar={() => setDetalle(null)}
          onAvanzar={(p, estado) => {
            setDetalle(null)
            avanzar(p, estado)
          }}
          onEnviar={(p) => {
            setDetalle(null)
            setModalEnviar(p)
          }}
          onEditar={(p) => {
            setDetalle(null)
            setModalEditar(p)
          }}
          onCancelar={(p) => {
            setDetalle(null)
            setModalCancelar(p)
          }}
          onPagar={(p) => {
            setDetalle(null)
            setPagarPedido(p)
          }}
        />
      )}

      {modalEnviar && (
        <EnviarPedidoModal
          abierto
          guardando={guardando}
          pedido={modalEnviar}
          repartidorUnico={config?.repartidorUnico}
          onClose={() => setModalEnviar(null)}
          onEnviar={(repartidorId) => avanzar(modalEnviar, 'Enviado', repartidorId ? { repartidorId } : {})}
        />
      )}
      {modalCancelar && (
        <CancelarPedidoModal
          abierto
          pedido={modalCancelar}
          guardando={guardando}
          onClose={() => setModalCancelar(null)}
          onCancelar={(regresaAInventario) => avanzar(modalCancelar, 'Cancelado', { regresaAInventario })}
        />
      )}
      {modalEditar && (
        <EditarPedidoModal
          abierto
          pedido={modalEditar}
          guardando={guardando}
          onClose={() => setModalEditar(null)}
          onEditar={(cambios) => editar(modalEditar, cambios)}
        />
      )}
      {pagarPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold text-ink">Cobrar pedido #{pagarPedido.id}</h2>
            <p className="mt-2 text-sm text-muted">
              Total: <span className="font-bold text-ink">{formatearPrecio(pagarPedido.total)}</span> ({pagarPedido.metodoPago}). Se generará la venta y se descontará inventario.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={() => setPagarPedido(null)}>Cancelar</Button>
              <Button size="md" onClick={() => pagar(pagarPedido)} disabled={guardando}>
                {guardando ? 'Cobrando…' : 'Cobrar y marcar pagado'}
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

export default PedidosPage