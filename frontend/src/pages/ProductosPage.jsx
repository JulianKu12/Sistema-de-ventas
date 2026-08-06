import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import {
  actualizarProducto,
  cambiarDisponibilidad,
  crearProducto,
  desactivarProducto,
  eliminarProducto,
  listarProductos,
} from '../services/productos'
import { listarIngredientes } from '../services/ingredientes'
import Button from '../components/ui/Button'
import ConfirmarModal from '../components/ui/ConfirmarModal'
import Input from '../components/ui/Input'
import ProductoModal from '../components/productos/ProductoModal'
import { formatearPrecio } from '../utils/formato'

const FILTROS = [
  { valor: 'Todos', etiqueta: 'Todos' },
  { valor: 'Con_receta', etiqueta: 'Con receta' },
  { valor: 'Reventa_directa', etiqueta: 'Reventa' },
]

function ResumenReceta({ producto }) {
  if (producto.tipo !== 'Con_receta') return null
  const filas = producto.productoIngredientes ?? []
  if (filas.length === 0) return <p className="text-sm text-muted">Sin receta</p>
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {filas.map((pi) => (
        <span
          key={pi.id}
          className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
        >
          {pi.cantidad}× {pi.ingrediente.nombre}
        </span>
      ))}
    </div>
  )
}

