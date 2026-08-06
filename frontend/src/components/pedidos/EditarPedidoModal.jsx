import { useEffect, useMemo, useState } from 'react'
import { listarProductos, listarCombos } from '../../services/catalogo'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ProductoCard from '../pos/ProductoCard'
import ModificadorModal from '../pos/ModificadorModal'
import MitadYMitadModal from '../pos/MitadYMitadModal'
import { formatearPrecio } from '../../utils/formato'

function nombreProductoActual(p) {
  if (p.producto) return p.producto.nombre
  if (p.combo) return p.combo.nombre
  if (p.esMitadYMitad && p.mitadYMitad) {
    const m = p.mitadYMitad
    return `Mitad: ${m.sabor1Producto?.nombre ?? '?'} + ${m.sabor2Producto?.nombre ?? '?'}`
  }
  return 'Producto'
}

function FilaNuevo({ producto, onCambiar, onQuitar }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl bg-input px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{producto.nombre}</p>
        {producto.subnombre && <p className="text-xs font-medium text-ink">{producto.subnombre}</p>}
        {producto.modificadores.length > 0 && (
          <p className="text-xs text-muted">{producto.modificadores.map((m) => m.nombre).join(' · ')}</p>
        )}
        <p className="text-xs text-muted">{formatearPrecio(producto.precioUnitario)} c/u</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => onCambiar(producto.key, -1)} className="h-7 w-7 rounded-full bg-card font-bold text-accent shadow-card">−</button>
        <span className="w-5 text-center font-bold text-ink">{producto.cantidad}</span>
        <button type="button" onClick={() => onCambiar(producto.key, 1)} className="h-7 w-7 rounded-full bg-card font-bold text-accent shadow-card">+</button>
        <button type="button" onClick={() => onQuitar(producto.key)} className="h-7 w-7 rounded-full bg-danger/10 text-danger">✕</button>
      </div>
    </li>
  )
}

