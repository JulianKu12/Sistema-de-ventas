import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import {
  actualizarIngrediente,
  crearIngrediente,
  desactivarIngrediente,
  eliminarIngrediente,
  listarIngredientes,
} from '../services/ingredientes'
import Button from '../components/ui/Button'
import ConfirmarModal from '../components/ui/ConfirmarModal'
import Input from '../components/ui/Input'
import IngredienteModal from '../components/ingredientes/IngredienteModal'
import DesactivarIngredienteModal from '../components/ingredientes/DesactivarIngredienteModal'
import { formatearPrecio } from '../utils/formato'

const ETIQUETAS_UNIDAD = {
  kg: 'kg',
  g: 'g',
  l: 'l',
  ml: 'ml',
  pieza: 'pz',
}

function EstadoStock({ ingrediente }) {
  const bajo = ingrediente.stockActual <= ingrediente.stockMinimoAlerta
  const clase = ingrediente.stockActual < 0 ? 'text-danger' : bajo ? 'text-warning' : 'text-ink'
  const etiqueta = ingrediente.stockActual < 0 ? 'Sin stock' : bajo ? 'Stock bajo' : null
  return (
    <div className="text-right">
      <p className={`text-xl font-bold ${clase}`}>
        {ingrediente.stockActual} {ETIQUETAS_UNIDAD[ingrediente.unidadMedida] ?? ingrediente.unidadMedida}
      </p>
      {etiqueta && <p className={`text-xs font-medium ${clase}`}>{etiqueta}</p>}
    </div>
  )
}

function FilaIngrediente({ ingrediente, onEditar, onDesactivar, onEliminar }) {
  return (
    <li className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-ink">{ingrediente.nombre}</p>
            {ingrediente.estado === 'Inactivo' && (
              <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted">
                Inactivo
              </span>
            )}
          </div>
          <p className="text-sm text-muted">{ETIQUETAS_UNIDAD[ingrediente.unidadMedida] ?? ingrediente.unidadMedida}</p>
          {ingrediente.costoUltimaCompra != null && (
            <p className="text-sm text-muted">Última compra: {formatearPrecio(ingrediente.costoUltimaCompra)}</p>
          )}
        </div>
        <EstadoStock ingrediente={ingrediente} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="md" variant="secondary" onClick={onEditar}>
          Editar
        </Button>
        {ingrediente.estado === 'Activo' ? (
          <Button size="md" variant="dangerSoft" onClick={onDesactivar}>
            Desactivar
          </Button>
        ) : (
          <Button size="md" variant="dangerSoft" onClick={onEliminar}>
            Eliminar
          </Button>
        )}
      </div>
    </li>
  )
}

function IngredientesPage() {
  const { logout } = useAuth()
  const [ingredientes, setIngredientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')

  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [desactivarOpciones, setDesactivarOpciones] = useState(null)
  const [accionCargando, setAccionCargando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setIngredientes(await listarIngredientes())
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
    if (!termino) return ingredientes
    return ingredientes.filter((i) => i.nombre.toLowerCase().includes(termino))
  }, [ingredientes, buscar])

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      if (modal === 'nuevo') {
        await crearIngrediente(datos)
        setToast('Ingrediente creado')
      } else {
        await actualizarIngrediente(modal.id, datos)
        setToast('Ingrediente actualizado')
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

  const solicitarDesactivar = async (ingrediente) => {
    setError('')
    try {
      const resultado = await desactivarIngrediente(ingrediente.id)
      setToast(resultado.mensaje ?? 'Ingrediente desactivado')
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      if (err.status === 409 && err.datos?.requiereConfirmacion) {
        setConfirmar(null)
        setDesactivarOpciones({ ingrediente, productos: err.datos.productosAfectados })
        return
      }
      setError(err.message)
    }
  }

  const confirmarDesactivar = async (opcion) => {
    if (opcion === 'cancelar') {
      setDesactivarOpciones(null)
      return
    }
    setAccionCargando(true)
    setError('')
    try {
      const resultado = await desactivarIngrediente(desactivarOpciones.ingrediente.id, opcion)
      setToast(resultado.mensaje ?? 'Ingrediente desactivado')
      setDesactivarOpciones(null)
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
      await eliminarIngrediente(confirmar.ingrediente.id)
      setToast('Ingrediente eliminado')
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
          <h1 className="text-2xl font-bold text-ink">Ingredientes</h1>
          <p className="text-sm text-muted">
            {ingredientes.length} ingrediente{ingredientes.length === 1 ? '' : 's'} en el catálogo
          </p>
        </div>
        <Button size="md" onClick={() => setModal('nuevo')}>
          Nuevo ingrediente
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
            id="buscar-ingrediente"
            type="search"
            placeholder="Buscar ingrediente…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>

        {cargando ? (
          <p className="text-muted">Cargando ingredientes…</p>
        ) : filtrados.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted">
              {buscar ? `Sin resultados para “${buscar}”.` : 'No hay ingredientes registrados.'}
            </p>
            {!buscar && (
              <Button size="md" onClick={() => setModal('nuevo')}>
                Crear el primero
              </Button>
            )}
          </div>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {filtrados.map((ingrediente) => (
              <FilaIngrediente
                key={ingrediente.id}
                ingrediente={ingrediente}
                onEditar={() => setModal(ingrediente)}
                onDesactivar={() => setConfirmar({ tipo: 'desactivar', ingrediente })}
                onEliminar={() => setConfirmar({ tipo: 'eliminar', ingrediente })}
              />
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <IngredienteModal
          abierto
          ingrediente={modal === 'nuevo' ? null : modal}
          guardando={guardando}
          onClose={() => setModal(null)}
          onGuardar={guardar}
        />
      )}

      {desactivarOpciones && (
        <DesactivarIngredienteModal
          ingrediente={desactivarOpciones.ingrediente}
          productos={desactivarOpciones.productos}
          cargando={accionCargando}
          onClose={() => setDesactivarOpciones(null)}
          onConfirmar={confirmarDesactivar}
        />
      )}

      <ConfirmarModal
        open={confirmar?.tipo === 'desactivar'}
        title={`Desactivar ${confirmar?.ingrediente.nombre ?? ''}`}
        mensaje="¿Desactivar este ingrediente? Dejará de estar disponible en las ventas."
        textoConfirmar="Desactivar"
        cargando={accionCargando}
        onConfirmar={() => solicitarDesactivar(confirmar.ingrediente)}
        onCancelar={() => setConfirmar(null)}
      />

      <ConfirmarModal
        open={confirmar?.tipo === 'eliminar'}
        title={`Eliminar ${confirmar?.ingrediente.nombre ?? ''}`}
        mensaje="¿Eliminar este ingrediente? Solo se puede si nunca ha sido usado en recetas, movimientos o modificadores."
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

export default IngredientesPage