function FilaProducto({ producto, onEditar, onDisponibilidad, onDesactivar, onEliminar, accionCargando }) {
  const cantidadModificadores = producto.productoModificadores?.length ?? 0
  const cantidadCombos = producto.combosProductos?.length ?? 0
  return (
    <li className="rounded-2xl bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-ink">{producto.nombre}</p>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              {producto.tipo === 'Con_receta' ? 'Con receta' : 'Reventa'}
            </span>
            {producto.estado === 'Inactivo' && (
              <span className="rounded-full bg-muted/20 px-2 py-0.5 text-xs font-semibold text-muted">
                Inactivo
              </span>
            )}
            {producto.estado === 'Activo' && !producto.disponibleHoy && (
              <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-semibold text-warning">
                No disponible hoy
              </span>
            )}
            {producto.permiteMitadYMitad && (
              <span className="rounded-full bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted">
                Mitad y mitad
              </span>
            )}
          </div>
          <p className="mt-0.5 text-lg font-bold text-ink">{formatearPrecio(producto.precio)}</p>
          <ResumenReceta producto={producto} />
          {(cantidadModificadores > 0 || cantidadCombos > 0) && (
            <p className="mt-2 text-xs text-muted">
              {cantidadModificadores > 0 && `${cantidadModificadores} modificador${cantidadModificadores === 1 ? '' : 'es'}`}
              {cantidadModificadores > 0 && cantidadCombos > 0 && ' · '}
              {cantidadCombos > 0 && `${cantidadCombos} combo${cantidadCombos === 1 ? '' : 's'}`}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="md" variant="secondary" onClick={onEditar}>
          Editar
        </Button>
        {producto.estado === 'Activo' ? (
          <>
            <Button size="md" variant="secondary" onClick={onDisponibilidad} disabled={accionCargando}>
              {producto.disponibleHoy ? 'Marcar no disponible hoy' : 'Marcar disponible hoy'}
            </Button>
            <Button size="md" variant="dangerSoft" onClick={onDesactivar}>
              Desactivar
            </Button>
          </>
        ) : (
          <Button size="md" variant="dangerSoft" onClick={onEliminar}>
            Eliminar
          </Button>
        )}
      </div>
    </li>
  )
}

function ProductosPage() {
  const { logout } = useAuth()
  const [productos, setProductos] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [buscar, setBuscar] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('Todos')

  const [modal, setModal] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [confirmar, setConfirmar] = useState(null)
  const [accionCargando, setAccionCargando] = useState(false)
  const [toast, setToast] = useState('')

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const [listaProductos, listaIngredientes] = await Promise.all([listarProductos(), listarIngredientes()])
      setProductos(listaProductos)
      setIngredientes(listaIngredientes)
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
    return productos.filter((p) => {
      const coincideNombre = !termino || p.nombre.toLowerCase().includes(termino)
      const coincideTipo = filtroTipo === 'Todos' || p.tipo === filtroTipo
      return coincideNombre && coincideTipo
    })
  }, [productos, buscar, filtroTipo])

  const guardar = async (datos) => {
    setGuardando(true)
    setError('')
    try {
      if (modal === 'nuevo') {
        await crearProducto(datos)
        setToast('Producto creado')
      } else {
        await actualizarProducto(modal.id, datos)
        setToast('Producto actualizado')
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

  const alternarDisponibilidad = async (producto) => {
    setAccionCargando(true)
    setError('')
    try {
      await cambiarDisponibilidad(producto.id, !producto.disponibleHoy)
      setToast(producto.disponibleHoy ? 'Ya no disponible hoy' : 'Disponible hoy')
      cargar()
    } catch (err) {
      if (err.status === 401) return logout()
      setError(err.message)
    } finally {
      setAccionCargando(false)
    }
  }

  const confirmarDesactivar = async () => {
    setAccionCargando(true)
    setError('')
    try {
      const resultado = await desactivarProducto(confirmar.producto.id)
      setToast(resultado.mensaje ?? 'Producto desactivado')
      if (resultado.aviso) setToast(resultado.aviso)
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
      await eliminarProducto(confirmar.producto.id)
      setToast('Producto eliminado')
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
          <h1 className="text-2xl font-bold text-ink">Productos</h1>
          <p className="text-sm text-muted">
            {productos.length} producto{productos.length === 1 ? '' : 's'} en el catálogo
          </p>
        </div>
        <Button size="md" onClick={() => setModal('nuevo')}>
          Nuevo producto
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
            id="buscar-producto"
            type="search"
            placeholder="Buscar producto…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <div className="flex rounded-2xl bg-input p-1">
            {FILTROS.map((op) => (
              <button
                key={op.valor}
                type="button"
                onClick={() => setFiltroTipo(op.valor)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  filtroTipo === op.valor ? 'bg-card text-ink shadow-card' : 'text-muted'
                }`}
              >
                {op.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {cargando ? (
          <p className="text-muted">Cargando productos…</p>
        ) : filtrados.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="mb-4 text-muted">
              {buscar || filtroTipo !== 'Todos'
                ? 'Sin resultados para el filtro actual.'
                : 'No hay productos registrados.'}
            </p>
            {!buscar && filtroTipo === 'Todos' && (
              <Button size="md" onClick={() => setModal('nuevo')}>
                Crear el primero
              </Button>
            )}
          </div>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {filtrados.map((producto) => (
              <FilaProducto
                key={producto.id}
                producto={producto}
                accionCargando={accionCargando}
                onEditar={() => setModal(producto)}
                onDisponibilidad={() => alternarDisponibilidad(producto)}
                onDesactivar={() => setConfirmar({ tipo: 'desactivar', producto })}
                onEliminar={() => setConfirmar({ tipo: 'eliminar', producto })}
              />
            ))}
          </ul>
        )}
      </div>

      {modal && (
        <ProductoModal
          abierto
          producto={modal === 'nuevo' ? null : modal}
          ingredientes={ingredientes}
          guardando={guardando}
          onClose={() => setModal(null)}
          onGuardar={guardar}
        />
      )}

      <ConfirmarModal
        open={confirmar?.tipo === 'desactivar'}
        title={`Desactivar ${confirmar?.producto.nombre ?? ''}`}
        mensaje="¿Desactivar este producto? Dejará de venderse y los combos que lo incluyan quedarán suspendidos."
        textoConfirmar="Desactivar"
        cargando={accionCargando}
        onConfirmar={confirmarDesactivar}
        onCancelar={() => setConfirmar(null)}
      />

      <ConfirmarModal
        open={confirmar?.tipo === 'eliminar'}
        title={`Eliminar ${confirmar?.producto.nombre ?? ''}`}
        mensaje="¿Eliminar este producto? Solo se puede si no ha sido vendido ni está en recetas, modificadores o combos."
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

export default ProductosPage