function EditarPedidoModal({ abierto, pedido, guardando, onClose, onEditar }) {
  const [productos, setProductos] = useState([])
  const [combos, setCombos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [agregar, setAgregar] = useState([])
  const [aQuitar, setAQuitar] = useState([])
  const [preguntarRepo, setPreguntarRepo] = useState(null)
  const [modProducto, setModProducto] = useState(null)
  const [mitadProducto, setMitadProducto] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!abierto) return
    let activo = true
    setError('')
    setAgregar([])
    setAQuitar([])
    setPreguntarRepo(null)
    setBuscar('')
    setCargando(true)
    ;(async () => {
      try {
        const [prods, combosLista] = await Promise.all([
          listarProductos(),
          listarCombos(),
        ])
        if (!activo) return
        setProductos(prods)
        setCombos(combosLista.filter((c) => c.estado === 'Activo'))
      } catch (err) {
        if (activo) setError(err.message)
      } finally {
        if (activo) setCargando(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [abierto])

  const productosFiltrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    if (!termino) return productos
    return productos.filter((p) => p.nombre.toLowerCase().includes(termino))
  }, [productos, buscar])

  const saboresMitad = useMemo(
    () => productos.filter((p) => p.tipo === 'Con_receta' && p.estado === 'Activo' && p.disponibleHoy),
    [productos],
  )

  const agregarAlCarrito = (articulo) => {
    setAgregar((previo) => {
      const existente = previo.find((i) => i.key === articulo.key)
      if (existente) return previo.map((i) => (i.key === articulo.key ? { ...i, cantidad: i.cantidad + 1 } : i))
      return [...previo, articulo]
    })
  }

  const manejarClickProducto = (producto) => {
    if ((producto.productoModificadores ?? []).length > 0) {
      setModProducto(producto)
      return
    }
    setError('')
    agregarAlCarrito({ key: `p${producto.id}`, tipo: 'producto', id: producto.id, nombre: producto.nombre, precioUnitario: producto.precio, cantidad: 1, modificadores: [], esCombo: false })
  }

  const manejarClickCombo = (combo) => {
    setError('')
    agregarAlCarrito({ key: `c${combo.id}`, tipo: 'combo', id: combo.id, nombre: combo.nombre, precioUnitario: combo.precioEspecial, cantidad: 1, modificadores: [], esCombo: true })
  }

  const confirmarModificadores = (modificadores) => {
    const ordenados = [...modificadores].sort((a, b) => a.modificadorId - b.modificadorId)
    setError('')
    agregarAlCarrito({ key: `p${modProducto.id}-${ordenados.map((m) => m.modificadorId).join('-')}`, tipo: 'producto', id: modProducto.id, nombre: modProducto.nombre, precioUnitario: modProducto.precio, cantidad: 1, modificadores: ordenados, esCombo: false })
    setModProducto(null)
  }

  const confirmarMitad = ({ sabor1ProductoId, sabor2ProductoId, subnombre }) => {
    setError('')
    agregarAlCarrito({ key: `m${mitadProducto.id}-${sabor1ProductoId}-${sabor2ProductoId}`, tipo: 'producto', id: mitadProducto.id, nombre: mitadProducto.nombre, subnombre, precioUnitario: mitadProducto.precio, cantidad: 1, modificadores: [], esMitadYMitad: true, sabor1ProductoId, sabor2ProductoId, esCombo: false })
    setMitadProducto(null)
  }

  const cambiarCantidad = (key, delta) =>
    setAgregar((previo) =>
      previo.flatMap((i) => (i.key === key ? (i.cantidad + delta >= 1 ? [{ ...i, cantidad: i.cantidad + delta }] : []) : [i])),
    )
  const quitarAgregado = (key) => setAgregar((previo) => previo.filter((i) => i.key !== key))

  const pedidosProductoActuales = pedido?.productos ?? []

  const guardar = () => {
    setError('')
    if (agregar.length === 0 && aQuitar.length === 0) return setError('No hay cambios que guardar')
    const agregarProductos = agregar.map((item) =>
      item.tipo === 'combo'
        ? { comboId: item.id, cantidad: item.cantidad }
        : item.esMitadYMitad
          ? { productoId: item.id, cantidad: item.cantidad, esMitadYMitad: true, sabor1ProductoId: item.sabor1ProductoId, sabor2ProductoId: item.sabor2ProductoId }
          : { productoId: item.id, cantidad: item.cantidad, modificadores: item.modificadores.map((m) => ({ modificadorId: m.modificadorId })) },
    )
    const quitarProductos = aQuitar.map((q) => ({
      pedidoProductoId: q.pedidoProductoId,
      regresaAInventario: q.regresaAInventario,
    }))
    onEditar({ agregarProductos, quitarProductos })
  }

  if (!abierto || !pedido) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-card shadow-card">
        <header className="flex items-center justify-between gap-4 border-b border-black/5 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Editar pedido #{pedido.id}</h2>
            <p className="text-sm text-muted">Agrega o quita productos · total: {formatearPrecio(pedido.total)} (se recalcula al guardar)</p>
          </div>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>Cerrar</Button>
        </header>

        {error && (
          <div role="alert" className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} aria-label="Cerrar aviso">✕</button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <section className="flex-1 overflow-y-auto bg-surface p-6">
            <div className="mb-4">
              <Input id="buscar-editar" type="search" placeholder="Buscar producto para agregar…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
            {cargando ? (
              <p className="text-muted">Cargando catálogo…</p>
            ) : (
              <>
                {combos.length > 0 && (
                  <section className="mb-6">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Combos</h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {combos.map((combo) => (
                        <ProductoCard key={combo.id} nombre={combo.nombre} precio={combo.precioEspecial} esCombo onClick={() => manejarClickCombo(combo)} />
                      ))}
                    </div>
                  </section>
                )}
                <section>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Productos</h3>
                  {productosFiltrados.length === 0 ? (
                    <p className="text-muted">Sin resultados para “{buscar}”.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                      {productosFiltrados.map((producto) => (
                        <ProductoCard
                          key={producto.id}
                          nombre={producto.nombre}
                          precio={producto.precio}
                          sub={producto.productoModificadores?.length > 0 && !producto.permiteMitadYMitad ? 'Con opciones' : undefined}
                          onClick={() => manejarClickProducto(producto)}
                          onMitad={producto.permiteMitadYMitad ? () => setMitadProducto(producto) : undefined}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </section>

          <aside className="flex w-full max-w-[420px] flex-col border-l border-black/5">
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  Productos actuales
                  {aQuitar.length > 0 && <span className="ml-2 normal-case text-danger">({aQuitar.length} por quitar)</span>}
                </h3>
                {pedidosProductoActuales.length === 0 ? (
                  <p className="text-sm text-muted">Sin productos.</p>
                ) : (
                  <ul className="space-y-2">
                    {pedidosProductoActuales.map((p) => {
                      const estaEnQuitar = aQuitar.some((q) => q.pedidoProductoId === p.id)
                      return (
                        <li
                          key={p.id}
                          className={`flex items-center justify-between gap-3 rounded-xl bg-input px-3 py-2 text-sm ${estaEnQuitar ? 'opacity-50' : ''}`}
                        >
                          <span className="min-w-0 truncate text-ink">
                            <span className="font-semibold">{p.cantidad}×</span> {nombreProductoActual(p)}
                          </span>
                          {estaEnQuitar ? (
                            <button type="button" onClick={() => setAQuitar((l) => l.filter((q) => q.pedidoProductoId !== p.id))} className="shrink-0 text-xs font-bold text-accent">
                              Deshacer
                            </button>
                          ) : (
                            <button type="button" onClick={() => setPreguntarRepo(p)} className="shrink-0 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-bold text-danger">
                              Quitar
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>

              {aQuitar.length > 0 && (
                <p className="rounded-xl bg-warning/10 px-3 py-2 text-xs text-warning">
                  Al guardar, decide por cada producto si el inventario regresa (cancelación) o no.
                </p>
              )}

              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Por agregar</h3>
                {agregar.length === 0 ? (
                  <p className="text-sm text-muted">Toca un producto del menú para agregarlo.</p>
                ) : (
                  <ul className="space-y-2">
                    {agregar.map((it) => (
                      <FilaNuevo key={it.key} producto={it} onCambiar={cambiarCantidad} onQuitar={quitarAgregado} />
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="space-y-3 border-t border-black/5 px-5 py-4">
              <Button className="w-full" size="md" onClick={guardar} disabled={guardando || (agregar.length === 0 && aQuitar.length === 0)}>
                {guardando ? 'Guardando…' : aQuitar.length > 0 ? 'Guardar cambios y resolver inventario' : 'Guardar cambios'}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {preguntarRepo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-card">
            <h3 className="text-lg font-bold text-ink">¿Revertir inventario: {nombreProductoActual(preguntarRepo)}?</h3>
            <p className="mt-2 text-sm text-muted">
              {preguntarRepo.cantidad}× · {formatearPrecio(preguntarRepo.precioCongelado * preguntarRepo.cantidad)}
            </p>
            <p className="mt-2 text-sm text-muted">¿Los ingredientes de este producto regresan al inventario al quitarlo?</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={() => setPreguntarRepo(null)}>Cancelar</Button>
              <Button variant="dangerSoft" size="md" onClick={() => { setAQuitar((l) => [...l, { pedidoProductoId: preguntarRepo.id, regresaAInventario: false }]); setPreguntarRepo(null) }}>
                No regresa
              </Button>
              <Button size="md" onClick={() => { setAQuitar((l) => [...l, { pedidoProductoId: preguntarRepo.id, regresaAInventario: true }]); setPreguntarRepo(null) }}>
                Sí regresa
              </Button>
            </div>
          </div>
        </div>
      )}

      {modProducto && (
        <ModificadorModal open producto={modProducto} onClose={() => setModProducto(null)} onConfirm={confirmarModificadores} />
      )}
      {mitadProducto && (
        <MitadYMitadModal open producto={mitadProducto} sabores={saboresMitad} onClose={() => setMitadProducto(null)} onConfirm={confirmarMitad} />
      )}
    </div>
  )
}

export default EditarPedidoModal