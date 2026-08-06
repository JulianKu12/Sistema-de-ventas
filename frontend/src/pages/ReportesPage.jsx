import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { listarVentas, reporteNoCobrar } from '../services/ventas'
import { listarGastos } from '../services/gastos'
import { listarDevoluciones } from '../services/devoluciones'
import { listarPedidos } from '../services/pedidos'
import { formatearPrecio, formatearFecha } from '../utils/formato'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const TABS = [
  { clave: 'ventas', etiqueta: 'Ventas del día' },
  { clave: 'clientes', etiqueta: 'Por cliente' },
  { clave: 'nocobrar', etiqueta: 'No cobrar' },
]
const METODO_COLOR = {
  Efectivo: 'text-emerald-600',
  Tarjeta: 'text-accent',
  Transferencia: 'text-muted',
  Otro: 'text-ink',
}

function hoyLocal() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dd}`
}

function mismoDia(iso, fecha) {
  if (!iso) return false
  const d = new Date(iso)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dd}` === fecha
}

function TarjetaResumen({ total, etiqueta, destacado }) {
  return (
    <div className={`rounded-3xl p-5 ${destacado ? 'bg-accent text-white' : 'bg-card shadow-card'}`}>
      <p className={`text-sm font-medium ${destacado ? 'text-white/80' : 'text-muted'}`}>{etiqueta}</p>
      <p className={`mt-1 text-2xl font-extrabold ${destacado ? 'text-white' : 'text-ink'}`}>{formatearPrecio(total)}</p>
    </div>
  )
}

