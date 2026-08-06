import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { crearGasto, listarGastos } from '../services/gastos'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import GastoModal from '../components/gastos/GastoModal'
import { formatearPrecio, formatearFecha } from '../utils/formato'

const ESTILOS_CATEGORIA = {
  Insumos: 'bg-accent/10 text-accent',
  Servicios: 'bg-warning/20 text-warning',
  Sueldos: 'bg-muted/20 text-muted',
  Otro: 'bg-muted/10 text-muted',
}

const FILTROS_CATEGORIA = ['Todas', 'Insumos', 'Servicios', 'Sueldos', 'Otro']

function FilaGasto({ gasto }) {
  return (
    <li className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-ink">{gasto.concepto}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ESTILOS_CATEGORIA[gasto.categoria] ?? ''}`}>
              {gasto.categoria}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{gasto.metodoPago}</p>
          <p className="text-xs text-muted">{formatearFecha(gasto.fechaHora)}</p>
          {gasto.diaOperativoId == null && (
            <p className="mt-1 text-xs font-medium text-warning">Sin día operativo (se asociará al próximo corte)</p>
          )}
        </div>
        <p className="shrink-0 text-xl font-bold text-ink">{formatearPrecio(gasto.monto)}</p>
      </div>
    </li>
  )
}

function GastosPage() {
  const { logout } = useAuth()
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')

  const [modal, setModal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setGastos(await listarGastos())
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
    const temporizador = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(temporizador)
  }, [toast])

  const filtrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    return gastos.filter((g) => {
      const coincideConcepto = !termino || g.concepto.toLowerCase().includes(termino)
      const coincideCategoria = filtroCategoria === 'Todas' || g.categoria === filtroCategoria
      return coincideConcepto && coincideCategoria
    })
  }, [gastos, buscar, filtroCategoria])

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      const resultado = await crearGasto(datos)
      setToast(resultado.asociadoASiguienteDia ? 'Gasto registrado (se asociará al próximo corte)' : 'Gasto registrado')
      setModal(false)
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Gastos</h1>
          <p className="text-sm text-muted">
            {gastos.length} gasto{gastos.length === 1 ? '' : 's'} registrados
          </p>
        </div>
        <Button size="md" onClick={() => setModal(true)}>
          Registrar gasto
        </Button>
      </header>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 space-y-3">
          <Input
            id="buscar-gasto"
            type="search"
            placeholder="Buscar gasto…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="flex rounded-2xl bg-input p-1">
            {FILTROS_CATEGORIA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFiltroCategoria(c)}
                className={`flex-1 rounded-xl px-2 py-2 text-sm font-semibold transition ${
                  filtroCategoria === c ? 'bg-card text-ink shadow-card' : 'text-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <p className="text-muted">Cargando gastos…</p>
        ) : filtrados.length === 0 ? (
          <p className="mt-12 text-center text-muted">
            {buscar || filtroCategoria !== 'Todas' ? 'Sin resultados para el filtro actual.' : 'No hay gastos registrados.'}
          </p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {filtrados.map((gasto) => (
              <FilaGasto key={gasto.id} gasto={gasto} />
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <GastoModal
          abierto
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

export default GastosPage