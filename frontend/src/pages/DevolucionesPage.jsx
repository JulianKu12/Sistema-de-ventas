import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { crearDevolucion, listarDevoluciones } from '../services/devoluciones'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import DevolucionModal from '../components/devoluciones/DevolucionModal'
import { formatearPrecio, formatearFecha } from '../utils/formato'

const FILTROS = ['Todas', 'Producto_mal_estado', 'Pedido_incorrecto', 'Cliente_insatisfecho', 'Otro']

function DevolucionesPage() {
  const { logout } = useAuth()
  const [devoluciones, setDevoluciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState('Todas')

  const [modal, setModal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setDevoluciones(await listarDevoluciones())
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [logout])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(temporizador)
  }, [toast])

  const filtradas = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    return devoluciones.filter((d) => {
      const coincideMotivo = filtro === 'Todas' || d.motivo === filtro
      const coincideBusqueda =
        !termino ||
        d.ventaId.toString().includes(termino) ||
        (d.productos || []).some((p) => (p.producto ?? '').toLowerCase().includes(termino))
      return coincideMotivo && coincideBusqueda
    })
  }, [devoluciones, buscar, filtro])

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      const resultado = await crearDevolucion(datos)
      setModal(false)
      setToast(resultado.asociadaASiguienteDia ? 'Devolución registrada (se asociará al próximo corte)' : 'Devolución registrada')
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message ?? 'No se pudo registrar la devolución')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Devoluciones</h1>
          <p className="text-sm text-muted">{devoluciones.length} devolucione{devoluciones.length === 1 ? '' : 's'}</p>
        </div>
        <Button size="md" onClick={() => setModal(true)}>
          Registrar devolución
        </Button>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="space-y-3">
          <Input
            id="buscar-devolucion"
            type="search"
            placeholder="Buscar por venta o producto…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFiltro(m)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filtro === m ? 'bg-accent text-white' : 'bg-input text-muted'
                }`}
              >
                {m === 'Todas' ? 'Todas' : m.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <p className="text-muted">Cargando devoluciones…</p>
        ) : filtradas.length === 0 ? (
          <p className="mt-12 text-center text-muted">
            {buscar || filtro !== 'Todas' ? 'Sin resultados para el filtro actual.' : 'No hay devoluciones registradas.'}
          </p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {filtradas.map((d) => (
              <li key={d.id} className="rounded-2xl bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink">Venta #{d.ventaId}</p>
                      <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-semibold text-muted">
                        {d.motivo.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      Devuelto por: {d.medioDevolucion.replaceAll('_', ' ')} · Pagó con {d.medioPagoOriginal}
                    </p>
                    <p className="text-xs text-muted">{formatearFecha(d.fechaHora)}</p>
                    <p className="mt-1 text-xs font-medium text-warning">{d.regresaAInventario ? 'Regresó a inventario' : 'No regresó a inventario'}</p>
                    {d.productos && d.productos.length > 0 && (
                      <p className="mt-1 text-xs text-muted">
                        {d.productos.map((p) => p.producto ?? 'N/D').filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-xl font-bold text-danger">{formatearPrecio(d.monto)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <DevolucionModal
          abierto={modal}
          guardando={guardando}
          onClose={() => setModal(false)}
          onGuardar={guardar}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  )
}

export default DevolucionesPage