function ReportesPage() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('ventas')
  const [fecha, setFecha] = useState(hoyLocal)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [ventas, setVentas] = useState([])
  const [gastos, setGastos] = useState([])
  const [devoluciones, setDevoluciones] = useState([])
  const [noCobrar, setNoCobrar] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [clientesExpandidos, setClientesExpandidos] = useState(() => new Set())
  const [generando, setGenerando] = useState(false)

  const manejarError = useCallback((err) => {
    if (err.status === 401) return logout()
    setError(err.message)
  }, [logout])

  const cargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const inicio = new Date(`${fecha}T00:00:00`)
      const fin = new Date(`${fecha}T23:59:59.999`)
      const [vt, gs, dv] = await Promise.all([
        listarVentas({ fechaDesde: inicio.toISOString(), fechaHasta: fin.toISOString() }),
        listarGastos(),
        listarDevoluciones(),
      ])
      setVentas(vt)
      setGastos(gs.filter((g) => mismoDia(g.fechaHora, fecha)))
      setDevoluciones(dv.filter((d) => mismoDia(d.fechaHora, fecha)))
    } catch (err) {
      manejarError(err)
    } finally {
      setCargando(false)
    }
  }, [fecha, manejarError])

  useEffect(() => {
    cargar()
  }, [cargar])

  const resumen = useMemo(() => {
    const pagadas = ventas.filter((v) => !v.noCobrar)
    const totalVentas = pagadas.reduce((a, v) => a + v.total, 0)
    const totalNoCobrar = ventas.filter((v) => v.noCobrar).reduce((a, v) => a + v.total, 0)
    const porMetodo = pagadas.reduce((acc, v) => {
      acc[v.metodoPago] = (acc[v.metodoPago] ?? 0) + v.total
      return acc
    }, {})
    const totalGastos = gastos.reduce((a, g) => a + g.monto, 0)
    const totalDevoluciones = devoluciones.reduce((a, d) => a + d.monto, 0)
    return { totalVentas, totalNoCobrar, porMetodo, totalGastos, totalDevoluciones, ganancia: totalVentas - totalGastos - totalDevoluciones }
  }, [ventas, gastos, devoluciones])

  const alternarCliente = (clave) => {
    setClientesExpandidos((prev) => {
      const nuevo = new Set(prev)
      if (nuevo.has(clave)) nuevo.delete(clave)
      else nuevo.add(clave)
      return nuevo
    })
  }

  const cargarNoCobrar = async () => {
    setGenerando(true)
    setError('')
    try {
      setNoCobrar(await reporteNoCobrar())
    } catch (err) {
      manejarError(err)
    } finally {
      setGenerando(false)
    }
  }

  const cargarPedidos = async () => {
    setGenerando(true)
    setError('')
    try {
      setPedidos(await listarPedidos())
    } catch (err) {
      manejarError(err)
    } finally {
      setGenerando(false)
    }
  }

  useEffect(() => {
    if (tab === 'nocobrar' && noCobrar.length === 0 && !cargando) cargarNoCobrar()
    if (tab === 'clientes' && pedidos.length === 0 && !cargando) cargarPedidos()
  }, [tab, cargando]) // eslint-disable-line react-hooks/exhaustive-deps

  const porCliente = useMemo(() => {
    const mapa = new Map()
    for (const p of pedidos) {
      const nombre = p.cliente?.nombre ?? p.nombreClienteLibre ?? 'Sin cliente'
      if (!mapa.has(nombre)) mapa.set(nombre, { nombre, pedidos: [] })
      mapa.get(nombre).pedidos.push(p)
    }
    const lista = []
    for (const { nombre, pedidos: ps } of mapa.values()) {
      ps.sort((a, b) => new Date(b.fechaHoraCreacion) - new Date(a.fechaHoraCreacion))
      lista.push({
        nombre,
        total: ps.reduce((a, p) => a + p.total, 0),
        cantidad: ps.length,
        ultimo: ps[0].fechaHoraCreacion,
        pedidos: ps,
      })
    }
    lista.sort((a, b) => new Date(b.ultimo) - new Date(a.ultimo))
    return lista
  }, [pedidos])

  const totalNoCobrarGeneral = noCobrar.reduce((a, v) => a + v.total, 0)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface">
      <header className="flex items-center justify-between gap-4 border-b border-black/5 bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Reportes</h1>
          <p className="text-sm text-muted">Ventas del día, por cliente y consumo interno</p>
        </div>
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
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.clave ? 'bg-accent text-white' : 'bg-input text-muted'}`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === 'ventas' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-end gap-3">
              <div className="w-48">
                <Input id="fecha-reporte" label="Día" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
            </div>
            {cargando ? (
              <p className="text-muted">Cargando reporte…</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <TarjetaResumen etiqueta="Ventas" total={resumen.totalVentas} destacado />
                  <TarjetaResumen etiqueta="Gastos" total={resumen.totalGastos} />
                  <TarjetaResumen etiqueta="Devoluciones" total={resumen.totalDevoluciones} />
                  <TarjetaResumen etiqueta="Ganancia neta" total={resumen.ganancia} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(resumen.porMetodo).map(([m, total]) => (
                    <span key={m} className={`rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-card ${METODO_COLOR[m] ?? 'text-ink'}`}>
                      {m}: {formatearPrecio(total)}
                    </span>
                  ))}
                  {resumen.totalNoCobrar > 0 && (
                    <span className="rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-card text-muted">
                      No cobrar: {formatearPrecio(resumen.totalNoCobrar)}
                    </span>
                  )}
                </div>

                {ventas.length === 0 ? (
                  <p className="mt-10 text-center text-muted">No hay ventas este día.</p>
                ) : (
                  <ul className="mt-6 space-y-2">
                    {ventas.map((v) => (
                      <li key={v.id}>
                        <div className="flex items-center justify-between gap-4 rounded-3xl bg-card px-5 py-4 shadow-card">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-ink">Venta #{v.id}</p>
                              {v.noCobrar && <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs font-bold text-muted">No cobrar</span>}
                            </div>
                            <p className="mt-1 text-xs text-muted">
                              {formatearFecha(v.fechaHora)} · {v.usuario?.nombre ?? '—'} · {v.pedidoId ? `Pedido #${v.pedidoId}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-ink">{formatearPrecio(v.total)}</p>
                            <p className="text-xs font-semibold text-muted">{v.metodoPago}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'clientes' && (
          <div className="mx-auto max-w-3xl">
            {generando ? (
              <p className="text-muted">Cargando…</p>
            ) : porCliente.length === 0 ? (
              <p className="mt-12 text-center text-muted">Aún no hay pedidos.</p>
            ) : (
              <ul className="space-y-2">
                {porCliente.map((c) => {
                  const expandido = clientesExpandidos.has(c.nombre)
                  return (
                    <li key={c.nombre}>
                      <div className="rounded-3xl bg-card shadow-card">
                        <button type="button" onClick={() => alternarCliente(c.nombre)} className="flex w-full items-center justify-between gap-3 rounded-3xl px-5 py-4 text-left">
                          <div className="min-w-0">
                            <p className="font-bold text-ink">{c.nombre}</p>
                            <p className="mt-0.5 text-xs text-muted">{c.cantidad} pedidos · último {formatearFecha(c.ultimo)}</p>
                          </div>
                          <span className="font-bold text-ink">{formatearPrecio(c.total)}</span>
                        </button>
                        {expandido && (
                          <ul className="border-t border-black/5 px-5 py-3">
                            {c.pedidos.map((p) => (
                              <li key={p.id} className="flex items-center justify-between gap-3 border-b border-black/5 py-2 text-sm last:border-b-0">
                                <span className="min-w-0 truncate text-muted">
                                  Pedido #{p.id} · {formatearFecha(p.fechaHoraCreacion)} · {p.tipo.replaceAll('_', ' ')}
                                </span>
                                <span className="font-semibold text-ink">{formatearPrecio(p.total)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
</li>
                  )
                })}
              </ul>
            )}
        </div>
      )}

      {tab === 'nocobrar' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <p className="text-2xl font-extrabold text-ink">Total: {formatearPrecio(totalNoCobrarGeneral)}</p>
              <Button variant="secondary" size="md" onClick={cargarNoCobrar} disabled={generando}>
                {generando ? 'Cargando…' : 'Actualizar'}
              </Button>
            </div>
            {noCobrar.length === 0 ? (
              <p className="mt-12 text-center text-muted">Sin registros de consumo interno.</p>
            ) : (
              <ul className="space-y-2">
                {noCobrar.map((v) => (
                  <li key={v.id}>
                    <div className="rounded-3xl bg-card px-5 py-4 shadow-card">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-ink">Venta #{v.id} · {formatearFecha(v.fechaHora)}</p>
                          <p className="mt-0.5 text-xs text-muted">Registró: {v.usuario?.nombre ?? '—'} {v.pedidoId ? ` · Pedido #${v.pedidoId}` : ''}</p>
                        </div>
                        <p className="font-bold text-ink">{formatearPrecio(v.total)}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {v.productos.map((p, i) => (
                          <span key={i} className="rounded-full bg-input px-3 py-1 text-xs font-medium text-ink">
                            {p.cantidad}× {p.producto?.nombre ?? p.producto} · {formatearPrecio(p.precioCongelado ?? p.costo)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportesPage