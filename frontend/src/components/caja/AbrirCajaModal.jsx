import { useEffect, useState } from 'react'
import { listarProductos } from '../../services/catalogo'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import ProductoCard from '../pos/ProductoCard'
import { formatearPrecio } from '../../utils/formato'

const METODOS = ['Efectivo', 'Tarjeta', 'Transferencia']

function AbrirCajaModal({ abierto, guardando, onClose, onAbrir }) {
  const [fondoInicial, setFondoInicial] = useState('')
  const [productos, setProductos] = useState([])
  const [buscar, setBuscar] = useState('')
  const [usarPrevias, setUsarPrevias] = useState(false)
  const [metodo, setMetodo] = useState('Efectivo')
  const [ventas, setVentas] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setFondoInicial('')
    setBuscar('')
    setUsarPrevias(false)
    setMetodo('Efectivo')
    setVentas([])
    setError('')
    let activo = true
    setCargando(true)
    listarProductos()
      .then((p) => {
        if (activo) setProductos(p)
      })
      .catch(() => {
        if (activo) setProductos([])
      })
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [abierto])

  const filtrados = productos.filter((p) => p.nombre.toLowerCase().includes(buscar.trim().toLowerCase()))
  const totalVentas = ventas.reduce((a, v) => a + v.precio * v.cantidad, 0)

  const agregar = (p) => {
    setVentas((prev) => {
      const existente = prev.find((v) => v.id === p.id)
      if (existente) return prev.map((v) => (v.id === p.id ? { ...v, cantidad: v.cantidad + 1 } : v))
      return [...prev, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }]
    })
  }

  const cambiarCantidad = (id, delta) =>
    setVentas((prev) => prev.flatMap((v) => (v.id === id ? (v.cantidad + delta >= 1 ? [{ ...v, cantidad: v.cantidad + delta }] : []) : [v])))
  const quitar = (id) => setVentas((prev) => prev.filter((v) => v.id !== id))

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    const numero = Number(fondoInicial)
    if (!Number.isFinite(numero) || numero < 0) return setError('El fondo inicial no es válido')
    const ventasPrevias = usarPrevias
      ? ventas.map((v) => ({
          productos: [{ productoId: v.id, cantidad: v.cantidad, modificadores: [] }],
          metodoPago: metodo,
          noCobrar: false,
        }))
      : undefined
    onAbrir(ventasPrevias ? { fondoInicial: numero, ventasPrevias } : { fondoInicial: numero })
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Abrir caja"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Abriendo…' : 'Abrir caja'}
          </Button>
        </>
      }
    >
      <form onSubmit={enviar} className="max-h-[70vh] space-y-4 overflow-y-auto">
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Input
          id="fondo-inicial"
          label="Fondo inicial ($)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={fondoInicial}
          onChange={(e) => setFondoInicial(e.target.value)}
          hint="Se toma como base para calcular el efectivo esperado al cierre."
          autoFocus
        />

        <label className="flex items-center justify-between rounded-2xl bg-input px-4 py-3">
          <span className="text-sm text-ink">Registrar ventas previas a apertura</span>
          <input type="checkbox" checked={usarPrevias} onChange={(e) => setUsarPrevias(e.target.checked)} className="h-5 w-5 accent-accent" />
        </label>

        {usarPrevias && (
          <div className="space-y-3 rounded-2xl bg-surface p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted">Método de pago</p>
              <div className="flex flex-wrap gap-2">
                {METODOS.map((m) => (
                  <button key={m} type="button" onClick={() => setMetodo(m)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${metodo === m ? 'bg-accent text-white' : 'bg-input text-muted'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <Input id="buscar-previas" type="search" placeholder="Buscar producto…" value={buscar} onChange={(e) => setBuscar(e.target.value)} />

            {cargando ? (
              <p className="text-sm text-muted">Cargando…</p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
                {filtrados.map((p) => (
                  <ProductoCard key={p.id} nombre={p.nombre} precio={p.precio} onClick={() => agregar(p)} />
                ))}
              </div>
            )}

            {ventas.length > 0 && (
              <>
                <ul className="space-y-1.5">
                  {ventas.map((v) => (
                    <li key={v.id} className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 text-sm">
                      <span className="min-w-0 truncate font-medium text-ink">{v.nombre}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <button type="button" onClick={() => cambiarCantidad(v.id, -1)} className="h-7 w-7 rounded-full bg-input font-bold text-accent">−</button>
                        <span className="w-5 text-center font-bold text-ink">{v.cantidad}</span>
                        <button type="button" onClick={() => cambiarCantidad(v.id, 1)} className="h-7 w-7 rounded-full bg-input font-bold text-accent">+</button>
                        <button type="button" onClick={() => quitar(v.id)} className="h-7 w-7 rounded-full bg-danger/10 text-danger">✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-bold text-ink">Total previos: {formatearPrecio(totalVentas)}</p>
              </>
            )}
          </div>
        )}

        <p className="rounded-2xl bg-muted/10 px-4 py-3 text-sm text-muted">
          Al abrir, los gastos y devoluciones registrados sin caja se asociarán a este día operativo.
        </p>
      </form>
    </Modal>
  )
}

export default AbrirCajaModal