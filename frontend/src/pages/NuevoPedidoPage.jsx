import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { listarProductos, listarCombos } from '../services/catalogo'
import { listarIngredientes } from '../services/ingredientes'
import { listarClientes, crearCliente } from '../services/clientes'
import { crearPedido } from '../services/pedidos'
import { estadoConfig } from '../services/config'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import ProductoCard from '../components/pos/ProductoCard'
import ModificadorModal from '../components/pos/ModificadorModal'
import MitadYMitadModal from '../components/pos/MitadYMitadModal'
import ComboModal from '../components/pos/ComboModal'
import StockAlertaModal from '../components/pos/StockAlertaModal'
import { formatearPrecio } from '../utils/formato'

const TIPOS = [
  { v: 'Para_recoger', l: 'Para pasar' },
  { v: 'A_domicilio', l: 'A domicilio' },
]
const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro']
const METODOS_DOMICILIO = ['Efectivo', 'Transferencia', 'Otro']

function FilaItem({ it, onCambiar, onQuitar }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-input px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{it.nombre}</p>
        {it.subnombre && <p className="text-xs font-medium text-ink">{it.subnombre}</p>}
        {it.modificadores.length > 0 && (
          <p className="text-xs text-muted">{it.modificadores.map((m) => m.nombre).join(' · ')}</p>
        )}
        {it.esCombo && it.productos?.some((p) => p.modificadores?.length > 0) && (
          <p className="text-xs text-muted">
            {it.productos
              .filter((p) => p.modificadores?.length > 0)
              .map((p) => `${p.nombre}: ${p.modificadores.map((m) => m.nombre).join(', ')}`)
              .join(' · ')}
          </p>
        )}
        <p className="text-xs text-muted">{formatearPrecio(it.precioUnitario)} c/u</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onCambiar(it.key, -1)} className="h-8 w-8 rounded-full bg-card font-bold text-accent shadow-card">−</button>
        <span className="w-6 text-center font-bold text-ink">{it.cantidad}</span>
        <button type="button" onClick={() => onCambiar(it.key, 1)} className="h-8 w-8 rounded-full bg-card font-bold text-accent shadow-card">+</button>
        <button type="button" onClick={() => onQuitar(it.key)} className="h-8 w-8 rounded-full bg-danger/10 text-danger">✕</button>
      </div>
    </li>
  )
}

function NuevoPedidoPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [productos, setProductos] = useState([])
  const [combos, setCombos] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true)
  const [errorCatalogo, setErrorCatalogo] = useState('')

  const [clientes, setClientes] = useState([])
  const [buscar, setBuscar] = useState('')
  const [buscarCliente, setBuscarCliente] = useState('')
  const [carrito, setCarrito] = useState([])

  const [tipo, setTipo] = useState('Para_recoger')
  const [pagarAhora, setPagarAhora] = useState(true)
  const [metodo, setMetodo] = useState('Efectivo')
  const [montoReferencia, setMontoReferencia] = useState(null)
  const [noCobrar, setNoCobrar] = useState(false)
  const [nota, setNota] = useState('')
  const [opcionesCambio, setOpcionesCambio] = useState([])
  const [costoEnvio, setCostoEnvio] = useState(0)

  const [clienteId, setClienteId] = useState(null)
  const [clienteNombre, setClienteNombre] = useState('')
  const [usarRegistrado, setUsarRegistrado] = useState(false)
  const [registrarNuevo, setRegistrarNuevo] = useState(false)

  const [modProducto, setModProducto] = useState(null)
  const [mitadProducto, setMitadProducto] = useState(null)
  const [comboModal, setComboModal] = useState(null)
  const [stockModal, setStockModal] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let activo = true
    ;(async () => {
      setCargandoCatalogo(true)
      try {
        const [prods, combosLista, ings, cfg] = await Promise.all([
          listarProductos(),
          listarCombos(),
          listarIngredientes(),
          estadoConfig(),
        ])
        if (!activo) return
        setProductos(prods)
        setCombos(combosLista.filter((c) => c.estado === 'Activo'))
        setIngredientes(ings)
        setOpcionesCambio(cfg.opcionesCambio || [])
        setCostoEnvio(cfg.costoEnvio || 0)
        setClientes(await listarClientes())
      } catch (err) {
        if (!activo) return
        if (err.status === 401) {
          logout()
          return
        }
        setErrorCatalogo(err.message)
      } finally {
        if (activo) setCargandoCatalogo(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [logout])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(temporizador)
  }, [toast])

  const nombres = useMemo(() => {
    const mapa = new Map()
    for (const i of ingredientes) mapa.set(`ingrediente:${i.id}`, i.nombre)
    for (const p of productos) mapa.set(`producto:${p.id}`, p.nombre)
    return mapa
  }, [ingredientes, productos])
  const nombreDe = (f) => nombres.get(`${f.tipo}:${f.id}`)

  const productosFiltrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    if (!termino) return productos
    return productos.filter((p) => p.nombre.toLowerCase().includes(termino))
  }, [productos, buscar])

  const costoEnvioAplicado = tipo === 'A_domicilio' && !noCobrar ? costoEnvio : 0
  const totalCarrito = useMemo(() => {
    const sub = carrito.reduce(
      (acc, item) => acc + (item.precioUnitario + item.modificadores.reduce((a, m) => a + m.costoAplicado, 0)) * item.cantidad,
      0,
    )
    return sub + costoEnvioAplicado
  }, [carrito, costoEnvioAplicado])

  const clientesFiltrados = useMemo(() => {
    const termino = buscarCliente.trim().toLowerCase()
    if (!termino) return clientes.slice(0, 20)
    return clientes
      .filter((c) => c.nombre.toLowerCase().includes(termino) || (c.telefono || '').toLowerCase().includes(termino))
      .slice(0, 20)
  }, [clientes, buscarCliente])

  const saboresMitad = useMemo(
    () => productos.filter((p) => p.tipo === 'Con_receta' && p.estado === 'Activo' && p.disponibleHoy),
    [productos],
  )

  const agregarAlCarrito = (articulo) => {
    setCarrito((previo) => {
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
    agregarAlCarrito({ key: `p${producto.id}`, tipo: 'producto', id: producto.id, nombre: producto.nombre, precioUnitario: producto.precio, cantidad: 1, modificadores: [], esCombo: false })
  }

  const manejarClickCombo = (combo) => {
    const conOpciones = (combo.productos ?? []).some(
      (cp) => (cp.producto?.productoModificadores?.length ?? 0) > 0,
    )
    if (conOpciones) {
      setComboModal(combo)
      return
    }
    agregarAlCarrito({ key: `c${combo.id}`, tipo: 'combo', id: combo.id, nombre: combo.nombre, precioUnitario: combo.precioEspecial, cantidad: 1, modificadores: [], esCombo: true, productos: [] })
  }

  const confirmarCombo = (item) => {
    agregarAlCarrito(item)
    setComboModal(null)
  }

  const confirmarModificadores = (modificadores) => {
    const ordenados = [...modificadores].sort((a, b) => a.modificadorId - b.modificadorId)
    agregarAlCarrito({ key: `p${modProducto.id}-${ordenados.map((m) => m.modificadorId).join('-')}`, tipo: 'producto', id: modProducto.id, nombre: modProducto.nombre, precioUnitario: modProducto.precio, cantidad: 1, modificadores: ordenados, esCombo: false })
    setModProducto(null)
  }

  const confirmarMitad = ({ sabor1ProductoId, sabor2ProductoId, subnombre }) => {
    agregarAlCarrito({ key: `m${mitadProducto.id}-${sabor1ProductoId}-${sabor2ProductoId}`, tipo: 'producto', id: mitadProducto.id, nombre: mitadProducto.nombre, subnombre, precioUnitario: mitadProducto.precio, cantidad: 1, modificadores: [], esMitadYMitad: true, sabor1ProductoId, sabor2ProductoId, esCombo: false })
    setMitadProducto(null)
  }

  const cambiarCantidad = (key, delta) =>
    setCarrito((previo) =>
      previo.flatMap((i) => (i.key === key ? (i.cantidad + delta >= 1 ? [{ ...i, cantidad: i.cantidad + delta }] : []) : [i])),
    )
  const quitar = (key) => setCarrito((previo) => previo.filter((i) => i.key !== key))

  const construirPayload = (clienteFinalId, usarDisponible) => ({
    tipo,
    origen: 'Mostrador',
    productos: carrito.map((item) =>
      item.tipo === 'combo'
        ? {
            comboId: item.id,
            cantidad: item.cantidad,
            ...(item.productos?.some((p) => p.modificadores?.length > 0)
              ? {
                  productos: item.productos.map((p) => ({
                    productoId: p.productoId,
                    modificadores: p.modificadores.map((m) => ({ modificadorId: m.modificadorId })),
                  })),
                }
              : {}),
          }
        : item.esMitadYMitad
          ? { productoId: item.id, cantidad: item.cantidad, esMitadYMitad: true, sabor1ProductoId: item.sabor1ProductoId, sabor2ProductoId: item.sabor2ProductoId }
          : { productoId: item.id, cantidad: item.cantidad, modificadores: item.modificadores.map((m) => ({ modificadorId: m.modificadorId })) },
    ),
    ...(clienteFinalId != null ? { clienteId: clienteFinalId } : {}),
    ...(clienteFinalId == null && clienteNombre.trim() ? { nombreClienteLibre: clienteNombre.trim() } : {}),
    pagarAhora,
    ...(noCobrar ? { noCobrar: true } : {}),
    ...(nota.trim() ? { nota: nota.trim() } : {}),
    ...(!noCobrar && pagarAhora ? { metodoPago: metodo, ...(metodo === 'Efectivo' ? { montoReferenciaPago: montoReferencia } : {}) } : {}),
    ...(usarDisponible ? { usarDisponible } : {}),
  })

  const ejecutar = async (payload) => {
    setGuardando(true)
    setError('')
    try {
      const pedido = await crearPedido(payload)
      setToast(`Pedido #${pedido.id} creado`)
      navigate('/')
    } catch (err) {
      if (err.status === 401) {
        logout()
        return
      }
      if (err.status === 409 && err.datos?.stockInsuficiente) {
        setStockModal({ faltantes: err.datos.stockInsuficiente, opcionesPrecio: err.datos.opcionesPrecio ?? [], payload })
        return
      }
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const manejarCrear = async () => {
    setError('')
    if (carrito.length === 0) return setError('Agrega al menos un producto')

    let clienteFinalId = clienteId
    if (usarRegistrado) {
      if (clienteId == null) return setError('Selecciona un cliente registrado o cambia a “libre”')
    } else {
      const nm = clienteNombre.trim()
      if (!nm) return setError('Escribe el nombre del cliente')
      if (registrarNuevo) {
        try {
          const nuevo = await crearCliente({ nombre: nm })
          clienteFinalId = nuevo.id
        } catch (err) {
          return setError(err.message)
        }
      }
    }

    if (!noCobrar && pagarAhora && metodo === 'Efectivo' && (montoReferencia == null || montoReferencia < totalCarrito)) {
      return setError('Selecciona con cuánto paga el cliente (debe cubrir el total)')
    }

    ejecutar(construirPayload(clienteFinalId))
  }

  const venderSeparado = (modo) => {
    const base = stockModal?.payload
    const oc = stockModal?.opcionesPrecio ?? []
    if (!base || oc.length === 0) return
    const nuevos = (base.productos ?? []).flatMap((item) => {
      if (item.comboId == null) return [item]
      const o = oc.find((x) => Number(x.comboId) === Number(item.comboId))
      if (!o) return [item]
      const prods = o.productos ?? []
      const precioReal = prods.reduce((a, pp) => a + pp.precioUnitario * pp.cantidad, 0)
      return prods.map((pp) => {
        const orig = (item.productos ?? []).find((b) => Number(b.productoId) === Number(pp.productoId))
        let precio = pp.precioUnitario
        if (typeof modo === 'number' && precioReal > 0) {
          precio = Math.round(pp.precioUnitario * (modo / precioReal) * 100) / 100
        }
        return {
          productoId: pp.productoId,
          cantidad: pp.cantidad,
          esMitadYMitad: false,
          precioCongelado: precio,
          ...(orig?.modificadores?.length
            ? { modificadores: orig.modificadores.map((m) => ({ modificadorId: m.modificadorId, costoAplicado: 0 })) }
            : {}),
        }
      })
    })
    setStockModal(null)
    ejecutar({ ...base, productos: nuevos })
  }

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Nuevo pedido</h1>
          <p className="text-sm text-muted">Pedido con cliente y tipo (pasar o a domicilio)</p>
        </div>
        <Button variant="secondary" size="md" onClick={() => navigate('/')}>Volver a pedidos</Button>
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
            <Input id="buscar-producto" type="search" placeholder="Buscar producto…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          </div>

          {cargandoCatalogo ? (
            <p className="text-muted">Cargando catálogo…</p>
          ) : errorCatalogo ? (
            <div className="text-center">
              <p className="mb-4 text-danger">{errorCatalogo}</p>
              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          ) : productos.length === 0 && combos.length === 0 ? (
            <p className="mt-12 text-center text-muted">No hay productos registrados.</p>
          ) : (
            <>
              {combos.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Combos</h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {combos.map((combo) => (
                      <ProductoCard key={combo.id} nombre={combo.nombre} precio={combo.precioEspecial} esCombo onClick={() => manejarClickCombo(combo)} />
                    ))}
                  </div>
                </section>
              )}
              {productosFiltrados.length > 0 && (
                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Productos</h2>
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
                </section>
              )}
              {buscar && productosFiltrados.length === 0 && (
                <p className="mt-8 text-center text-muted">Sin resultados para “{buscar}”.</p>
              )}
            </>
          )}
        </section>

        <aside className="flex w-full max-w-[400px] flex-col bg-card">
          <div className="flex-1 overflow-y-auto space-y-5 px-6 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted">Cliente</p>
              <div className="flex rounded-2xl bg-input p-1">
                {[
                  { v: false, l: 'Libre' },
                  { v: true, l: 'Registrado' },
                ].map((op) => (
                  <button key={op.l} type="button" onClick={() => { setUsarRegistrado(op.v); if (!op.v) setClienteId(null) }}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${usarRegistrado === op.v ? 'bg-card text-ink shadow-card' : 'text-muted'}`}>
                    {op.l}
                  </button>
                ))}
              </div>
              {usarRegistrado ? (
                <div className="space-y-2">
                  <Input id="buscar-cliente" type="search" placeholder="Buscar cliente…" value={buscarCliente} onChange={(e) => setBuscarCliente(e.target.value)} />
                  <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-2xl bg-input p-2">
                    {clientesFiltrados.length === 0 ? (
                      <p className="px-2 py-1 text-sm text-muted">Sin clientes registrados</p>
                    ) : (
                      clientesFiltrados.map((c) => (
                        <button key={c.id} type="button" onClick={() => { setClienteId(c.id); setClienteNombre(c.nombre); setRegistrarNuevo(false) }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${clienteId === c.id ? 'bg-accent/10' : 'hover:bg-muted/10'}`}>
                          <span className="truncate text-sm text-ink">{c.nombre}</span>
                          {c.telefono && <span className="shrink-0 text-xs text-muted">{c.telefono}</span>}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input id="cliente-nombre" type="text" placeholder="Nombre del cliente…" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} />
                  {registrarNuevo ? (
                    <p className="text-xs text-muted">Se registrará como cliente nuevo al crear el pedido.</p>
                  ) : (
                    <button type="button" onClick={() => setRegistrarNuevo(true)} className="text-xs font-semibold text-accent">
                      No está registrado → registrarlo
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted">Para</p>
              <div className="flex rounded-2xl bg-input p-1">
                {TIPOS.map((t) => (
                  <button key={t.v} type="button" onClick={() => setTipo(t.v)}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${tipo === t.v ? 'bg-card text-ink shadow-card' : 'text-muted'}`}>
                    {t.l}
                  </button>
                ))}
              </div>
              {tipo === 'A_domicilio' && !noCobrar && (
                <p className="text-xs text-muted">Costo de envío: {formatearPrecio(costoEnvio)}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted">Nota (para quien prepara)</p>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                rows={2}
                placeholder="Ej: Poco cocido, sin cebolla… (no afecta inventario)"
                className="w-full resize-none rounded-2xl bg-input px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60"
              />
            </div>

            <label className="flex items-center justify-between rounded-2xl bg-input px-4 py-3">
              <span className="text-sm text-ink">No cobrar (consumo interno)</span>
              <input type="checkbox" checked={noCobrar} onChange={(e) => setNoCobrar(e.target.checked)} className="h-5 w-5 accent-accent" />
            </label>

            {!noCobrar && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted">Pago</p>
                <div className="flex rounded-2xl bg-input p-1">
                  {[
                    { v: true, l: 'Ahora' },
                    { v: false, l: 'Después' },
                  ].map((op) => (
                    <button key={op.l} type="button" onClick={() => setPagarAhora(op.v)}
                      className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${pagarAhora === op.v ? 'bg-card text-ink shadow-card' : 'text-muted'}`}>
                      {op.l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!noCobrar && pagarAhora && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted">Método de pago</p>
                <div className="flex flex-wrap gap-2">
                  {(tipo === 'A_domicilio' ? METODOS_DOMICILIO : METODOS).map((m) => (
                    <button key={m} type="button" onClick={() => setMetodo(m)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${metodo === m ? 'bg-accent text-white' : 'bg-input text-muted'}`}>
                      {m}
                    </button>
                  ))}
                </div>
                {metodo === 'Efectivo' && (
                  <div>
                    <p className="mb-2 text-xs text-muted">¿Con cuánto paga el cliente?</p>
                    <div className="flex flex-wrap gap-2">
                      {opcionesCambio.map((m) => (
                        <button key={m} type="button" onClick={() => setMontoReferencia(m)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${montoReferencia === m ? 'bg-accent text-white' : m < totalCarrito ? 'bg-input text-muted/50 line-through' : 'bg-input text-muted'}`}>
                          ${m}
                        </button>
                      ))}
                    </div>
                    {montoReferencia != null && (
                      <p className="mt-1 text-xs text-muted">Cambio a llevar: {formatearPrecio(montoReferencia - totalCarrito)}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 border-t border-black/5 px-6 py-4">
            {carrito.length === 0 ? (
              <p className="text-center text-sm text-muted">Toca un producto del menú para agregarlo.</p>
            ) : (
              <ul className="space-y-2">
                {carrito.map((it) => (
                  <FilaItem key={it.key} it={it} onCambiar={cambiarCantidad} onQuitar={quitar} />
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4 border-t border-black/5 px-6 py-5">
            <div className="flex items-center justify-between text-lg font-bold text-ink">
              <span>Total</span>
              <span>{formatearPrecio(totalCarrito)}</span>
            </div>
            <Button type="button" className="w-full" onClick={manejarCrear} disabled={guardando || carrito.length === 0}>
              {guardando ? 'Creando pedido…' : carrito.length === 0 ? 'Crear pedido' : `Crear pedido · ${formatearPrecio(totalCarrito)}`}
            </Button>
          </div>
        </aside>
      </div>

      {modProducto && (
        <ModificadorModal open producto={modProducto} onClose={() => setModProducto(null)} onConfirm={confirmarModificadores} />
      )}
      <MitadYMitadModal open={mitadProducto !== null} producto={mitadProducto} sabores={saboresMitad} onClose={() => setMitadProducto(null)} onConfirm={confirmarMitad} />
      <ComboModal open={comboModal !== null} combo={comboModal ?? { productos: [] }} onClose={() => setComboModal(null)} onConfirm={confirmarCombo} />
      <StockAlertaModal
        open={stockModal !== null}
        faltantes={stockModal?.faltantes ?? []}
        nombreDe={nombreDe}
        cargando={guardando}
        opcionesPrecio={stockModal?.opcionesPrecio ?? []}
        onVenderSeparado={venderSeparado}
        onConfirmar={() => ejecutar({ ...stockModal?.payload, usarDisponible: true })}
        onCancelar={() => setStockModal(null)}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">{toast}</div>
      )}
    </main>
  )
}

export default NuevoPedidoPage