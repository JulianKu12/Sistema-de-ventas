import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import {
  actualizarCombo,
  crearCombo,
  desactivarCombo,
  eliminarCombo,
  listarCombos,
} from '../services/combos'
import { listarProductos } from '../services/productos'
import Button from '../components/ui/Button'
import ConfirmarModal from '../components/ui/ConfirmarModal'
import Input from '../components/ui/Input'
import ComboModal from '../components/combos/ComboModal'
import { formatearPrecio } from '../utils/formato'

const ESTILOS_ESTADO = {
  Activo: 'bg-accent/10 text-accent',
  Suspendido: 'bg-warning/20 text-warning',
  Inactivo: 'bg-muted/20 text-muted',
}

function FilaCombo({ combo, onEditar, onDesactivar, onEliminar }) {
  const sumaRegular = (combo.productos ?? []).reduce(
    (acc, cp) => acc + cp.producto.precio * cp.cantidad,
    0,
  )
  const ahorro = sumaRegular - combo.precioEspecial
  return (
    <li className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-ink">{combo.nombre}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ESTILOS_ESTADO[combo.estado]}`}>
              {combo.estado}
            </span>
          </div>
          <p className="mt-0.5 text-lg font-bold text-ink">{formatearPrecio(combo.precioEspecial)}</p>
          {ahorro > 0 && <p className="text-sm text-muted">Ahorro: {formatearPrecio(ahorro)}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(combo.productos ?? []).map((cp) => (
              <span key={cp.id} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {cp.cantidad}× {cp.producto.nombre}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="md" variant="secondary" onClick={onEditar}>
          Editar
        </Button>
        {combo.estado === 'Inactivo' ? (
          <Button size="md" variant="dangerSoft" onClick={onEliminar}>
            Eliminar
          </Button>
        ) : (
          <Button size="md" variant="dangerSoft" onClick={onDesactivar}>
            Desactivar
          </Button>
        )}
      </div>
    </li>
  )
}

function CombosPage() {
  const { logout } = useAuth()
  const [combos, setCombos] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')

  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [accionCargando, setAccionCargando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [listaCombos, listaProductos] = await Promise.all([listarCombos(), listarProductos()])
      setCombos(listaCombos)
      setProductos(listaProductos)
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
    const temporizador = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(temporizador)
  }, [toast])

  const filtrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    if (!termino) return combos
    return combos.filter((c) => c.nombre.toLowerCase().includes(termino))
  }, [combos, buscar])

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      if (modal === 'nuevo') {
        const resultado = await crearCombo(datos)
        setToast(resultado.aviso?.mensaje ?? 'Combo creado')
      } else {
        const resultado = await actualizarCombo(modal.id, datos)
        setToast(resultado.aviso?.mensaje ?? 'Combo actualizado')
      }
      setModal(null)
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const confirmarDesactivar = async () => {
    setAccionCargando(true)
    setError('')
    try {
      await desactivarCombo(confirmar.combo.id)
      setToast('Combo desactivado')
      setConfirmar(null)
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setAccionCargando(false)
    }
  }

  const confirmarEliminar = async () => {
    setAccionCargando(true)
    setError('')
    try {
      await eliminarCombo(confirmar.combo.id)
      setToast('Combo eliminado')
      setConfirmar(null)
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setAccionCargando(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Combos</h1>
          <p className="text-sm text-muted">
            {combos.length} combo{combos.length === 1 ? '' : 's'} en el catálogo
          </p>
        </div>
        <Button size="md" onClick={() => setModal('nuevo')}>
          Nuevo combo
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
        <div className="mb-4">
          <Input
            id="buscar-combo"
            type="search"
            placeholder="Buscar combo…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        {cargando ? (
          <p className="text-muted">Cargando combos…</p>
        ) : filtrados.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted">
              {buscar ? `Sin resultados para “${buscar}”.` : 'No hay combos registrados.'}
            </p>
            {!buscar && (
              <Button size="md" onClick={() => setModal('nuevo')}>
                Crear el primero
              </Button>
            )}
          </div>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {filtrados.map((combo) => (
              <FilaCombo
                key={combo.id}
                combo={combo}
                onEditar={() => setModal(combo)}
                onDesactivar={() => setConfirmar({ tipo: 'desactivar', combo })}
                onEliminar={() => setConfirmar({ tipo: 'eliminar', combo })}
              />
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <ComboModal
          abierto
          combo={modal === 'nuevo' ? null : modal}
          productos={productos}
          guardando={guardando}
          onClose={() => setModal(null)}
          onGuardar={guardar}
        />
      )}

      <ConfirmarModal
        open={confirmar?.tipo === 'desactivar'}
        title={`Desactivar ${confirmar?.combo.nombre ?? ''}`}
        mensaje="¿Desactivar este combo? Dejará de venderse."
        textoConfirmar="Desactivar"
        cargando={accionCargando}
        onConfirmar={confirmarDesactivar}
        onCancelar={() => setConfirmar(null)}
      />

      <ConfirmarModal
        open={confirmar?.tipo === 'eliminar'}
        title={`Eliminar ${confirmar?.combo.nombre ?? ''}`}
        mensaje="¿Eliminar este combo? Solo se puede si nunca ha sido vendido."
        textoConfirmar="Eliminar"
        cargando={accionCargando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setConfirmar(null)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </div>
  )
}

export default CombosPage
