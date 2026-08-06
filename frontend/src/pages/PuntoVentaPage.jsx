import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { listarCombos, listarProductos } from '../services/catalogo'
import { listarIngredientes } from '../services/ingredientes'
import { abrirCaja, obtenerEstadoCaja } from '../services/caja'
import { crearVenta } from '../services/ventas'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Carrito from '../components/pos/Carrito'
import AbrirCajaModal from '../components/pos/AbrirCajaModal'
import ModificadorModal from '../components/pos/ModificadorModal'
import MitadYMitadModal from '../components/pos/MitadYMitadModal'
import StockAlertaModal from '../components/pos/StockAlertaModal'
import { formatearPrecio } from '../utils/formato'

function ProductoCard({ nombre, precio, sub, esCombo, onClick, onMitad }) {
  return (
    <div className="flex min-h-[120px] flex-col rounded-2xl bg-card shadow-card">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 flex-col justify-between gap-2 rounded-2xl p-4 text-left transition active:scale-[0.97] disabled:opacity-50"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 font-semibold text-ink">{nombre}</span>
          {esCombo && (
            <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
              Combo
            </span>
          )}
        </div>
        <span className="text-lg font-bold text-accent">{formatearPrecio(precio)}</span>
        {sub && <span className="text-xs text-muted">{sub}</span>}
      </button>
      {onMitad && (
        <button
          type="button"
          onClick={onMitad}
          className="mx-2 mb-2 flex items-center justify-center gap-1 rounded-xl bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition active:scale-[0.97] active:bg-accent/20"
        >
          <span className="text-sm font-bold">½</span> Mitad y mitad
        </button>
      )}
    </div>
  )
}

function PuntoVentaPage() {
  const { logout } = useAuth()

  const [productos, setProductos] = useState([])
  const [combos, setCombos] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true)
  const [errorCatalogo, setErrorCatalogo] = useState('')

  const [caja, setCaja] = useState({ abierta: false, dia: null })
  const [cargandoCaja, setCargandoCaja] = useState(true)

  const [carrito, setCarrito] = useState([])
  const [buscar, setBuscar] = useState('')

  const [modProducto, setModProducto] = useState(null)
  const [mitadProducto, setMitadProducto] = useState(null)
  const [abrirCajaModal, setAbrirCajaModal] = useState(false)
  const [abriendoCaja, setAbriendoCaja] = useState(false)
  const [stockModal, setStockModal] = useState(null)
  const [cobrando, setCobrando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [toast, setToast] = useState('')

  const [noCobrar, setNoCobrar] = useState(false)
  const [metodoPago, setMetodoPago] = useState('Efectivo')

  useEffect(() => {
    let activo = true
    ;(async () => {
      setCargandoCatalogo(true)
      setCargandoCaja(true)
      try {
        const [estadoCaja, prods, combosLista, ings] = await Promise.all([
          obtenerEstadoCaja(),
          listarProductos(),
          listarCombos(),
          listarIngredientes(),
        ])
        if (!activo) return
        setCaja(estadoCaja)
        setProductos(prods)
        setCombos(combosLista.filter((c) => c.estado === 'Activo'))
        setIngredientes(ings)
      } catch (err) {
        if (!activo) return
        if (err.status === 401) {
          logout()
          return
        }
        setErrorCatalogo(err.message)
      } finally {
        if (activo) {
          setCargandoCatalogo(false)
          setCargandoCaja(false)
        }
      }
    })()
    return () => {
      activo = false
    }
  }, [logout])

  useEffect(() => {
    if (!toast) return
    const temporizador = setTimeout(() => setToast(''), 2500)
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

  const totalCarrito = carrito.reduce(
    (acc, item) => acc + (item.precioUnitario + item.modificadores.reduce((a, m) => a + m.costoAplicado, 0)) * item.cantidad,
    0,
  )

  const agregarAlCarrito = (articulo) => {
    setCarrito((previo) => {
      const existente = previo.find((i) => i.key === articulo.key)
      if (existente) {
        return previo.map((i) => (i.key === articulo.key ? { ...i, cantidad: i.cantidad + 1 } : i))
      }
      return [...previo, articulo]
    })
  }

  const manejarClickProducto = (producto) => {
    if ((producto.productoModificadores ?? []).length > 0) {
      setModProducto(producto)
      return
    }
    agregarAlCarrito({
      key: `p${producto.id}`,
      tipo: 'producto',
      id: producto.id,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad: 1,
      modificadores: [],
      esCombo: false,
    })
  }

  const manejarClickCombo = (combo) => {
    agregarAlCarrito({
      key: `c${combo.id}`,
      tipo: 'combo',
      id: combo.id,
      nombre: combo.nombre,
      precioUnitario: combo.precioEspecial,
      cantidad: 1,
      modificadores: [],
      esCombo: true,
    })
  }

  const confirmarModificadores = (modificadores) => {
    const ordenados = [...modificadores].sort((a, b) => a.modificadorId - b.modificadorId)
    agregarAlCarrito({
      key: `p${modProducto.id}-${ordenados.map((m) => m.modificadorId).join('-')}`,
      tipo: 'producto',
      id: modProducto.id,
      nombre: modProducto.nombre,
      precioUnitario: modProducto.precio,
      cantidad: 1,
      modificadores: ordenados,
      esCombo: false,
    })
    setModProducto(null)
  }

  const confirmarMitad = ({ sabor1ProductoId, sabor2ProductoId, subnombre }) => {
    agregarAlCarrito({
      key: `m${mitadProducto.id}-${sabor1ProductoId}-${sabor2ProductoId}`,
      tipo: 'producto',
      id: mitadProducto.id,
      nombre: mitadProducto.nombre,
      subnombre,
      precioUnitario: mitadProducto.precio,
      cantidad: 1,
      modificadores: [],
      esMitadYMitad: true,
      sabor1ProductoId,
      sabor2ProductoId,
      esCombo: false,
    })
    setMitadProducto(null)
  }

  const saboresMitad = useMemo(
    () => productos.filter((p) => p.tipo === 'Con_receta' && p.estado === 'Activo' && p.disponibleHoy),
    [productos],
  )

  const incrementar = (key) =>
    setCarrito((previo) => previo.map((i) => (i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i)))
  const decrementar = (key) =>
    setCarrito((previo) =>
      previo.flatMap((i) => (i.key === key ? (i.cantidad > 1 ? [{ ...i, cantidad: i.cantidad - 1 }] : []) : [i])),
    )
  const quitar = (key) => setCarrito((previo) => previo.filter((i) => i.key !== key))

  const construirPayload = (usarDisponible) => ({
    productos: carrito.map((item) =>
      item.tipo === 'combo'
        ? { comboId: item.id, cantidad: item.cantidad }
        : item.esMitadYMitad
          ? {
              productoId: item.id,
              cantidad: item.cantidad,
              esMitadYMitad: true,
              sabor1ProductoId: item.sabor1ProductoId,
              sabor2ProductoId: item.sabor2ProductoId,
            }
          : {
              productoId: item.id,
              cantidad: item.cantidad,
              modificadores: item.modificadores.map((m) => ({ modificadorId: m.modificadorId })),
            },
    ),
    metodoPago,
    noCobrar,
    ...(usarDisponible ? { usarDisponible } : {}),
  })

  const ejecutarCobro = async (payload) => {
    setCobrando(true)
    setErrorGeneral('')
    try {
      await crearVenta(payload)
      setCarrito([])
      setToast('Venta registrada')
      setStockModal(null)
    } catch (err) {
      if (err.status === 401) {
        logout()
        return
      }
      if (err.status === 409 && err.datos?.stockInsuficiente) {
        setStockModal({ faltantes: err.datos.stockInsuficiente, payload })
        return
      }
      setErrorGeneral(err.message)
    } finally {
      setCobrando(false)
    }
  }

  const manejarCobrar = () => ejecutarCobro(construirPayload())

  const confirmarStock = () => {
    if (!stockModal) return
    ejecutarCobro({ ...stockModal.payload, usarDisponible: true })
  }

  const manejarAbrirCaja = async (fondoInicial) => {
    setAbriendoCaja(true)
    setErrorGeneral('')
    try {
      const resultado = await abrirCaja(fondoInicial)
      setCaja({ abierta: true, dia: resultado.diaOperativo })
      setAbrirCajaModal(false)
      setToast('Caja abierta')
    } catch (err) {
      if (err.status === 401) {
        logout()
        return
      }
      setErrorGeneral(err.message)
    } finally {
      setAbriendoCaja(false)
    }
  }

  return (
    <main className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <h1 className="text-2xl font-bold text-ink">Punto de Venta</h1>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
            cargandoCaja
              ? 'bg-muted/10 text-muted'
              : caja.abierta
                ? 'bg-accent/10 text-accent'
                : 'bg-danger/10 text-danger'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${caja.abierta ? 'bg-accent' : 'bg-danger'}`}
          />
          {cargandoCaja ? 'Verificando caja…' : caja.abierta ? 'Caja abierta' : 'Caja cerrada'}
        </div>
      </header>

      {!cargandoCaja && !caja.abierta && (
        <div className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-3">
          <p className="text-sm text-muted">
            La caja está cerrada. Ábrela para poder registrar ventas.
          </p>
          <Button size="md" onClick={() => setAbrirCajaModal(true)}>
            Abrir caja
          </Button>
        </div>
      )}

      {errorGeneral && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 bg-danger/10 px-6 py-3 text-sm font-medium text-danger"
        >
          <span>{errorGeneral}</span>
          <button type="button" onClick={() => setErrorGeneral('')} aria-label="Cerrar aviso">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto bg-surface p-6">
          <div className="mb-4">
            <Input
              id="buscar-producto"
              type="search"
              placeholder="Buscar producto…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>

          {cargandoCatalogo ? (
            <p className="text-muted">Cargando catálogo…</p>
          ) : errorCatalogo ? (
            <div className="text-center">
              <p className="mb-4 text-danger">{errorCatalogo}</p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          ) : productos.length === 0 && combos.length === 0 ? (
            <p className="mt-12 text-center text-muted">
              No hay productos registrados. Agrégalos desde la gestión de catálogo.
            </p>
          ) : (
            <>
              {combos.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                    Combos
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {combos.map((combo) => (
                      <ProductoCard
                        key={combo.id}
                        nombre={combo.nombre}
                        precio={combo.precioEspecial}
                        esCombo
                        onClick={() => manejarClickCombo(combo)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {productosFiltrados.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                    Productos
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {productosFiltrados.map((producto) => (
                      <ProductoCard
                        key={producto.id}
                        nombre={producto.nombre}
                        precio={producto.precio}
                        sub={
                          producto.productoModificadores?.length > 0 && !producto.permiteMitadYMitad
                            ? 'Con opciones'
                            : undefined
                        }
                        onClick={() => manejarClickProducto(producto)}
                        onMitad={producto.permiteMitadYMitad ? () => setMitadProducto(producto) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {buscar && productosFiltrados.length === 0 && (
                <p className="mt-8 text-center text-muted">Sin resultados para “{buscar}”.</p>
              )}
            </>
          )}
        </section>

        <Carrito
          items={carrito}
          total={totalCarrito}
          noCobrar={noCobrar}
          onToggleNoCobrar={() => setNoCobrar((v) => !v)}
          metodoPago={metodoPago}
          onMetodoPago={setMetodoPago}
          onIncrement={incrementar}
          onDecrement={decrementar}
          onRemove={quitar}
          onCobrar={manejarCobrar}
          cobrando={cobrando}
          cajaAbierta={caja.abierta}
        />
      </div>

      {modProducto && (
        <ModificadorModal
          open
          producto={modProducto}
          onClose={() => setModProducto(null)}
          onConfirm={confirmarModificadores}
        />
      )}

      <MitadYMitadModal
        open={mitadProducto !== null}
        producto={mitadProducto}
        sabores={saboresMitad}
        onClose={() => setMitadProducto(null)}
        onConfirm={confirmarMitad}
      />

      <StockAlertaModal
        open={stockModal !== null}
        faltantes={stockModal?.faltantes ?? []}
        nombreDe={nombreDe}
        cargando={cobrando}
        onConfirmar={confirmarStock}
        onCancelar={() => setStockModal(null)}
      />

      <AbrirCajaModal
        open={abrirCajaModal}
        cargando={abriendoCaja}
        onClose={() => setAbrirCajaModal(false)}
        onConfirm={manejarAbrirCaja}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-card">
          {toast}
        </div>
      )}
    </main>
  )
}

export default PuntoVentaPage
