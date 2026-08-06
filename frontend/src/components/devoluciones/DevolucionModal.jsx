import { useEffect, useMemo, useState } from 'react'
import { listarVentas } from '../../services/ventas'
import { formatearFecha, formatearPrecio } from '../../utils/formato'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

const MOTIVOS = ['Producto_mal_estado', 'Pedido_incorrecto', 'Cliente_insatisfecho', 'Otro']
const MEDIOS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Efectivo_de_caja']

function EtiquetaProducto({ linea }) {
  if (linea.esMitadYMitad) {
    const mid = linea.mitadYMitad
    if (mid) {
      return `Mitad y mitad (#${mid.sabor1ProductoId} + #${mid.sabor2ProductoId})`
    }
    return 'Mitad y mitad'
  }
  return linea.producto?.nombre ?? linea.combo?.nombre ?? 'Producto'
}

function DevolucionModal({ abierto, guardando, onClose, onGuardar }) {
  const [ventas, setVentas] = useState([])
  const [buscar, setBuscar] = useState('')
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [monto, setMonto] = useState('')
  const [motivo, setMotivo] = useState('Producto_mal_estado')
  const [regresa, setRegresa] = useState(false)
  const [medio, setMedio] = useState('Efectivo_de_caja')
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto) return
    let activo = true
    setError('')
    listarVentas()
      .then((data) => {
        if (activo) setVentas(data)
      })
      .catch((err) => {
        if (activo) setError(err.message)
      })
    return () => {
      activo = false
    }
  }, [abierto])

  const ventasFiltradas = useMemo(() => {
    const termino = buscar.trim().toLowerCase()
    if (!termino) return ventas.slice(0, 10)
    return ventas.filter((v) => v.id.toString().includes(termino)).slice(0, 10)
  }, [ventas, buscar])

  const elegirVenta = (v) => {
    setVentaSeleccionada(v)
    setMonto(String(v.total))
    setSeleccionados(new Set())
  }

  const alternarProducto = (id) => {
    setSeleccionados((prev) => {
      const copia = new Set(prev)
      if (copia.has(id)) copia.delete(id)
      else copia.add(id)
      return copia
    })
  }

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    if (!ventaSeleccionada) return setError('Selecciona la venta a devolver')
    const montoNum = Number(monto)
    if (!Number.isFinite(montoNum) || montoNum < 0) return setError('El monto no es válido')
    if (montoNum > ventaSeleccionada.total) return setError('El monto no puede exceder el total de la venta')

    onGuardar({
      ventaId: ventaSeleccionada.id,
      monto: montoNum,
      motivo,
      regresaAInventario: regresa,
      medioDevolucion: medio,
      ventaProductoIds: regresa && seleccionados.size > 0 ? [...seleccionados] : undefined,
    })
  }

  return (
    <Modal
      open={abierto}
      onClose={onClose}
      title="Registrar devolución"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" size="md" onClick={enviar} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Registrar devolución'}
          </Button>
        </>
      }
    >
      <form onSubmit={enviar} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        {!ventaSeleccionada ? (
          <div>
            <Input
              id="buscar-venta"
              label="Venta a devolver"
              type="search"
              placeholder="Buscar por número de venta…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              autoFocus
            />
            <div className="mt-2 max-h-52 space-y-2 overflow-y-auto">
              {ventasFiltradas.length === 0 ? (
                <p className="py-3 text-center text-sm text-muted">Sin ventas disponibles.</p>
              ) : (
                ventasFiltradas.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => elegirVenta(v)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-input px-4 py-3 text-left transition active:bg-muted/20"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">Venta #{v.id}</p>
                      <p className="text-xs text-muted">{formatearFecha(v.fechaHora)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink">{formatearPrecio(v.total)}</p>
                      <p className="text-xs text-muted">{v.metodoPago}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-input px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Venta #{ventaSeleccionada.id}</span>
                <span className="font-bold text-ink">{formatearPrecio(ventaSeleccionada.total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {formatearFecha(ventaSeleccionada.fechaHora)} · {ventaSeleccionada.metodoPago}
              </p>
              <button type="button" onClick={() => setVentaSeleccionada(null)} className="mt-2 text-xs font-semibold text-accent">
                Cambiar venta
              </button>
            </div>

            <Input
              id="monto-devolucion"
              label="Monto a devolver ($)"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-muted">Motivo</p>
              <div className="flex flex-wrap gap-2">
                {MOTIVOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMotivo(m)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      motivo === m ? 'bg-accent text-white' : 'bg-input text-muted'
                    }`}
                  >
                    {m.replaceAll('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-muted">¿Regresa a inventario?</p>
              <div className="flex rounded-2xl bg-input p-1">
                {[
                  { valor: false, etiqueta: 'No' },
                  { valor: true, etiqueta: 'Sí' },
                ].map((o) => (
                  <button
                    key={o.etiqueta}
                    type="button"
                    onClick={() => setRegresa(o.valor)}
                    className={`flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                      regresa === o.valor ? 'bg-card text-ink shadow-card' : 'text-muted'
                    }`}
                  >
                    {o.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            {regresa && (
              <div>
                <p className="mb-2 text-sm font-medium text-muted">
                  ¿Qué productos regresan? <span className="font-normal">(ninguno = devolución completa)</span>
                </p>
                <div className="space-y-2">
                  {ventaSeleccionada.productos.map((linea) => (
                    <label
                      key={linea.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-input px-4 py-3"
                    >
                      <span className="text-sm text-ink">
                        {linea.cantidad} × <EtiquetaProducto linea={linea} />
                      </span>
                      <input
                        type="checkbox"
                        checked={seleccionados.has(linea.id)}
                        onChange={() => alternarProducto(linea.id)}
                        className="h-5 w-5 accent-accent"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-muted">Medio de devolución</p>
              <div className="flex flex-wrap gap-2">
                {MEDIOS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMedio(m)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      medio === m ? 'bg-accent text-white' : 'bg-input text-muted'
                    }`}
                  >
                    {m.replaceAll('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  )
}

export default DevolucionModal